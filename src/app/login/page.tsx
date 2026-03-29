import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-lg px-6 py-14 md:px-10 md:py-16">
        <Link
          href="/"
          className="mb-10 inline-block text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          ← Home
        </Link>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-zinc-900/80" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
