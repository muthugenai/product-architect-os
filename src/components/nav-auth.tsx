"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LoginModal } from "@/components/login-modal";

export function NavAuth() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = (await res.json()) as { authenticated?: boolean };
      setAuthed(Boolean(data.authenticated));
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
    setLoginOpen(false);
    router.refresh();
  }

  if (authed === null) {
    return (
      <span className="inline-block h-4 w-14 animate-pulse rounded bg-zinc-800" aria-hidden />
    );
  }

  if (authed) {
    return (
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-50"
      >
        Logout
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLoginOpen(true)}
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-emerald-500/50 hover:bg-zinc-900 hover:text-zinc-50"
      >
        Login
      </button>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={() => setAuthed(true)}
      />
    </>
  );
}
