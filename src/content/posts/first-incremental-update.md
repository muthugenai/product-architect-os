---
title: "My First AI-Powered App Update: A Lesson in Incremental Progress"
date: "2026-03-19"
excerpt: "A factual walkthrough of a small change—adding a portfolio page and a nav link—using Cursor, GitHub, and Vercel."
author: "Muthukumar Rajamani"
status: "Published"
tags:
  - cursor
  - github
  - vercel
  - incremental-delivery
  - build-in-public
---

# My First AI-Powered App Update: A Lesson in Incremental Progress

I made a small update to this site: a simple `/portfolio` page and a **Portfolio** link in the global nav, using **Cursor**, **GitHub**, and **Vercel**. The point of this post is the workflow, not the size of the change.

## Local vs remote

- **Local:** full repo on your machine (including `.git` history).
- **Remote (GitHub):** the shared copy; Vercel builds from it.
- **Push** sends commits to GitHub; **pull** brings remote changes down. Keeping them aligned is how preview and production deploys stay predictable.

## What I did (short version)

1. **Branch:** `git checkout -b add-portfolio-nav` so work stays off `main` until it is reviewed.
2. **Change:** In Cursor, added `src/app/portfolio/page.tsx` (grid layout) and a `Portfolio` `Link` in `layout.tsx` next to Writing and Prototypes, matching their classes.
3. **Commit:** Staged the files, message like `feat: add portfolio page and nav link`.
4. **Push:** Published the branch to GitHub.
5. **Pull request:** Opened a PR on GitHub with a one-line description.
6. **Check preview:** Vercel created a preview URL on the PR; I opened it and confirmed the new page and nav.
7. **Merge:** Merged to `main`; production redeployed from the default branch.

## Takeaway

Incremental updates are enough to exercise the full loop: branch, edit, commit, push, PR, preview, merge. The AI in Cursor handled boilerplate and refactors; Git and Vercel handled history and deploys. I still chose what to build and verified the preview before merging.
