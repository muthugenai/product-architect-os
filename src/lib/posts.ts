import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

export interface PostMeta {
  title: string;
  description?: string;
  date: string;
  slug: string;
}

export interface Post extends PostMeta {
  content: string;
}

/** Strategic Note: File-based content keeps the blog simple, portable, and git-friendly. No CMS required. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, '');
      const fullPath = path.join(POSTS_DIR, file);
      const { data } = matter(fs.readFileSync(fullPath, 'utf-8'));
      return {
        title: data.title ?? slug,
        description: data.description,
        date: data.date ?? '',
        slug,
      };
    })
    .filter((p) => p.date)
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  for (const ext of ['.mdx', '.md']) {
    const fullPath = path.join(POSTS_DIR, `${slug}${ext}`);
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const { data, content } = matter(raw);
      return {
        title: data.title ?? slug,
        description: data.description,
        date: data.date ?? '',
        slug,
        content,
      };
    }
  }
  return null;
}
