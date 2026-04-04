---
title: 'Two Cursor Rules That Replaced My Deployment Checklist'
date: "2026-04-04"
excerpt: "I kept re-explaining the same Git sequence to Cursor every session. Two .mdc files fixed that."
author: "Muthukumar Rajamani"
status: "Published"
tags:
  - cursor-rules
  - developer-experience
  - building-in-public
  - git-workflow
---

# Two Cursor Rules That Replaced My Deployment Checklist

## A small thing I noticed while shipping

Every time I deploy I run roughly the same Git sequence: build, diff, stage, commit, push. Every time a deploy breaks I run the reverse: fetch, reset, clear cache. The commands never change, but the order sometimes does — and that is where mistakes creep in.

By the third time I asked Cursor to help me push a commit, I realised I was re-explaining the same steps every session — and sometimes skipping the build check because I was in a hurry. That is when I decided to write it down once, in a place the agent reads automatically: a [Cursor project rule](https://cursor.com/docs/context/rules).

A [Cursor project rule](https://cursor.com/help/customization/rules) is a markdown file (`.mdc`) that lives in your repo under `.cursor/rules/`. When you say the trigger phrase in chat, the agent reads the file and executes the steps. One phrase, one path, every time.

## How "Apply Intelligently" makes this work (in plain English)

Think of each rule as a **short brief** you filed once. At the top of the file you write **what the rule is for** in one sentence — like a sticky label on a Figma frame. Cursor reads that label and asks: *Does this match what the person is trying to do right now?* If yes, it opens the brief. If no, it leaves it alone.

That mode is called **Apply Intelligently**. You do not have to `@` the rule or remember the filename. You just talk normally — "ship this," "sync my machine with prod," "push to prod" — and Cursor pulls in the right brief when it fits.

**Why that beats pasting steps into chat every time:** The instructions live **in the project**, not in a one-off message that scrolls away. Same idea as keeping a component spec next to the component instead of re-explaining spacing in Slack on every handoff.

**What happens in my setup:** When I mention deploying or shipping, the push brief shows up. When I mention reverting, syncing, or resetting local, the rollback brief shows up. I do not maintain a mental map of which file does what — the one-line "what this is for" at the top does the routing.

**Other ways Cursor can load rules** (so you know the menu):

- **Always on** — like a global design checklist pinned to every file: heavy, but nothing gets missed.
- **Only for certain folders** — like a pattern that applies whenever you touch anything under `src/` (your "this surface only" playbook).
- **Only when you explicitly call it** — like tagging someone with `@` when you need that one expert.

For "how I ship" and "how I reset" workflows, **Apply Intelligently** is the comfortable default: help when the topic matches, quiet when it does not.

*(Under the hood, that one-line label is the `description` in the file header, and "not always on" is `alwaysApply: false` — only if you peek at the raw file.)*

## Two rules I wrote

### "push to prod"

- **File:** `.cursor/rules/push-to-prod.mdc`
- **Trigger:** "push to prod"
- **Steps:** `npm run build` → review `git status` and diffs → stage files (never `.env`) → commit in this repo's style → `git push origin main` → confirm what shipped.
- One phrase replaces a six-step checklist I used to type out or forget halfway through.

### "rollback local and sync prod"

- **File:** `.cursor/rules/rollback-local-sync-prod.mdc`
- **Trigger:** "rollback local and sync prod"
- **When:** after a [GitHub revert](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/reverting-a-pull-request), when local `main` has drifted from origin, or when `.next` is serving stale chunks.
- **Steps:**
  - Warn if uncommitted work would be lost.
  - `git fetch origin` → `git checkout main` → `git reset --hard origin/main`
  - `rm -rf .next` to clear cached build artifacts.
- This one came a few days after the push rule, when I kept reaching for the same hard-reset recipe after reverts.

## Why this works

- **Same steps every time.** No more re-typing Git commands in chat or wondering if I forgot a step.
- **Build runs before push.** The rule forces a build check first — the step I used to skip when I was in a hurry.
- **Secrets stay out.** `.env` is explicitly excluded in the rule, so I cannot accidentally stage it.
- **Matches the pipeline.** Cursor → Git → GitHub → Vercel — one forward gear (push) and one reverse gear (reset to `origin/main`).

## What this is not

- Not a CI pipeline or a branch policy. Those serve teams. This serves a solo author loop — me, shipping from `main` through Vercel.
- Not a replacement for understanding Git. The rule encodes the sequence; you still need to know why `reset --hard` is destructive or why `.env` never gets staged.

## What I took away

Start with the task you repeat most. Write it as a rule. Commit it. Iterate on it when the workflow changes.

The `.mdc` file is not the point. The habit is: notice friction, encode the fix, version it, move on.
