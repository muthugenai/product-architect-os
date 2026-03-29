import fs from "node:fs";
import path from "node:path";
import type { Post, PostMeta } from "@/lib/post-types";

export type { Post, PostMeta } from "@/lib/post-types";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

function parseFrontmatter(raw: string) {
  const normalized = raw.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  const frontmatter = match?.[1] ?? "";
  const content = normalized.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, "");

  const getField = (field: string) => {
    const regex = new RegExp(`^${field}:\\s*["']?(.*?)["']?\\s*$`, "m");
    return frontmatter.match(regex)?.[1]?.trim() ?? "";
  };

  const getTags = (): string[] => {
    const tagsMatch = frontmatter.match(/^tags:\s*\r?\n((?:\s*-\s+.*(?:\r?\n|$))*)/m);
    if (!tagsMatch) return [];
    return (tagsMatch[1]?.match(/-\s+.+/g) ?? []).map((t) => t.replace(/^\s*-\s+/, "").trim());
  };

  return {
    title: getField("title"),
    date: getField("date"),
    excerpt: getField("excerpt"),
    author: getField("author"),
    status: getField("status"),
    tags: getTags(),
    content: content.trim(),
  };
}

/** Strategic Note: Keep content file-based for low-friction publishing and full ownership in git. */
export function getPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const parsed = parseFrontmatter(raw);

      return {
        slug,
        title: parsed.title || slug,
        date: parsed.date,
        excerpt: parsed.excerpt,
        author: parsed.author,
        status: parsed.status || "Published",
        tags: parsed.tags,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = parseFrontmatter(raw);

  return {
    slug,
    title: parsed.title || slug,
    date: parsed.date,
    excerpt: parsed.excerpt,
    author: parsed.author,
    status: parsed.status || "Published",
    tags: parsed.tags,
    content: parsed.content,
  };
}
