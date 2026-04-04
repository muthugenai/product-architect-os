import { NextResponse } from "next/server";
import { getAdminCredentials } from "@/lib/auth";

/**
 * Safe health check: confirms the server sees admin env vars (no secrets returned).
 * GET /api/auth/login-status — use after setting Vercel env + redeploying.
 */
export async function GET() {
  const ok = getAdminCredentials() !== null;
  return NextResponse.json({
    adminLoginConfigured: ok,
    environment: process.env["VERCEL_ENV"] ?? process.env["NODE_ENV"] ?? "unknown",
  });
}
