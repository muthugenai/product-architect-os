import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const key = `${index}-${line.slice(0, 12)}`;
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={key} className="h-3" />;
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={key} className="mt-6 text-xl font-semibold tracking-tight text-zinc-100">
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={key} className="mt-8 text-2xl font-semibold tracking-tight text-zinc-50">
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={key} className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
          {trimmed.replace(/^#\s+/, "")}
        </h1>
      );
    }

    if (trimmed.startsWith("- ")) {
      return (
        <p key={key} className="pl-2 text-base leading-relaxed text-zinc-300">
          • {trimmed.replace(/^- /, "")}
        </p>
      );
    }

    return (
      <p key={key} className="text-base leading-relaxed text-zinc-300">
        {trimmed}
      </p>
    );
  });
}

export default async function WritingPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
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
