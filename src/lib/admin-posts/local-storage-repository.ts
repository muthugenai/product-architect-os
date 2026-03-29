"use client";

import {
  ADMIN_POSTS_STORAGE_KEY,
  type AdminBlogPost,
  slugifyTitle,
} from "@/lib/admin-posts/schema";

/** Strategic Note: Repository pattern keeps localStorage behind one module for a future API/DB client. */
export function readAdminPostsFromStorage(): AdminBlogPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAdminPost);
  } catch {
    return [];
  }
}

function isAdminPost(x: unknown): x is AdminBlogPost {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.slug === "string" &&
    typeof o.title === "string" &&
    typeof o.content === "string" &&
    typeof o.date === "string"
  );
}

function writeAll(posts: AdminBlogPost[]) {
  window.localStorage.setItem(ADMIN_POSTS_STORAGE_KEY, JSON.stringify(posts));
}

export function saveAdminPost(post: AdminBlogPost) {
  const all = readAdminPostsFromStorage();
  const idx = all.findIndex((p) => p.id === post.id);
  if (idx >= 0) all[idx] = post;
  else all.push(post);
  writeAll(all);
}

export function deleteAdminPostById(id: string) {
  writeAll(readAdminPostsFromStorage().filter((p) => p.id !== id));
}

export function ensureUniqueSlug(baseSlug: string, excludeId?: string): string {
  const posts = readAdminPostsFromStorage();
  let slug = baseSlug;
  let n = 0;
  while (posts.some((p) => p.slug === slug && p.id !== excludeId)) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

export function buildSlugFromTitle(title: string, excludeId?: string): string {
  const base = slugifyTitle(title);
  return ensureUniqueSlug(base || "post", excludeId);
}

/** Keeps Writing list + admin UI in sync after localStorage writes (same tab). */
export function notifyAdminPostsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("paos-admin-posts"));
}
