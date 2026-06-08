# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Single Next.js 15 (App Router) portfolio and blog app. No monorepo, database, Docker, or auxiliary services. Content is file-based Markdown in `src/content/posts/`.

### Required service

| Service | Command | Port |
|---------|---------|------|
| Next.js dev server | `npm run dev` | 3000 |

### Common commands

See `README.md` and `package.json` scripts:

- **Install deps:** `npm install`
- **Dev server:** `npm run dev` (or `npm run dev:clean` to clear `.next` cache first)
- **Lint:** `npm run lint`
- **Production build:** `npm run build`
- **Production server:** `npm run start` (after build)

There is no test script in this repo.

### Environment variables

No `.env` is required for local dev. Admin auth env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) are optional in development; dev fallbacks exist in `src/lib/auth.ts`. Health check: `GET /api/auth/login-status`.

### Gotchas

- **Node.js ≥ 20** is required (`engines` in `package.json`).
- **Google Fonts (Geist)** loads via `next/font/google` on first request; needs network once, then cached.
- **`next lint` is deprecated** in Next.js 15 and will be removed in v16; it still works today.
- **No git hooks** (no Husky, pre-commit, or lint-staged).
