import { apiFetch } from './api';
import type { ApiOrder, CreateOrderBody, OrderQuery, OrderStatus, PaginationMeta } from '../types/api';

export async function createOrder(body: CreateOrderBody): Promise<ApiOrder> {
  return apiFetch<ApiOrder>('/api/v1/orders', { method: 'POST', body });
}

export async function fetchOrders(
  query: OrderQuery = {},
  token: string
): Promise<{ data: ApiOrder[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  const json = await apiFetch<{ success: boolean; data: ApiOrder[]; meta: PaginationMeta }>(
    `/api/v1/orders?${params}`,
    { token },
  );
  return { data: json.data, meta: json.meta };
}

export async function getOrder(id: string): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/api/v1/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  token: string
): Promise<ApiOrder> {
  const json = await apiFetch<{ success: boolean; data: ApiOrder }>(
    `/api/v1/orders/${id}/status`,
    { method: 'PUT', body: { status }, token },
  );
  return json.data;
}

export async function createMpPreference(
  orderId: string
): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }> {
  return apiFetch(`/api/v1/payments/mp/preference`, {
    method: 'POST',
    body: { orderId },
  });
}
