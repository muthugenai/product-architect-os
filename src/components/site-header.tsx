import Link from "next/link";
import { NavAuth } from "@/components/nav-auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-zinc-100 transition-opacity hover:opacity-80 md:text-lg"
        >
          Muthukumar Rajamani
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-4 md:gap-6">
          <nav aria-label="Global" className="flex flex-wrap items-center justify-end gap-4 text-sm text-zinc-300 md:gap-5">
            <Link
              href="/writing"
              className="border-b border-transparent transition-all hover:border-zinc-400 hover:text-zinc-100"
            >
              Writing
            </Link>
            <Link
              href="/portfolio"
              className="border-b border-transparent transition-all hover:border-zinc-400 hover:text-zinc-100"
            >
              Portfolio
            </Link>
            <Link
              href="/prototypes"
              className="border-b border-transparent transition-all hover:border-zinc-400 hover:text-zinc-100"
            >
              Prototypes
            </Link>
            <Link
              href="/about"
              className="border-b border-transparent transition-all hover:border-zinc-400 hover:text-zinc-100"
            >
              About
            </Link>
          </nav>
          <NavAuth />
        </div>
      </div>
    </header>
  );
}
