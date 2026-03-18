export default function PrototypesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-16">
        <header className="border-b border-zinc-800 pb-6">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Prototypes</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            Product Experiments in Progress
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
            This section captures AI-native prototype workstreams from Product Architect OS. Each
            prototype is built to validate an idea quickly, test behavior in production contexts,
            and inform the next design decision.
          </p>
        </header>
      </div>
    </main>
  );
}
