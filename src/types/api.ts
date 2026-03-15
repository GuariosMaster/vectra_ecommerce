export interface ApiCategory {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
}

export interface ApiProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface ApiProduct {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  shortDescEs: string;
  shortDescEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  inStock: boolean;
  featured: boolean;
  material?: string;
  dimensions?: string;
  weight?: string;
  printTime?: string;
  categoryId: string;
  category: ApiCategory;
  images: ApiProductImage[];
  tags: { tag: ApiCategory }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListQuery {
  lang?: 'ES' | 'EN';
  category?: string;
  featured?: 'true' | 'false';
  inStock?: 'true' | 'false';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  slug: string;
  nameEs: string;
  nameEn: string;
  shortDescEs: string;
  shortDescEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: number;
  comparePrice?: number;
  stock: number;
  inStock: boolean;
  featured: boolean;
  material?: string;
  dimensions?: string;
  weight?: string;
  printTime?: string;
  categoryId: string;
  tagIds: string[];
  images?: File[];
}

export interface ApiTag {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
}

export interface ApiPost {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  contentEs: string;
  contentEn: string;
  coverImage: string;
  author: string;
  draft: boolean;
  publishedAt: string | null;
  tags: { tag: ApiTag }[];
  createdAt: string;
  updatedAt: string;
}

export interface PostFormData {
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  contentEs: string;
  contentEn: string;
  coverImage: string;
  author: string;
  draft: boolean;
  tagIds: string[];
}

// Shape que espera ProductCatalog.tsx — NO modificar
export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  shortDescription: string;
  image: string;
  featured: boolean;
}
