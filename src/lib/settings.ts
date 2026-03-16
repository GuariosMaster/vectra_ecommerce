import { apiFetch } from './api';

export async function fetchSettings(): Promise<Record<string, string>> {
  const res = await apiFetch<{ data: Record<string, string> }>('/api/v1/settings');
  return res.data;
}

export async function saveSettings(
  data: Record<string, string>,
  token: string,
): Promise<Record<string, string>> {
  const res = await apiFetch<{ data: Record<string, string> }>('/api/v1/settings', {
    method: 'PUT',
    body: data,
    token,
  });
  return res.data;
}
