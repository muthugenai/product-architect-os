"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AdminSignInForm } from "@/components/admin-sign-in-form";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onLoggedIn: () => void;
};

/** Strategic Note: Portal keeps the overlay above the sticky header; post-login we refresh in place instead of forcing /admin. */
export function LoginModal({ open, onClose, onLoggedIn }: LoginModalProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("#modal-signin-username")?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const handleSuccess = () => {
    onLoggedIn();
    onClose();
    router.refresh();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close sign in"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-signin-title"
        className="relative z-[1] w-full max-w-md shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            Close
          </button>
        </div>
        <AdminSignInForm
          idPrefix="modal-signin"
          headingLevel="h2"
          onSuccess={handleSuccess}
          className="border-zinc-700/80 bg-zinc-900/90"
        />
      </div>
    </div>,
    document.body,
  );
}
