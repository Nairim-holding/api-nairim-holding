import prisma from "../../prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

interface PropertyValue {
  rental_value: number;
  current_status?: "AVAILABLE" | "OCCUPIED";
  property_tax?: number;
  condo_fee?: number;
  purchase_value?: number;
  sale_value?: number;
}

interface Address {
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface Document {
  file_type: string;
}

interface Agency {
  id: number;
  legal_name?: string;
}

interface PropertyType {
  description?: string;
}

interface Property {
  id: number;
  title: string;
  type?: PropertyType;
  area_total?: number;
  values?: PropertyValue[];
  addresses?: Address[];
  documents?: Document[];
  agency?: Agency | null;
}

function decimalToNumber(value: Decimal | number | null | undefined): number {
  if (value == null) return 0;
  if (value instanceof Decimal) return value.toNumber();
  return Number(value);
}

function mapAddresses(rawAddresses: any[]): Address[] {
  return rawAddresses.map(a => ({
    street: a.address?.street,
    number: a.address?.number,
    city: a.address?.city,
    state: a.address?.state,
    country: a.address?.country,
  }));
}

async function fetchCoordinates(addresses: Address[], title: string) {
  const coords: { lat: number; lng: number; info: string }[] = [];
  for (const addr of addresses) {
    const fullAddress = `${addr.street}, ${addr.number}, ${addr.city}, ${addr.state}, ${addr.country}`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        coords.push({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          info: `${title} (${addr.city}/${addr.state})`,
        });
      }
    } catch (error) {
      console.error("Erro ao obter coordenadas:", error);
    }
  }
  return coords;
}

export async function fetchDashboardMetricsByPeriod(startDate: Date, endDate: Date) {
  const diffMs = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - diffMs - 1);
  const prevEndDate = new Date(startDate.getTime() - 1);

  async function fetchProperties(start: Date, end: Date) {
    const rawProperties = await prisma.property.findMany({
      where: { created_at: { gte: start, lte: end } },
      include: {
        values: true,
        addresses: { include: { address: true } },
        agency: true,
        documents: true,
        type: true,
      },
    });

    return rawProperties.map(p => ({
      id: p.id,
      title: p.title,
      type: p.type ? { description: p.type.description } : undefined,
      area_total: p.area_total,
      values: p.values?.map(v => ({
        rental_value: decimalToNumber(v.rental_value),
        current_status: v.current_status as "AVAILABLE" | "OCCUPIED",
        property_tax: decimalToNumber(v.property_tax),
        condo_fee: decimalToNumber(v.condo_fee),
        purchase_value: decimalToNumber(v.purchase_value),
        sale_value: decimalToNumber(v.sale_value),
      })),
      addresses: mapAddresses(p.addresses),
      documents: p.documents?.map(d => ({ file_type: d.file_type })),
      agency: p.agency ? { id: p.agency.id, legal_name: p.agency.legal_name } : null,
    }));
  }

  const [properties, prevProperties] = await Promise.all([
    fetchProperties(startDate, endDate),
    fetchProperties(prevStartDate, prevEndDate),
  ]);

  const owners = await prisma.owner.findMany({ where: { created_at: { gte: startDate, lte: endDate } } });
  const prevOwners = await prisma.owner.findMany({ where: { created_at: { gte: prevStartDate, lte: prevEndDate } } });

  const tenants = await prisma.tenant.findMany({ where: { created_at: { gte: startDate, lte: endDate } } });
  const prevTenants = await prisma.tenant.findMany({ where: { created_at: { gte: prevStartDate, lte: prevEndDate } } });

  const agencies = await prisma.agency.findMany({ where: { created_at: { gte: startDate, lte: endDate } } });
  const prevAgencies = await prisma.agency.findMany({ where: { created_at: { gte: prevStartDate, lte: prevEndDate } } });

  const calcVariation = (current: number, previous: number) => {
    const variation = previous ? ((current - previous) / previous) * 100 : 0;
    return {
      result: current,
      variation,
      isPositive: variation >= 0
    };
  };

  // MÉTRICAS FINANCEIRAS
  const allRentalValues = properties.flatMap(p => p.values?.map(v => v.rental_value) || []);
  const prevRentalValues = prevProperties.flatMap(p => p.values?.map(v => v.rental_value) || []);
  const averageRentalTicket = calcVariation(
    allRentalValues.length ? allRentalValues.reduce((a, b) => a + b, 0) / allRentalValues.length : 0,
    prevRentalValues.length ? prevRentalValues.reduce((a, b) => a + b, 0) / prevRentalValues.length : 0
  );

  const totalRentalActive = properties.reduce((acc, p) => acc + (p.values?.[0]?.rental_value || 0), 0);
  const prevTotalRentalActive = prevProperties.reduce((acc, p) => acc + (p.values?.[0]?.rental_value || 0), 0);
  const totalRentalActiveMetric = calcVariation(totalRentalActive, prevTotalRentalActive);

  const totalAcquisitionValue = properties.reduce((acc, p) => acc + (p.values?.[0]?.purchase_value || 0), 0);
  const prevTotalAcquisitionValue = prevProperties.reduce((acc, p) => acc + (p.values?.[0]?.purchase_value || 0), 0);
  const totalAcquisitionValueMetric = calcVariation(totalAcquisitionValue, prevTotalAcquisitionValue);

  const totalPropertyTaxAndCondoFee = calcVariation(
    properties.reduce((acc, property) => acc + (property.values?.reduce((s, v) => s + (v.property_tax || 0) + (v.condo_fee || 0), 0) ?? 0), 0),
    prevProperties.reduce((acc, property) => acc + (property.values?.reduce((s, v) => s + (v.property_tax || 0) + (v.condo_fee || 0), 0) ?? 0), 0)
  );

  const totalPotentialRentUnoccupied = properties.reduce(
    (acc, property) => acc + (property.values?.[0]?.current_status === "AVAILABLE" ? property.values?.[0]?.rental_value || 0 : 0),
    0
  );
  const prevTotalPotentialRentUnoccupied = prevProperties.reduce(
    (acc, property) => acc + (property.values?.[0]?.current_status === "AVAILABLE" ? property.values?.[0]?.rental_value || 0 : 0),
    0
  );
  const vacancyInMonths = calcVariation(
    averageRentalTicket.result ? totalPotentialRentUnoccupied / averageRentalTicket.result : 0,
    averageRentalTicket.result ? prevTotalPotentialRentUnoccupied / averageRentalTicket.result : 0
  );

  const financialVacancyRate = calcVariation(
    totalRentalActive ? (totalPotentialRentUnoccupied / totalRentalActive) * 100 : 0,
    prevTotalRentalActive ? (prevTotalPotentialRentUnoccupied / prevTotalRentalActive) * 100 : 0
  );

  const totalPropertys = calcVariation(properties.length, prevProperties.length);

  const countPropertiesWithLessThan3Docs = calcVariation(
    properties.filter(p => (p.documents?.filter(d => d.file_type === "application/pdf") ?? []).length < 3).length,
    prevProperties.filter(p => (p.documents?.filter(d => d.file_type === "application/pdf") ?? []).length < 3).length
  );

  const totalPropertiesWithSaleValue = calcVariation(
    properties.filter(p => p.values?.some(v => (v.sale_value || 0) > 0)).length,
    prevProperties.filter(p => p.values?.some(v => (v.sale_value || 0) > 0)).length
  );

  const propertiesPerOwner = calcVariation(
    properties.length / (owners.length || 1),
    prevProperties.length / (prevOwners.length || 1)
  );

  // COORDENADAS
  const allCoords = await Promise.all(properties.map(p => fetchCoordinates(p.addresses || [], p.title)));
  const geolocationData = allCoords.flat();

  return {
    averageRentalTicket,
    totalRentalActive: totalRentalActiveMetric,
    totalAcquisitionValue: totalAcquisitionValueMetric,
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
    properties,
    owners,
    tenants,
    agencies,
    geolocationData
  };
}
