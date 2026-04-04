import type { ReactNode } from "react";
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

/** Inline markdown: bold, inline code, and links. */
function renderInline(text: string): ReactNode[] {
  const TOKEN =
    /(\*\*(.+?)\*\*)|(`([^`]+?)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  const out: ReactNode[] = [];
  let last = 0;
  let kid = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={`t-${kid++}`}>{text.slice(last, m.index)}</span>);
    }

    if (m[1]) {
      out.push(
        <strong key={`b-${kid++}`} className="font-semibold text-zinc-100">
          {m[2]}
        </strong>,
      );
    } else if (m[3]) {
      out.push(
        <code
          key={`c-${kid++}`}
          className="rounded bg-zinc-800 px-1.5 py-0.5 text-[13px] text-zinc-200"
        >
          {m[4]}
        </code>,
      );
    } else if (m[5]) {
      const href = m[7]!;
      const external = href.startsWith("http://") || href.startsWith("https://");
      out.push(
        <a
          key={`a-${kid++}`}
          href={href}
          className="border-b border-zinc-600 text-zinc-100 transition-colors hover:border-zinc-400"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[6]}
        </a>,
      );
    }

    last = m.index + m[0].length;
  }

  if (last < text.length) {
    out.push(<span key={`t-${kid++}`}>{text.slice(last)}</span>);
  }
  return out.length > 0 ? out : [<span key="t-0">{text}</span>];
}

/** Strategic Note: Fenced code blocks keep tutorial posts copy-pasteable without pulling in a full MDX pipeline. */
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const out: ReactNode[] = [];
  let k = 0;
  const key = () => `md-${k++}`;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim().replace(/^\uFEFF/, "");

    if (trimmed.startsWith("```")) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      out.push(
        <pre
          key={key()}
          className="my-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-200"
        >
          <code className="font-mono text-[13px] leading-relaxed whitespace-pre">
            {codeLines.join("\n").replace(/\n$/, "")}
          </code>
        </pre>,
      );
      continue;
    }

    if (!trimmed) {
      out.push(<div key={key()} className="h-3" />);
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      out.push(
        <h3 key={key()} className="mt-6 text-xl font-semibold tracking-tight text-zinc-100">
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h3>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      out.push(
        <h2 key={key()} className="mt-8 text-2xl font-semibold tracking-tight text-zinc-50">
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h2>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      out.push(
        <h1 key={key()} className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
          {renderInline(trimmed.replace(/^#\s+/, ""))}
        </h1>,
      );
      i++;
      continue;
    }

    if (/^\s*- /.test(line)) {
      const indent = line.search(/\S/);
      const content = trimmed.replace(/^- /, "");
      out.push(
        <p
          key={key()}
          className="text-base leading-relaxed text-zinc-300"
          style={{ paddingLeft: indent > 0 ? `${indent * 0.5 + 0.5}rem` : "0.5rem" }}
        >
          • {renderInline(content)}
        </p>,
      );
      i++;
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      const isLocal = src.startsWith("/");
      out.push(
        <figure key={key()} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- markdown content uses public/ or absolute URLs */}
          <img
            src={src}
            alt={alt || "Diagram"}
            width={isLocal && src.endsWith(".svg") ? 1000 : undefined}
            height={isLocal && src.endsWith(".svg") ? 780 : undefined}
            className="h-auto w-full rounded-xl border border-zinc-800 bg-zinc-900"
            loading={isLocal ? "eager" : "lazy"}
            decoding="async"
          />
        </figure>,
      );
      i++;
      continue;
    }

    out.push(
      <p key={key()} className="text-base leading-relaxed text-zinc-300">
        {renderInline(trimmed)}
      </p>,
    );
    i++;
  }

  return out;
}

export default async function WritingPostPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) notFound();
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const contentWithoutTitle = post.content
    .replace(/^#\s+.*\n?/, "")
    .replace(new RegExp(`^By\\s+${escapeRegExp(post.author)}\\s*\\n?`, "i"), "")
    .trim();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
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
    </div>
  );
}
