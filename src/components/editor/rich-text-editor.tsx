"use client";

import type { Editor } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useState } from "react";
import { htmlToMarkdownForStorage, markdownToHtmlForEditor } from "@/lib/markdown-html-bridge";

import "@/components/editor/rich-text-editor.css";

export type RichTextEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  /** Remount editor when this changes (e.g. new modal session or different edit target). */
  instanceKey?: string | number;
  className?: string;
  "aria-labelledby"?: string;
};

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-950/80 px-2 py-2"
      role="toolbar"
      aria-label="Formatting"
    >
      {(
        [
          { label: "Bold", action: () => editor.chain().focus().toggleBold().run(), active: () => editor.isActive("bold") },
          { label: "Italic", action: () => editor.chain().focus().toggleItalic().run(), active: () => editor.isActive("italic") },
          { label: "Code", action: () => editor.chain().focus().toggleCode().run(), active: () => editor.isActive("code") },
          { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive("heading", { level: 2 }) },
          { label: "H3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive("heading", { level: 3 }) },
          { label: "List", action: () => editor.chain().focus().toggleBulletList().run(), active: () => editor.isActive("bulletList") },
          { label: "Ordered", action: () => editor.chain().focus().toggleOrderedList().run(), active: () => editor.isActive("orderedList") },
          { label: "Quote", action: () => editor.chain().focus().toggleBlockquote().run(), active: () => editor.isActive("blockquote") },
        ] as const
      ).map((b) => (
        <button
          key={b.label}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => b.action()}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            b.active()
              ? "bg-zinc-700 text-zinc-50"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
        >
          {b.label}
        </button>
      ))}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link URL", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          editor.isActive("link") ? "bg-zinc-700 text-zinc-50" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        }`}
      >
        Link
      </button>
    </div>
  );
}

/** Strategic Note: TipTap ↔ markdown via turndown/marked keeps the public blog renderer unchanged. */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  instanceKey,
  className = "",
  "aria-labelledby": ariaLabelledBy,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "border-b border-emerald-500/40 text-emerald-300 underline-offset-2 hover:text-emerald-200",
        },
      }),
    ],
    [placeholder],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      content: markdownToHtmlForEditor(value),
      editorProps: {
        attributes: {
          class:
            "paos-rich-editor max-w-none min-h-[200px] px-3 py-3 text-sm text-zinc-100 outline-none focus:outline-none",
          ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(htmlToMarkdownForStorage(ed.getHTML()));
      },
    },
    [mounted, instanceKey, placeholder],
  );

  if (!mounted || !editor) {
    return (
      <div
        className={`min-h-[240px] animate-pulse rounded-lg border border-zinc-700 bg-zinc-950 ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 focus-within:border-emerald-600/50 focus-within:ring-2 focus-within:ring-emerald-500/25 ${className}`.trim()}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="paos-rich-editor-root" />
    </div>
  );
}
