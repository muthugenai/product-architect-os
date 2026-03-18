import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default function WritingPage() {
  const posts = getPosts();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-16">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Writing</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            Notes from the Technical Laboratory
          </h1>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
          {posts.length === 0 ? (
            <p className="text-sm text-zinc-400">No posts published yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {posts.map((post) => (
                <li key={post.slug} className="py-5 first:pt-0 last:pb-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                    {post.date} | {post.status || "Published"}
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
      </div>
    </main>
  );
}
