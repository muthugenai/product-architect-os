---
title: "My First Minor Update: From Prompt to Prototype to Production"
date: "2026-03-19"
excerpt: "A minor change on this site—portfolio page, nav link—and one full pass from prompt in Cursor to production on Vercel."
author: "Muthukumar Rajamani"
status: "Published"
tags:
  - cursor
  - github
  - vercel
  - incremental-delivery
  - build-in-public
  - prompt-to-production
---

# My First Minor Update: From Prompt to Prototype to Production

## TL;DR

- Shipped a **minor update** on this site: a **`/portfolio`** page (responsive grid) and a **Portfolio** link in the header next to Writing and Prototypes.
- Used [Cursor](https://cursor.com) with a structured prompt to generate and adjust the [Next.js](https://nextjs.org/) App Router files.
- Ran the full **Git + [GitHub](https://github.com) + [Vercel](https://vercel.com)** loop on a feature branch: **commit → push → PR → preview URL → merge to `main` → production deploy**.
- I was practicing **prompt → prototype → production** on something small—not shipping a large feature.

## Prompt → prototype → production

How I’m using those three words for this update:

- **Prompt:** Describing the change in [Cursor](https://cursor.com) and iterating with the model on the implementation.
- **Prototype:** Working code in my repo—a **`/portfolio`** page and a **Portfolio** link in the global nav—committed on a branch.
- **Production:** **Push → PR → [Vercel](https://vercel.com) preview → merge to `main`**, so [GitHub](https://github.com) and Vercel reflect the update on the live site. My project is already [wired to Git](https://vercel.com/docs/git) with **production on `main`**.

## Local vs remote

![Simple diagram: LOCAL / LAPTOP (main) — GitHub — REMOTE / CLOUD (origin).](/images/git-local-remote-main.svg)

- **Local:** the full repo on my machine (including `.git` history).
- **Remote ([GitHub](https://github.com)):** the shared copy; [Vercel](https://vercel.com) builds from it.
- **`origin`:** the default remote name (`git push` goes there).
- **`main`:** where I merge for production; I used a separate branch until the PR was ready.
- **Push / pull** keep the two sides aligned so previews and production deploys stay predictable.

## What I did

1. **Branch:** `git checkout -b add-portfolio-nav` so work stayed off `main` until review.
2. **Change:** In Cursor, added `src/app/portfolio/page.tsx` (grid layout) and a `Portfolio` `Link` in `layout.tsx` next to Writing and Prototypes, matching their classes.
3. **Commit:** Staged those files with a message like `feat: add portfolio page and nav link`.
4. **Push:** `git push -u origin add-portfolio-nav` the first time on that branch.
5. **Pull request:** Opened a PR into `main` on GitHub with a short description.
6. **Preview:** Opened the Vercel preview URL on the PR and confirmed the page and nav matched what I saw on localhost.
7. **Merge:** Merged to `main`; production redeployed from the default branch.

Roughly the commands between branch and push:

```bash
git checkout main
git pull origin main
git checkout -b add-portfolio-nav
# … edits in Cursor …
git add src/app/portfolio/page.tsx src/app/layout.tsx
git commit -m "feat: add portfolio page and nav link"
git push -u origin add-portfolio-nav
```

## Prompt I used (for context)

```text
Add a Next.js App Router page at route /portfolio with a responsive grid:
1 column on mobile, 3 columns on desktop (Tailwind). Each card: title, image placeholder, and a "View" button (Link).
Add a "Portfolio" link in the global header nav in src/app/layout.tsx next to the existing Writing and Prototypes links, using the same Link styling as those links.
```

After the model applied changes, I ran `npm run dev`, checked `http://localhost:3000/portfolio` and the new nav link, skimmed the diff, then committed.

## Takeaway

- A small change was enough to run the full loop: **branch → edit → commit → push → PR → preview → merge**.
- [Cursor](https://cursor.com) sped up the implementation; I still set the intent, reviewed the diff, and verified localhost and the [Vercel](https://vercel.com) preview before merging.
- [GitHub](https://github.com) holds history and the PR; [Vercel](https://vercel.com) runs [preview](https://vercel.com/docs/deployments/preview-deployments) and production off that repo.
- This site is [Next.js](https://nextjs.org/docs) (App Router); source lives at [product-architect-os](https://github.com/muthugenai/product-architect-os).
