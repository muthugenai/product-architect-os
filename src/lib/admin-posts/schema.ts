import type { PostMeta } from "@/lib/post-types";

/** localStorage payload version — bump if shape changes. */
export const ADMIN_POSTS_STORAGE_KEY = "paos_admin_blog_v1";

/** Strategic Note: Mirrors PostMeta fields where possible so swapping to a DB row is a thin adapter. */
export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  date: string;
  excerpt?: string;
  author?: string;
  status?: string;
  tags?: string[];
}

export type PostSource = "file" | "admin";

export type MergedPostMeta = PostMeta & { source: PostSource };

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "post";
}

export function adminPostToMeta(p: AdminBlogPost): PostMeta {
  const excerpt =
    p.excerpt?.trim() ||
    p.content
      .replace(/^#+\s+.+\n?/m, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 220);
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt,
    author: p.author?.trim() || "Admin",
    status: p.status?.trim() || "Published",
    tags: p.tags,
  };
}

export function mergeFileAndAdminPosts(filePosts: PostMeta[], adminPosts: AdminBlogPost[]): MergedPostMeta[] {
  const map = new Map<string, MergedPostMeta>();
  for (const a of adminPosts) {
    map.set(a.slug, { ...adminPostToMeta(a), source: "admin" });
  }
  for (const f of filePosts) {
    map.set(f.slug, { ...f, source: "file" });
  }
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
