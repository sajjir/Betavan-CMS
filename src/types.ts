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
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
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
  category?: Category;
  tags: Tag[];
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
