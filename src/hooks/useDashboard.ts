import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DashboardOverview } from "@/types/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      return apiFetch<DashboardOverview>("/v1/dashboard/overview");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
