import Link from "next/link";
import type { Post } from "@/lib/post-types";
import { renderMarkdown } from "@/components/blog/render-markdown";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function WritingFileArticle({ post }: { post: Post }) {
  const contentWithoutTitle = post.content
    .replace(/^#\s+.*\n?/, "")
    .replace(new RegExp(`^By\\s+${escapeRegExp(post.author)}\\s*\\n?`, "i"), "")
    .trim();

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
            {post.date} | {post.status}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">By {post.author}</p>
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

        <section className="space-y-1">{renderMarkdown(contentWithoutTitle)}</section>
      </article>
    </main>
  );
}
