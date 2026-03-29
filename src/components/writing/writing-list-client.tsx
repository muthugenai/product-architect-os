"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PostMeta } from "@/lib/post-types";
import { mergeFileAndAdminPosts, type MergedPostMeta } from "@/lib/admin-posts/schema";
import { readAdminPostsFromStorage } from "@/lib/admin-posts/local-storage-repository";

export function WritingListClient({ filePosts }: { filePosts: PostMeta[] }) {
  const [rows, setRows] = useState<MergedPostMeta[]>(() => mergeFileAndAdminPosts(filePosts, []));

  useEffect(() => {
    setRows(mergeFileAndAdminPosts(filePosts, readAdminPostsFromStorage()));
  }, [filePosts]);

  useEffect(() => {
    const sync = () => {
      setRows(mergeFileAndAdminPosts(filePosts, readAdminPostsFromStorage()));
    };
    window.addEventListener("paos-admin-posts", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("paos-admin-posts", sync);
      window.removeEventListener("storage", sync);
    };
  }, [filePosts]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-400">No posts published yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {rows.map((post) => (
            <li key={post.slug} className="py-5 first:pt-0 last:pb-0">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                {post.date} | {post.status || "Published"}
                {post.source === "admin" && (
                  <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] tracking-wider text-zinc-400">
                    Browser
                  </span>
                )}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
                <Link
                  href={`/writing/${post.slug}`}
                  className="border-b border-transparent transition-all hover:border-zinc-400 hover:text-zinc-50"
                >
                  {post.title.length > 72 ? `${post.title.slice(0, 72)}...` : post.title}
                </Link>
              </h2>
              <p
                className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {post.excerpt}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-xs text-zinc-500">By {post.author || "Unknown author"}</p>
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
