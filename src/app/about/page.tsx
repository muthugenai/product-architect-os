export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-16">
        <header className="border-b border-zinc-800 pb-6">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">About</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            Muthukumar Rajamani
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
            Design Leader &amp; Product Builder focused on AI-native product experiences and
            high-agency execution.
          </p>
        </header>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-300 md:text-base">
          <p>
            Over the last 20 years, I have worked across product design, UX strategy, and design
            leadership to help teams ship products that balance user value, business outcomes, and
            technical feasibility.
          </p>
          <p>
            My journey spans enterprise and product companies, including Cisco, Freshworks, and
            Atlassian, where I have led multidisciplinary teams through platform modernization,
            product scaling, and AI-era transformation.
          </p>
          <p>
            Today, Product Architect OS is where I document that evolution in public: from design
            leadership into hands-on product building, using Next.js, Tailwind, and modern APIs to
            prototype and test ideas quickly.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100 md:text-xl">
            20-Year Trajectory
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300 md:text-base">
            <li>
              <span className="text-zinc-100">Foundational years</span> - Built core product and UX
              craft across complex enterprise workflows.
            </li>
            <li>
              <span className="text-zinc-100">Cisco</span> - Scaled design impact in enterprise
              environments with systems thinking and cross-functional execution.
            </li>
            <li>
              <span className="text-zinc-100">Freshworks</span> - Drove product design outcomes in
              high-growth SaaS contexts, balancing speed, quality, and business goals.
            </li>
            <li>
              <span className="text-zinc-100">Atlassian</span> - Leading design while deepening
              technical agency to shape AI-native product direction.
            </li>
            <li>
              <span className="text-zinc-100">Now</span> - Building Product Architect OS as a living
              laboratory for experiments, prototypes, and design technology playbooks.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
