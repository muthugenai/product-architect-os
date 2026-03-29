"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminBlogPost } from "@/lib/admin-posts/schema";
import {
  buildSlugFromTitle,
  notifyAdminPostsChanged,
  saveAdminPost,
} from "@/lib/admin-posts/local-storage-repository";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type WriteNewPostModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save (parent can reload lists). */
  onSaved?: () => void;
};

/** Strategic Note: Modal keeps the writing surface focused; same persistence path as the admin sidebar for easy DB swap later. */
export function WriteNewPostModal({ open, onClose, onSaved }: WriteNewPostModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editorSession, setEditorSession] = useState(0);

  const reset = useCallback(() => {
    setTitle("");
    setBody("");
    setError(null);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleCancel]);

  useEffect(() => {
    if (!open) return;
    reset();
    setEditorSession((s) => s + 1);
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("#new-post-title")?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, reset]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) {
      setError("Title and body are required.");
      return;
    }

    const id = crypto.randomUUID();
    const slug = buildSlugFromTitle(t);
    const post: AdminBlogPost = {
      id,
      slug,
      title: t,
      content: b,
      date: new Date().toISOString(),
      author: "Admin",
      status: "Published",
    };
    saveAdminPost(post);
    notifyAdminPostsChanged();
    onSaved?.();
    reset();
    onClose();
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close new post"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleCancel}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-post-dialog-title"
        className="relative z-[1] flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/95 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-800 px-5 py-4 md:px-6">
          <h2 id="new-post-dialog-title" className="text-lg font-semibold tracking-tight text-zinc-50">
            New post
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Saved to this browser. The body uses a rich editor and is stored as markdown.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSave(e)}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 md:px-6 md:py-5"
        >
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="new-post-title" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Title
            </label>
            <input
              id="new-post-title"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-500/25"
              placeholder="Post title"
              autoComplete="off"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col space-y-1.5">
            <span id="new-post-body-label" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Body
            </span>
            <RichTextEditor
              instanceKey={editorSession}
              value={body}
              onChange={(md) => {
                setBody(md);
                setError(null);
              }}
              placeholder="Start writing… Use the toolbar for headings, lists, and links."
              aria-labelledby="new-post-body-label"
              className="min-h-0 flex-1"
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-zinc-800/80 pt-4">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-opacity hover:opacity-90"
            >
              Save Post
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
