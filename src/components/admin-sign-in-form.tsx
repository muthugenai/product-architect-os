"use client";

import { useState } from "react";

export function AdminSignInForm({
  onSuccess,
  className = "",
  idPrefix = "signin",
  headingLevel = "h1",
}: {
  onSuccess: () => void;
  className?: string;
  idPrefix?: string;
  headingLevel?: "h1" | "h2";
}) {
  const TitleTag = headingLevel;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  const titleId = `${idPrefix}-title`;

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className={`w-full space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8 ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <div>
        <TitleTag id={titleId} className="text-xl font-semibold tracking-tight text-zinc-50">
          Admin sign in
        </TitleTag>
        <p className="mt-1 text-sm text-zinc-500">Use your configured admin credentials.</p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-username`}
          className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Username
        </label>
        <input
          id={`${idPrefix}-username`}
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-emerald-500/0 transition-[box-shadow,border-color] focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-password`}
          className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Password
        </label>
        <input
          id={`${idPrefix}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-emerald-500/0 transition-[box-shadow,border-color] focus:border-emerald-600/50 focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
