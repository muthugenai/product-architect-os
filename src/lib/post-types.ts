/** Shared shapes for file-based and admin posts — no Node APIs (safe for client bundles). */
export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  status: string;
  tags?: string[];
}

export interface Post extends PostMeta {
  content: string;
}
