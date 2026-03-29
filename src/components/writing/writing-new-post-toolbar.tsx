"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { WriteNewPostModal } from "@/components/admin/write-new-post-modal";

/** Strategic Note: Auth-gated compose keeps local drafts aligned with the same admin session as /admin. */
export function WritingNewPostToolbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = (await res.json()) as { authenticated?: boolean };
      setAuthed(Boolean(data.authenticated));
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  function onOpenClick() {
    if (authed) setModalOpen(true);
    else router.push("/login?from=/writing");
  }

  return (
    <>
      <div className="mb-8 flex justify-end">
        {authed === null ? (
          <div className="h-11 w-44 animate-pulse rounded-xl bg-zinc-800/80" aria-hidden />
        ) : (
          <button
            type="button"
            onClick={onOpenClick}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-[transform,opacity] hover:opacity-95 active:scale-[0.99] sm:w-auto"
          >
            Write a new post
          </button>
        )}
      </div>

      {authed ? (
        <WriteNewPostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </>
  );
}
