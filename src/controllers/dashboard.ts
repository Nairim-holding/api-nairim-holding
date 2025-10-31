import { Request, Response } from "express";
import { fetchDashboardGeolocation, fetchDashboardMetricsByPeriod } from "../models/dashboard";

export class DashboardController {
  static async getMetrics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: "startDate e endDate são obrigatórios" });
      } else {
        const metrics = await fetchDashboardMetricsByPeriod(
            new Date(startDate as string),
            new Date(endDate as string)
        );

        res.json(metrics);
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar métricas" });
    }
  }
  static async getGeolocation(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const geoloc = await fetchDashboardGeolocation(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(geoloc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar geolocalização" });
    }
  }

}
