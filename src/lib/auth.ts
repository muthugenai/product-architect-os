import "server-only";

/**
 * Strategic Note: Credentials must come from env in production (set in Vercel).
 * Dev fallback matches local setup only.
 */
export function getAdminCredentials(): { username: string; password: string } | null {
  const u = process.env["ADMIN_USERNAME"]?.trim();
  const p = process.env["ADMIN_PASSWORD"]?.trim();
  if (u && p) return { username: u, password: p };
  if (process.env.NODE_ENV === "development") {
    return { username: "muthugenai", password: "560093" };
  }
  return null;
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds) return false;
  return username === creds.username && password === creds.password;
}
