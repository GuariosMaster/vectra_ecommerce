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
  nameEn?: string;
  shortDescEs: string;
  shortDescEn?: string;
  descriptionEs: string;
  descriptionEn?: string;
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
  titleEn?: string;
  excerptEs: string;
  excerptEn?: string;
  contentEs: string;
  contentEn?: string;
  coverImage: string;
  author: string;
  draft: boolean;
  tagIds: string[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface ApiShippingAddress {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  product: { slug: string; nameEs: string } | null;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paymentId: string | null;
  subtotal: number;
  total: number;
  notes: string | null;
  guestEmail: string | null;
  userId: string | null;
  items: ApiOrderItem[];
  shippingAddr: ApiShippingAddress | null;
  user: { email: string; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderBody {
  items: { productId: string; quantity: number }[];
  shippingAddress: {
    firstName: string; lastName: string; email: string; phone: string;
    address: string; city: string; state: string; postalCode: string; country: string;
  };
  notes?: string;
  guestEmail?: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export type PersonalizStatus = 'PENDING' | 'IN_REVIEW' | 'QUOTED' | 'ACCEPTED' | 'REJECTED';

export interface ApiPersonalizationRequest {
  id: string;
  userId: string | null;
  description: string;
  referenceUrl: string | null;
  referenceImage: string | null;
  name: string;
  email: string;
  phone: string | null;
  lang: 'ES' | 'EN';
  status: PersonalizStatus;
  adminNotes: string | null;
  quotedPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePersonalizationBody {
  status?: PersonalizStatus;
  adminNotes?: string;
  quotedPrice?: number;
}

export interface PersonalizationQuery {
  page?: number;
  limit?: number;
  status?: PersonalizStatus;
}

export interface ApiUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  lang: 'ES' | 'EN';
  isActive: boolean;
  googleId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { orders: number };
}

export interface UpdateUserBody {
  role?: 'ADMIN' | 'USER';
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: 'ADMIN' | 'USER';
  isActive?: 'true' | 'false';
  search?: string;
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
