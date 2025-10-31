import prisma from "../../prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ==========================
// ======= HELPERS =========
// ==========================

const decimalToNumber = (v: Decimal | number | null | undefined) =>
  v == null ? 0 : v instanceof Decimal ? v.toNumber() : Number(v);

const calcVariation = (current: number, previous: number) => {
  if (previous === 0 || !isFinite(previous)) {
    return { result: +current.toFixed(2), variation: 0, isPositive: current >= 0 };
  }
  let variation = ((current - previous) / previous) * 100;
  variation = Math.max(Math.min(variation, 60), -60);
  return {
    result: +current.toFixed(2),
    variation: +variation.toFixed(2),
    isPositive: variation >= 0,
  };
};

// ==========================
// ======= GEO UTILS ========
// ==========================

async function fetchCoordinatesBatch(
  addresses: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    country?: string;
    title: string;
  }[],
  concurrency = 3 // reduzir para evitar bloqueio do Nominatim
) {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const results: { lat: number; lng: number; info: string }[] = [];
  let active = 0;

  async function worker(addr: any) {
    const fullAddress = `${addr.street}, ${addr.number}, ${addr.city}, ${addr.state}, ${addr.country}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      fullAddress
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "MeuSistemaImobiliario/1.0 (https://seudominio.com)",
          "Accept-Language": "pt-BR",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.warn("⚠️ Falha ao buscar coordenadas:", res.status, res.statusText);
        return;
      }

      // Garantir que o retorno é JSON
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("⚠️ Resposta inválida (HTML retornado pelo Nominatim)");
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        results.push({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          info: `${addr.title} (${addr.city}/${addr.state})`,
        });
      } else {
        console.warn("⚠️ Nenhum resultado de coordenadas:", fullAddress);
      }
    } catch (err) {
      console.error("❌ Erro coordenadas:", err);
      // retry leve em caso de erro de rede
      await delay(1000);
      return worker(addr);
    } finally {
      active--;
    }
  }

  for (const addr of addresses) {
    while (active >= concurrency) await delay(300); // throttle mais lento
    active++;
    worker(addr);
  }

  while (active > 0) await delay(500);
  return results;
}

// ==========================
// ====== MAIN FUNC =========
// ==========================

export async function fetchDashboardMetricsByPeriod(startDate: Date, endDate: Date) {
  const diffMs = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - diffMs - 1);
  const prevEndDate = new Date(startDate.getTime() - 1);

  // -------------------------------
  // Consultas Prisma em paralelo
  // -------------------------------
  const [
    properties,
    prevProperties,
    owners,
    prevOwners,
    tenants,
    prevTenants,
    agencies,
    prevAgencies,
  ] = await Promise.all([
    prisma.property.findMany({
      where: { created_at: { gte: startDate, lte: endDate } },
      select: {
        id: true,
        title: true,
        area_total: true,
        type: { select: { description: true } },
        values: {
          select: {
            rental_value: true,
            property_tax: true,
            condo_fee: true,
            purchase_value: true,
            sale_value: true,
            current_status: true,
          },
        },
        addresses: {
          select: {
            address: {
              select: { street: true, number: true, city: true, state: true, country: true },
            },
          },
        },
        documents: { select: { file_type: true } },
        agency: { select: { id: true, legal_name: true, trade_name: true } },
      },
    }),
    prisma.property.findMany({
      where: { created_at: { gte: prevStartDate, lte: prevEndDate } },
      select: {
        id: true,
        title: true,
        values: {
          select: {
            rental_value: true,
            property_tax: true,
            condo_fee: true,
            purchase_value: true,
            sale_value: true,
            current_status: true,
          },
        },
        documents: { select: { file_type: true } },
        type: { select: { description: true } },
        agency: { select: { id: true } },
        addresses: {
          select: {
            address: { select: { street: true, number: true, city: true, state: true, country: true } },
          },
        },
      },
    }),
    prisma.owner.findMany({ where: { created_at: { gte: startDate, lte: endDate } }, select: { id: true } }),
    prisma.owner.findMany({ where: { created_at: { gte: prevStartDate, lte: prevEndDate } }, select: { id: true } }),
    prisma.tenant.findMany({ where: { created_at: { gte: startDate, lte: endDate } }, select: { id: true } }),
    prisma.tenant.findMany({ where: { created_at: { gte: prevStartDate, lte: prevEndDate } }, select: { id: true } }),
    prisma.agency.findMany({
      where: { created_at: { gte: startDate, lte: endDate } },
      select: { id: true, legal_name: true, trade_name: true },
    }),
    prisma.agency.findMany({
      where: { created_at: { gte: prevStartDate, lte: prevEndDate } },
      select: { id: true },
    }),
  ]);

  // -------------------------------
  // Processamentos
  // -------------------------------
  const toNum = (v: any) => decimalToNumber(v);

  const rentals = properties.flatMap((p) => p.values?.map((v) => toNum(v.rental_value)) || []);
  const prevRentals = prevProperties.flatMap((p) => p.values?.map((v) => toNum(v.rental_value)) || []);
  const avgRental = rentals.length > 0 ? rentals.reduce((a, b) => a + b, 0) / rentals.length : 0;
  const prevAvgRental = prevRentals.length > 0 ? prevRentals.reduce((a, b) => a + b, 0) / prevRentals.length : 0;

  const averageRentalTicket = calcVariation(avgRental, prevAvgRental);

  const totalRentalActive = calcVariation(
    properties.reduce((a, p) => a + toNum(p.values?.[0]?.rental_value), 0),
    prevProperties.reduce((a, p) => a + toNum(p.values?.[0]?.rental_value), 0)
  );

  const totalAcquisitionValue = calcVariation(
    properties.reduce((a, p) => a + toNum(p.values?.[0]?.purchase_value), 0),
    prevProperties.reduce((a, p) => a + toNum(p.values?.[0]?.purchase_value), 0)
  );

  const totalPropertyTaxAndCondoFee = calcVariation(
    properties.reduce(
      (a, p) =>
        a + (p.values?.reduce((s, v) => s + toNum(v.property_tax) + toNum(v.condo_fee), 0) ?? 0),
      0
    ),
    prevProperties.reduce(
      (a, p) =>
        a + (p.values?.reduce((s, v) => s + toNum(v.property_tax) + toNum(v.condo_fee), 0) ?? 0),
      0
    )
  );

  const totalPotentialRentUnoccupied = properties.reduce(
    (a, p) =>
      a + (p.values?.[0]?.current_status === "AVAILABLE" ? toNum(p.values?.[0]?.rental_value) : 0),
    0
  );

  const prevTotalPotentialRentUnoccupied = prevProperties.reduce(
    (a, p) =>
      a + (p.values?.[0]?.current_status === "AVAILABLE" ? toNum(p.values?.[0]?.rental_value) : 0),
    0
  );

  const vacancyInMonths = calcVariation(
    avgRental ? totalPotentialRentUnoccupied / avgRental : 0,
    avgRental ? prevTotalPotentialRentUnoccupied / avgRental : 0
  );

  const financialVacancyRate = calcVariation(
    totalRentalActive.result
      ? (totalPotentialRentUnoccupied / totalRentalActive.result) * 100
      : 0,
    totalRentalActive.result
      ? (prevTotalPotentialRentUnoccupied / totalRentalActive.result) * 100
      : 0
  );

  const totalPropertys = calcVariation(properties.length, prevProperties.length);
  const countPropertiesWithLessThan3Docs = calcVariation(
    properties.filter((p) => (p.documents?.length || 0) < 3).length,
    prevProperties.filter((p) => (p.documents?.length || 0) < 3).length
  );

  const totalPropertiesWithSaleValue = calcVariation(
    properties.filter((p) => p.values?.some((v) => toNum(v.sale_value) > 0)).length,
    prevProperties.filter((p) => p.values?.some((v) => toNum(v.sale_value) > 0)).length
  );

  const propertiesPerOwner = calcVariation(
    properties.length / (owners.length || 1),
    prevProperties.length / (prevOwners.length || 1)
  );

  const availablePropertiesByType = Object.entries(
    properties.reduce((acc: Record<string, number>, p) => {
      const isAvailable = p.values?.[0]?.current_status === "AVAILABLE";
      const type = p.type?.description || "Desconhecido";
      if (isAvailable) acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const propertiesByAgency = agencies.map((agency) => ({
    name: agency.trade_name || agency.legal_name || `Agência ${agency.id}`,
    value: properties.filter((p) => p.agency?.id === agency.id).length,
  }));

  // ======== GEOLOC ========
  const flattenedAddresses = properties.flatMap((p) =>
    p.addresses.map((a) => ({
      ...a.address,
      number: a.address.number?.toString(),
      title: p.title,
    }))
  );

  const geolocationData = await fetchCoordinatesBatch(flattenedAddresses, 3);

  // ======== RETORNO ========
  return {
    averageRentalTicket,
    totalRentalActive,
    totalAcquisitionValue,
    financialVacancyRate,
    totalPropertyTaxAndCondoFee,
    vacancyInMonths,
    totalPropertys,
    countPropertiesWithLessThan3Docs,
    totalPropertiesWithSaleValue,
    ownersTotal: calcVariation(owners.length, prevOwners.length),
    tenantsTotal: calcVariation(tenants.length, prevTenants.length),
    propertiesPerOwner,
    agenciesTotal: calcVariation(agencies.length, prevAgencies.length),
    availablePropertiesByType,
    propertiesByAgency,
    geolocationData,
  };
}
