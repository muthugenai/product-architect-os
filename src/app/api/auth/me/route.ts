import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-constants";

export async function GET() {
  const jar = await cookies();
  const ok = jar.get(ADMIN_SESSION_COOKIE)?.value === "1";
  return NextResponse.json({ authenticated: ok });
}
