const techStack = [
  {
    title: "Cursor",
    subtitle: "Role: The AI Cockpit",
    insight:
      "To bridge the gap between design intent and production reality by moving from strategy to implementation in one workspace.",
  },
  {
    title: "Next.js 15",
    subtitle: "Role: The Framework",
    insight:
      "To lead with a performant product architecture that ships fast, scales cleanly, and supports long-term design system integrity.",
  },
  {
    title: "Vercel",
    subtitle: "Role: The Pipeline",
    insight:
      "To turn ideas into production outcomes with reliable deployment workflows, preview environments, and operational confidence.",
  },
  {
    title: "Git/GitHub",
    subtitle: "Role: The Version Control",
    insight:
      "To drive cross-functional alignment through transparent change history, disciplined collaboration, and decision traceability.",
  },
];

export function TechStack() {
  return (
    <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Strategic Platform</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Tech Stack</h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {techStack.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-zinc-700"
          >
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">{item.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{item.subtitle}</p>

            <div className="mt-4 border-t border-zinc-800 pt-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Leader&apos;s Insight</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.insight}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
