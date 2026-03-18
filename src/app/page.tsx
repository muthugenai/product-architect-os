import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default function Home() {
  const latestPost = getPosts()[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {/* Strategic Note: Executive-grade clarity supports influence across product, design, and engineering. */}
        <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30 md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),transparent_40%)]" />
          <h1 className="relative mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
            Architecting at the Intersection of Design &amp; AI.
          </h1>
          <p className="relative mt-5 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
            I am a Design Leader and Product Builder evolving my leadership through technical
            agency. This OS is my laboratory for shipping production-grade prototypes and
            documenting the rise of the Design Technologist.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300 transition-all hover:border-zinc-700">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Writing</p>
            {latestPost ? (
              <>
                <Link
                  href={`/writing/${latestPost.slug}`}
                  className="mt-2 block border-b border-transparent text-base font-medium text-zinc-100 transition-all hover:border-zinc-400"
                >
                  {latestPost.title.length > 64
                    ? `${latestPost.title.slice(0, 64)}...`
                    : latestPost.title}
                </Link>
                <p
                  className="mt-2 leading-relaxed text-zinc-400"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {latestPost.excerpt}
                </p>
              </>
            ) : (
              <p className="mt-2 text-zinc-400">No posts yet.</p>
            )}
          </article>
          <Link
            href="/prototypes"
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300 transition-all hover:border-zinc-700 hover:text-zinc-100"
          >
            Prototypes
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300 transition-all hover:border-zinc-700 hover:text-zinc-100"
          >
            About
          </Link>
        </section>
      </div>
    </main>
  );
}
