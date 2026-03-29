"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AdminSignInForm } from "@/components/admin-sign-in-form";

function safeInternalPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <AdminSignInForm
      idPrefix="page-signin"
      onSuccess={() => {
        router.push(safeInternalPath(searchParams.get("from")));
        router.refresh();
      }}
      className="mx-auto max-w-md"
    />
  );
}
