import { apiFetch } from './api';

export async function fetchSettings(): Promise<Record<string, string>> {
  const res = await apiFetch<{ data: Record<string, string> }>('/api/v1/settings');
  return (res as unknown as { data: Record<string, string> }).data ?? (res as unknown as Record<string, string>);
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
  return (res as unknown as { data: Record<string, string> }).data ?? (res as unknown as Record<string, string>);
}
