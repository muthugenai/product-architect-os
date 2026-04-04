/** Post shapes shared across the app — no Node APIs (safe for client type imports). */
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
