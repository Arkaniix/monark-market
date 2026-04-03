import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type {
  InventoryPage,
  InventoryStats,
  InventoryFilters,
  CreateInventoryPayload,
  ListItemPayload,
  SellItemPayload,
  UpdateInventoryPayload,
  TransactionPage,
  TransactionFilters,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "@/types/inventory";

// ============= Queries =============

export function useInventoryList(filters: InventoryFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(filters.offset ?? 0));

  const qs = params.toString();
  return useQuery<InventoryPage>({
    queryKey: ["inventory", "list", filters],
    queryFn: () => apiFetch<InventoryPage>(`/v1/inventory?${qs}`),
  });
}

export function useInventoryStats(days: number) {
  return useQuery<InventoryStats>({
    queryKey: ["inventory", "stats", days],
    queryFn: () => apiFetch<InventoryStats>(`/v1/inventory/stats?days=${days}`),
  });
}

// ============= Model search for autocomplete =============
export interface ModelAutocompleteResult {
  id: number;
  name: string;
  label: string;
  manufacturer: string;
  family?: string;
  category_id?: number;
}

export function useModelSearch(query: string) {
  return useQuery<ModelAutocompleteResult[]>({
    queryKey: ["models", "autocomplete", query],
    queryFn: () => apiFetch<ModelAutocompleteResult[]>(`/v1/models/autocomplete?q=${encodeURIComponent(query)}&limit=10`),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

// ============= Transactions Queries =============

export function useTransactionList(filters: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(filters.offset ?? 0));

  const qs = params.toString();
  return useQuery<TransactionPage>({
    queryKey: ["inventory", "transactions", filters],
    queryFn: () => apiFetch<TransactionPage>(`/v1/inventory/transactions?${qs}`),
  });
}

// ============= Mutations =============

function useInvalidateInventory() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["inventory"] });
  };
}

export function useCreateItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (payload: CreateInventoryPayload) =>
      apiFetch("/v1/inventory", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
}

export function useListItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ id, ...payload }: ListItemPayload & { id: number }) =>
      apiFetch(`/v1/inventory/${id}/list`, { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
}

export function useUnlistItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/v1/inventory/${id}/unlist`, { method: "POST" }),
    onSuccess: invalidate,
  });
}

export function useSellItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ id, ...payload }: SellItemPayload & { id: number }) =>
      apiFetch(`/v1/inventory/${id}/sell`, { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
}

export function useUpdateItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateInventoryPayload & { id: number }) =>
      apiFetch(`/v1/inventory/${id}`, { method: "PATCH", body: payload }),
    onSuccess: invalidate,
  });
}

export function useDeleteItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/v1/inventory/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

// ============= Transaction Mutations =============

export function useCreateTransaction() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      apiFetch("/v1/inventory/transactions", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateTransactionPayload & { id: number }) =>
      apiFetch(`/v1/inventory/transactions/${id}`, { method: "PATCH", body: payload }),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/v1/inventory/transactions/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
