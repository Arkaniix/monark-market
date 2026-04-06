import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import type {
  RepairCategory,
  RepairSymptom,
  RepairGuideResponse,
  DeepDiagnosticRequest,
  DeepDiagnosticResponse,
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
