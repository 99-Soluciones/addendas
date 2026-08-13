import { apiFetch } from "./client";
import type { DashboardStats } from "../types";

export const dashboardApi = {
  stats: () => apiFetch<DashboardStats>("/dashboard/stats"),
};
