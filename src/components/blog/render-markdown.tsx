import type { ReactNode } from "react";

/** Inline [label](url) for external docs and product links without a full markdown parser. */
export function renderInline(text: string): ReactNode[] {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let kid = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={`t-${kid++}`}>{text.slice(last, m.index)}</span>);
    }
    const href = m[2];
    const external = href.startsWith("http://") || href.startsWith("https://");
    out.push(
      <a
        key={`a-${kid++}`}
        href={href}
        className="border-b border-zinc-600 text-zinc-100 transition-colors hover:border-zinc-400"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push(<span key={`t-${kid++}`}>{text.slice(last)}</span>);
  }
  return out.length > 0 ? out : [<span key="t-0">{text}</span>];
}

/** Strategic Note: Fenced code blocks keep tutorial posts copy-pasteable without pulling in a full MDX pipeline. */
export function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const out: ReactNode[] = [];
  let k = 0;
  const key = () => `md-${k++}`;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

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

    if (trimmed.startsWith("- ")) {
      out.push(
        <p key={key()} className="pl-2 text-base leading-relaxed text-zinc-300">
          • {renderInline(trimmed.replace(/^- /, ""))}
        </p>,
      );
      i++;
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      out.push(
        <figure key={key()} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- blog markdown uses public/ paths */}
          <img
            src={src}
            alt={alt || "Diagram"}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900"
            loading="lazy"
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
