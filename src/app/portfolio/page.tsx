import Link from "next/link";

/** Strategic Note: File-based route + static project data keeps the grid easy to extend without client JS. */
const projects = [
  { id: "1", title: "Product Architect OS", href: "/" },
  { id: "2", title: "AI-Native Prototype", href: "/prototypes" },
  { id: "3", title: "Design Systems Lab", href: "#" },
  { id: "4", title: "Prompt-to-Production Demo", href: "/writing/architecting-agency" },
  { id: "5", title: "Technical Writing", href: "/writing" },
  { id: "6", title: "Experiments", href: "/prototypes" },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <header className="mb-10 md:mb-12">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            Selected work
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Case studies and experiments at the intersection of design, product, and code.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700">
                {/* Image placeholder */}
                <div
                  className="relative aspect-[4/3] bg-zinc-800/80"
                  aria-hidden
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,rgba(39,39,42,0.9)_0%,rgba(24,24,27,1)_100%)]">
                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                      Image
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                    {project.title}
                  </h2>
                  <div className="mt-auto">
                    <Link
                      href={project.href}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-all hover:border-zinc-500 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
