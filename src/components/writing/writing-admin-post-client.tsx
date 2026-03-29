"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { renderMarkdown } from "@/components/blog/render-markdown";
import type { AdminBlogPost } from "@/lib/admin-posts/schema";
import { readAdminPostsFromStorage } from "@/lib/admin-posts/local-storage-repository";

export function WritingAdminPostClient({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false);
  const [post, setPost] = useState<AdminBlogPost | null>(null);

  useEffect(() => {
    setPost(readAdminPostsFromStorage().find((p) => p.slug === slug) ?? null);
    setReady(true);
  }, [slug]);

  if (!ready) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <article className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-16">
          <div className="mb-8 h-4 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="mb-4 h-10 w-3/4 max-w-lg animate-pulse rounded bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800/80" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800/80" />
          </div>
        </article>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-16">
          <Link
            href="/writing"
            className="mb-8 inline-block border-b border-transparent text-sm text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200"
          >
            ← Back to Writing
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-100">Post not found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            This slug is not in the site files or your browser storage for this device.
          </p>
        </div>
      </main>
    );
  }

  const body = post.content.replace(/^#\s+.*\n?/, "").trim();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <article className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-16">
        <Link
          href="/writing"
          className="mb-8 inline-block border-b border-transparent text-sm text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200"
        >
          ← Back to Writing
        </Link>

        <header className="mb-8 border-b border-zinc-800 pb-6">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            {post.date} | {post.status ?? "Published"}
            <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
              Browser
            </span>
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">By {post.author ?? "Admin"}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <section className="space-y-1">{renderMarkdown(body)}</section>
      </article>
    </main>
  );
}
