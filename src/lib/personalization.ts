import { apiFetch } from './api';
import type {
  ApiPersonalizationRequest,
  PersonalizationQuery,
  UpdatePersonalizationBody,
  PaginationMeta,
} from '../types/api';

export async function submitPersonalizationRequest(
  formData: FormData,
): Promise<ApiPersonalizationRequest> {
  const json = await apiFetch<{ success: boolean; data: ApiPersonalizationRequest }>(
    '/api/v1/personalization',
    { method: 'POST', body: formData },
  );
  return json.data;
}

export async function fetchPersonalizationRequests(
  query: PersonalizationQuery = {},
  token: string,
): Promise<{ data: ApiPersonalizationRequest[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);

  const json = await apiFetch<{ success: boolean; data: ApiPersonalizationRequest[]; meta: PaginationMeta }>(
    `/api/v1/personalization?${params.toString()}`,
    { token },
  );
  return { data: json.data, meta: json.meta };
}

export async function updatePersonalizationRequest(
  id: string,
  body: UpdatePersonalizationBody,
  token: string,
): Promise<ApiPersonalizationRequest> {
  const json = await apiFetch<{ success: boolean; data: ApiPersonalizationRequest }>(
    `/api/v1/personalization/${id}`,
    { method: 'PUT', body, token },
  );
  return json.data;
}

export async function deletePersonalizationRequest(id: string, token: string): Promise<void> {
  await apiFetch<void>(`/api/v1/personalization/${id}`, {
    method: 'DELETE',
    token,
  });
}
