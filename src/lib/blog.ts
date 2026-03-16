import { apiFetch } from './api';
import type { ApiPost, PostFormData, PaginationMeta } from '../types/api';

export interface BlogListQuery {
  lang?: 'ES' | 'EN';
  draft?: 'true' | 'false';
  tag?: string;
  page?: number;
  limit?: number;
}

export async function fetchPosts(
  query?: BlogListQuery,
  token?: string,
): Promise<{ data: ApiPost[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return apiFetch<{ data: ApiPost[]; meta: PaginationMeta }>(
    `/api/v1/blog${qs ? `?${qs}` : ''}`,
    token ? { token } : undefined,
  );
}

export async function fetchPostBySlug(slug: string): Promise<ApiPost> {
  const res = await apiFetch<{ data: ApiPost }>(`/api/v1/blog/${slug}`);
  return res.data;
}

export async function createPost(form: PostFormData, token: string): Promise<ApiPost> {
  const res = await apiFetch<{ data: ApiPost }>('/api/v1/blog', {
    method: 'POST',
    body: form,
    token,
  });
  return res.data;
}

export async function updatePost(
  id: string,
  form: Partial<PostFormData>,
  token: string,
): Promise<ApiPost> {
  const res = await apiFetch<{ data: ApiPost }>(`/api/v1/blog/${id}`, {
    method: 'PUT',
    body: form,
    token,
  });
  return res.data;
}

export async function deletePost(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/v1/blog/${id}`, { method: 'DELETE', token });
}

export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
