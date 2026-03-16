import { apiFetch } from './api';
import type { ApiUser, UpdateUserBody, UserQuery, PaginationMeta } from '../types/api';

export async function fetchUsers(
  query: UserQuery = {},
  token: string
): Promise<{ data: ApiUser[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.role) params.set('role', query.role);
  if (query.isActive !== undefined) params.set('isActive', query.isActive);
  if (query.search) params.set('search', query.search);
  const json = await apiFetch<{ success: boolean; data: ApiUser[]; meta: PaginationMeta }>(
    `/api/v1/users?${params}`,
    { token },
  );
  return { data: json.data, meta: json.meta };
}

export async function fetchUser(id: string, token: string): Promise<ApiUser> {
  const json = await apiFetch<{ success: boolean; data: ApiUser }>(`/api/v1/users/${id}`, { token });
  return json.data;
}

export async function updateUser(id: string, body: UpdateUserBody, token: string): Promise<ApiUser> {
  const json = await apiFetch<{ success: boolean; data: ApiUser }>(
    `/api/v1/users/${id}`,
    { method: 'PUT', body, token },
  );
  return json.data;
}

export async function deleteUser(id: string, token: string): Promise<void> {
  await apiFetch<void>(`/api/v1/users/${id}`, { method: 'DELETE', token });
}
