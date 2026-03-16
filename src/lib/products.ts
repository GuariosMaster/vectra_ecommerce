import { apiFetch } from './api';
import type { ApiProduct, ApiCategory, CatalogProduct, ProductFormData, ProductListQuery, PaginationMeta } from '../types/api';

// ─── Public endpoints (no token) ───────────────────────────────────────────

export async function fetchProducts(
  query?: ProductListQuery,
): Promise<{ data: ApiProduct[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return apiFetch<{ data: ApiProduct[]; meta: PaginationMeta }>(
    `/api/v1/products${qs ? `?${qs}` : ''}`,
  );
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct> {
  const res = await apiFetch<{ data: ApiProduct }>(`/api/v1/products/${slug}`);
  return res.data;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await apiFetch<{ data: ApiCategory[] }>('/api/v1/categories');
  return res.data;
}

// ─── Admin endpoints (require token) ────────────────────────────────────────

export async function createProduct(form: ProductFormData, token: string): Promise<ApiProduct> {
  const body = toFormData(form);
  const res = await apiFetch<{ data: ApiProduct }>('/api/v1/products', {
    method: 'POST',
    body,
    token,
  });
  return res.data;
}

export async function updateProduct(
  id: string,
  form: Partial<ProductFormData>,
  token: string,
): Promise<ApiProduct> {
  const body = toFormData(form);
  const res = await apiFetch<{ data: ApiProduct }>(`/api/v1/products/${id}`, {
    method: 'PUT',
    body,
    token,
  });
  return res.data;
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/api/v1/products/${id}`, { method: 'DELETE', token });
}

// ─── Mapper ─────────────────────────────────────────────────────────────────

export function apiProductToCatalog(p: ApiProduct, lang: 'es' | 'en'): CatalogProduct {
  return {
    id: p.slug,
    name: lang === 'es' ? p.nameEs : p.nameEn,
    price: Number(p.price),
    category: p.category.slug,
    inStock: p.inStock,
    shortDescription: lang === 'es' ? p.shortDescEs : p.shortDescEn,
    image: p.images[0]?.url ?? '/images/placeholder.svg',
    featured: p.featured,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toFormData(data: Partial<ProductFormData>): FormData {
  const fd = new FormData();
  const { images, tagIds, ...rest } = data;

  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });

  if (tagIds) tagIds.forEach((id) => fd.append('tagIds', id));
  if (images) images.forEach((file) => fd.append('images', file));

  return fd;
}
