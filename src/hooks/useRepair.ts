import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import type {
  RepairCategory,
  RepairSymptom,
  RepairGuideResponse,
  DeepDiagnosticRequest,
  DeepDiagnosticResponse,
  RepairHistoryPage,
  RepairOutcomePayload,
} from "@/types/repair";

export function useSymptoms(category: RepairCategory | null) {
  return useQuery<RepairSymptom[]>({
    queryKey: ["repair", "symptoms", category],
    queryFn: () => apiGet<RepairSymptom[]>(`/v1/repair/symptoms?category=${category}`),
    enabled: !!category,
  });
}

export function useRepairGuide(symptomSlug: string | null) {
  return useQuery<RepairGuideResponse>({
    queryKey: ["repair", "guide", symptomSlug],
    queryFn: () => apiGet<RepairGuideResponse>(`/v1/repair/guide/${symptomSlug}`),
    enabled: !!symptomSlug,
  });
}

export function useDeepDiagnostic() {
  return useMutation<DeepDiagnosticResponse, Error, DeepDiagnosticRequest>({
    mutationFn: (req) => apiPost<DeepDiagnosticResponse>("/v1/repair/deep-diagnostic", req),
  });
}

export function useRepairHistory(params: {
  limit: number;
  offset: number;
  usedDeep?: boolean | null;
  outcome?: string | null;
}) {
  const qs = new URLSearchParams();
  qs.set("limit", String(params.limit));
  qs.set("offset", String(params.offset));
  if (params.usedDeep === true) qs.set("used_deep", "true");
  if (params.usedDeep === false) qs.set("used_deep", "false");
  if (params.outcome) qs.set("outcome", params.outcome);

  return useQuery<RepairHistoryPage>({
    queryKey: ["repair", "history", params],
    queryFn: () => apiGet<RepairHistoryPage>(`/v1/repair/history?${qs.toString()}`),
  });
}

export function useRepairOutcome() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; payload: RepairOutcomePayload }>({
    mutationFn: ({ id, payload }) =>
      apiPost<void>(`/v1/repair/history/${id}/outcome`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repair", "history"] });
    },
  });
}
