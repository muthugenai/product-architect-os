"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PostMeta } from "@/lib/post-types";
import type { AdminBlogPost } from "@/lib/admin-posts/schema";
import {
  buildSlugFromTitle,
  deleteAdminPostById,
  notifyAdminPostsChanged,
  readAdminPostsFromStorage,
  saveAdminPost,
} from "@/lib/admin-posts/local-storage-repository";
import { WriteNewPostModal } from "@/components/admin/write-new-post-modal";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

function emptyForm(): { title: string; content: string; date: string } {
  return { title: "", content: "", date: new Date().toISOString().slice(0, 10) };
}

export function AdminDashboard({ filePosts }: { filePosts: PostMeta[] }) {
  const [adminPosts, setAdminPosts] = useState<AdminBlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newPostOpen, setNewPostOpen] = useState(false);

  const reload = useCallback(() => {
    setAdminPosts(
      [...readAdminPostsFromStorage()].sort((a, b) => (a.date < b.date ? 1 : -1)),
    );
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function onEdit(p: AdminBlogPost) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      content: p.content,
      date: p.date.length >= 10 ? p.date.slice(0, 10) : p.date,
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    const id = editingId ?? crypto.randomUUID();
    const slug = buildSlugFromTitle(title, id);
    const post: AdminBlogPost = {
      id,
      slug,
      title,
      content: form.content,
      date: form.date,
      author: "Admin",
      status: "Published",
    };
    saveAdminPost(post);
    reload();
    notifyAdminPostsChanged();
    resetForm();
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this post from browser storage?")) return;
    deleteAdminPostById(id);
    reload();
    notifyAdminPostsChanged();
    if (editingId === id) resetForm();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
              Blog management
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Posts you add here live in this browser&apos;s local storage and merge with repo posts on{" "}
              <Link href="/writing" className="text-zinc-200 underline-offset-2 hover:underline">
                Writing
              </Link>
              . If a slug matches a markdown file in the repo, the file wins on the public post page. Swap the
              storage layer later for a database without changing this UI.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setNewPostOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-[transform,opacity] hover:opacity-95 active:scale-[0.99] sm:w-auto"
            >
              Write a new post
            </button>
            <Link
              href="/writing"
              className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900 sm:w-auto"
            >
              View public list
            </Link>
          </div>
        </div>

        <WriteNewPostModal open={newPostOpen} onClose={() => setNewPostOpen(false)} onSaved={reload} />

        <div className="grid gap-10 lg:grid-cols-2">
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              Browser storage ({adminPosts.length})
            </h2>
            {adminPosts.length === 0 ? (
              <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
                No posts yet. Use <strong className="text-zinc-300">Write a new post</strong> to create one.
              </p>
            ) : (
              <ul className="space-y-3">
                {adminPosts.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700"
                  >
                    <p className="text-xs text-zinc-500">
                      {p.date} · <span className="font-mono text-zinc-400">{p.slug}</span>
                    </p>
                    <p className="mt-1 font-medium text-zinc-100">{p.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="rounded-md border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="rounded-md border border-red-900/50 px-3 py-1 text-xs text-red-200 hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                      <Link
                        href={`/writing/${p.slug}`}
                        className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            {editingId ? (
              <>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Edit post</h2>
                <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6">
                  <div className="space-y-1.5">
                    <label htmlFor="post-title" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Title
                    </label>
                    <input
                      id="post-title"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-500/25"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="post-date" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Date
                    </label>
                    <input
                      id="post-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-500/25"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span id="post-content-label" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Body
                    </span>
                    <p className="text-[11px] text-zinc-600">Rich text; saved as markdown for the site renderer.</p>
                    <RichTextEditor
                      instanceKey={editingId}
                      value={form.content}
                      onChange={(md) => setForm((f) => ({ ...f, content: md }))}
                      placeholder="Edit post body…"
                      aria-labelledby="post-content-label"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="submit"
                      className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                    >
                      Cancel edit
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Editor</h2>
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
                  <p className="text-sm text-zinc-400">
                    Use <strong className="text-zinc-200">Write a new post</strong> to compose, or choose{" "}
                    <strong className="text-zinc-200">Edit</strong> on a post in the list.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="mt-14 border-t border-zinc-800 pt-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Repository posts (read-only)
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            These are loaded from <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs text-zinc-300">src/content/posts</code>.
            Edit the markdown files in git to change them.
          </p>
          {filePosts.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No file-based posts.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/40">
              {filePosts.map((p) => (
                <li key={p.slug} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-zinc-100">{p.title}</p>
                    <p className="text-xs text-zinc-500">
                      {p.date} · <span className="font-mono text-zinc-400">{p.slug}</span>
                    </p>
                  </div>
                  <Link
                    href={`/writing/${p.slug}`}
                    className="text-xs text-emerald-400/90 hover:underline"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
