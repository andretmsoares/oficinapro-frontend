import { api } from "./api";
import type { DashboardData } from "../types/dashboard/dashboard";

export async function buscarDadosDashboard(): Promise<DashboardData> {
  return api<DashboardData>("/dashboard/data");
}
