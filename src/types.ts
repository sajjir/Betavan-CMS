export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Taxonomy {
  id: string;
  key: string;
  name: string;
  nameFa?: string;
  hierarchical: boolean;
  urlPrefix: string;
}

export interface Term {
  id: string;
  taxonomyId: string;
  taxonomy?: Taxonomy;
  name: string;
  nameFa?: string | null;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  parentId?: string | null;
}

export interface PostBlock {
  id?: string;
  type: "RICH_TEXT" | "IMAGE" | "APARAT_EMBED" | "CODE_SNIPPET" | "DOWNLOAD_BOX";
  order: number;
  data: any; // Type depends on the block type
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  categoryId?: string;
  category?: Term | null;
  tags: Term[];
  contentType?: Term | null;
  skillLevel?: Term | null;
  terms?: Term[];
  blocks: PostBlock[];
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  blocks: PostBlock[];
  updatedAt: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  folder?: string;
  tags: string[];
  altText?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number; // in Toman
  description?: string | null;
  coverImage?: string | null;
  status: "draft" | "published";
  categoryId?: string | null;
  category?: Term | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number; // in Toman
  product?: {
    title: string;
    coverImage?: string | null;
  };
}

export interface Order {
  id: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "shipped";
  total: number; // in Toman
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string | null;
  zarinpalAuthority?: string | null;
  zarinpalRefId?: string | null;
  items?: OrderItem[];
  createdAt: string;
}

export interface WebhookConfig {
  id: string;
  event: string;
  url: string;
  enabled: boolean;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  url: string;
  statusCode?: number | null;
  success: boolean;
  responseBody?: string | null;
  createdAt: string;
}
