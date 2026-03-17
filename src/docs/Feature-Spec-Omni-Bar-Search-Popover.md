# Feature Specification: Global Search / Omni Bar / Popover

**Purpose:** This document describes the **core mechanics** of the Ask Rovo omni bar and its popover so an AI coding agent can rebuild it as a frontend-only, highly interactive UX demo. The bar itself should use **custom CSS/styling** to look like a premium, glowing AI feature (Rovo-inspired); the rest of the app may use the Atlassian Design System. This spec focuses on **behavior, logic, and data**, not legacy CSS.

---

## 1. State Management & Triggers

### 1.1 Omni Box State (Single Source of Truth)

The feature is driven by a **global context** (e.g. React context or store) that holds:

| State value       | Meaning |
|-------------------|--------|
| `closed`          | Popover not visible; bar shows placeholder (and optional hint). |
| `default`         | Popover open; show “home” content (tabs, input, recent/suggested or live results). |
| `results`         | Popover open; show **search results** view (AI summary + result list + follow-ups) inside the popover. |
| `chat_panel`      | Rovo side panel open (popover typically closed). |
| `live_chat`       | Live Chat panel open. |
| `ticket_form`     | Support ticket modal open. |
| `case_tracker`    | Case tracker modal open. |

Additional state to maintain:

- **`query`** — Current text in the bar or popover input (controlled).
- **`searchQuery`** — The “committed” search query. When non-empty, the **main content area** (not the popover) shows a full-page search results view until the user clears search.
- **`contextUrl`** — Derived from current route (e.g. `https://williamsracing.com/jsm/projects` for `/`); used for “Context:” chip and for AI summary context.
- **`contextDismissed`** — If true, show “Searching by keyword only” (context removed) in the results view.
- **`pendingAction`** — Optional: `'voice' | 'loom' | 'insights' | 'cases' | null`. When opening with action (e.g. “View Tickets”), set to `'cases'` so popover opens directly to the Cases view.
- **`initialMainTab`** — Optional: `'help' | 'brief' | 'ai' | null`. When set (e.g. after clearing input), popover should switch to that tab and then clear the value.

### 1.2 How the Popover Is Triggered (Open)

| Trigger | Implementation |
|--------|-----------------|
| **Click on the bar** | The bar is a clickable container (`role="button"`, `tabIndex={0}`). `onClick`: if `state === 'closed'` and `!searchQuery`, call `open()`. Do **not** open if the user already has an active search (main content is showing full-page results). |
| **Keyboard: R** | **Global keydown** listener (e.g. on `window` with `capture: true`). On `key === 'r'` or `'R'`: (1) Ignore if `ctrlKey`, `metaKey`, or `altKey`. (2) Ignore if focus is inside `input`, `textarea`, or `[contenteditable="true"]`. (3) Ignore if `state !== 'closed'`. (4) `preventDefault()`, then call `open()`. **There is no Cmd+K / Ctrl+K** in this codebase; only **R**. |
| **Enter / Space on the bar** | When focus is on the bar (e.g. tabbed to it), `onKeyDown`: if `e.key === 'Enter'` or `e.key === ' '`, call the same handler as bar click (open if closed and no search). |
| **Add / “+” icon in the bar** | Icon button next to the bar; `onClick` (with `stopPropagation`) should open the popover (same as bar click). |
| **Voice icon** | Opens popover with a pending “voice” action so the popover can show voice-specific UI if desired. |
| **Support Insights icon** | Sets `pendingAction = 'insights'` and opens popover so it can show insights-focused content. |
| **“View Tickets” (or similar)** | Sets `pendingAction = 'cases'` and opens popover; when popover mounts with `pendingAction === 'cases'`, show the **Cases** view and then clear `pendingAction`. |

**Open action:** `open()` sets state to `'default'`, and optionally syncs `query` from any existing value. It does **not** clear `searchQuery` (so the main content can still be showing full-page results while the popover is open).

### 1.3 How Close Is Handled

| Mechanism | Behavior |
|-----------|----------|
| **Escape** | **Document-level** `keydown` listener. If `e.key === 'Escape'` and `state !== 'closed'`, call `close()`. No need to check focus; Escape always closes. |
| **Click on overlay** | When the popover (or ticket form / case tracker) is open, a **dimmed overlay** is rendered behind it. The overlay is a full-screen div; `onClick` is attached to that div. In the handler, **only** call `close()` when `e.target === overlayRef.current` (so clicks on the popover itself do not close). Do **not** close when the Rovo side panel or Live Chat is open (those are not “modal” in the same way). |
| **Close button (X)** | Header of the popover (and of Search Results / Ticket / Cases) has a close button; `onClick` calls `close()`. |
| **Submit search (Option B bar)** | When the user submits from the **header input** (Enter), the app calls `submitSearch(query)`, which sets `searchQuery`, sets `query`, and sets state to `'closed'`. So the popover closes and the main content switches to the full-page search results view. |
| **Submit from popover (Enter or Send)** | In the current implementation, the popover’s form submit and Enter key also call `submitSearch(localQuery.trim())`, so the popover closes and the main content shows the full-page search results view. |

**Close action:** `close()` must:

- Set state to `'closed'`.
- Clear `query` and `searchQuery`.
- Clear any Loom/attachment and other transient state (e.g. `fixConfirmed`, `ticketCreatedByAgent` if you want a clean slate).

### 1.4 Bar Modes (What the Bar Shows)

- **Idle (closed, no search):** Placeholder text (e.g. “Ask Rovo for Help”). Optionally show a blinking cursor and a hint: “Press **R**”.
- **Active (popover open), Option A:** Placeholder or static text; input lives **inside the popover**, not in the bar.
- **Active (popover open), Option B:** The bar contains an **inline text input**; placeholder “Ask Rovo for Help”. On Enter in that input: `submitSearch(query)` (close + set `searchQuery`). A **clear** button (X) appears when there is text or when `searchQuery` is set; clicking it clears `query`/`searchQuery` and refocuses the input; optionally set `initialMainTab` to `'help'` so the popover resets to the Help tab.
- **Recording:** When Loom is “recording”, the bar shows “Recording…” and a spinner; clicking may be disabled or open the popover depending on product choice.
- **Has search:** When `searchQuery` is set (e.g. after submit), the bar can show the current search query text until the user clears it (clear button or clearing from the full-page view).

---

## 2. Keyboard Navigation & Accessibility

### 2.1 Current Behavior (As Implemented)

- **R** — Opens popover when closed; see §1.2.
- **Escape** — Closes popover (or ticket/case modal); see §1.3.
- **Enter on bar** — Activates the bar (open popover).
- **Space on bar** — Same as Enter (open popover).
- **Enter in header input (Option B)** — Submits search: `submitSearch(query)`.
- **Enter in popover textarea/input** — Submits search: `submitSearch(localQuery.trim())` (no newline; Shift+Enter could be reserved for newline if using textarea).

There is **no Up/Down arrow** handling in the current codebase for moving between result items or suggested prompts. There is **no tracked “focused index”** for result list or suggestions.

### 2.2 Recommended for Rebuild (Accessibility)

- **Arrow Down / Arrow Up** — When the popover is open and the input is focused, cycle through a single combined list of “suggested” items (e.g. recent searches, suggested prompts, or live result rows). Maintain an **active index** in state (e.g. `highlightedIndex`). Arrow Down increments, Arrow Up decrements; clamp to `[0, length - 1]`. Visually highlight the item at `highlightedIndex` (e.g. background or outline).
- **Enter** — When `highlightedIndex >= 0`, activate the item at that index (e.g. run the same action as clicking that item: set query, open Rovo, or navigate). When no item is highlighted, submit the current query (same as current behavior).
- **Escape** — Close popover; clear `highlightedIndex` on next open.
- **Focus management:** When the popover opens, move focus to the **input** inside the popover (Option A) or to the **header input** (Option B) after a short delay (e.g. 100–120 ms). When the popover closes, return focus to the bar (e.g. `barRef.current?.focus()`).
- **aria-label:** Bar: `aria-label="Ask Rovo for Help"`. Clear button: `aria-label="Clear search"` or `"Clear text"`. Close button: `aria-label="Close"`. Result items and suggestion chips should be keyboard-focusable and have clear labels.

---

## 3. UI Rendering Logic (The “Shell”)

### 3.1 Overall Structure

1. **Bar (in header)**  
   - One horizontal bar: icon (e.g. Rovo) + placeholder or input + optional clear + divider + action icons (Add, Voice, Loom, Support Insights).  
   - The bar has a **ref** used as the **anchor** for the popover position.  
   - Bar must be in the layout so that the popover can be positioned **below** it (or below the header).

2. **Overlay**  
   - Rendered when state is one of: `default`, `results`, `ticket_form`, `case_tracker`.  
   - **Not** rendered when state is `chat_panel` or `live_chat`.  
   - Full viewport; semi-transparent background; `onClick` → close when target is the overlay element.  
   - **z-index** above page content, below popover.

3. **Popover container**  
   - **Position:** Fixed; top/left/width derived from the **bar’s** `getBoundingClientRect()`: e.g. `top = rect.bottom + gap` (e.g. 1px), `left = rect.left`, `width = rect.width`.  
   - Update position on **scroll**, **resize**, and when the bar’s size changes (e.g. **ResizeObserver** on the bar).  
   - **Content** depends on state and internal view (see below).  
   - **role="dialog"**, **aria-label="Ask Rovo for Help"**, **aria-modal="true"** when used as a modal.

### 3.2 When State Is `default` — Popover “Home” Content

Internal **view** can be:

- **`home`** — Main view: header (icon, title, close) + body.
- **`cases`** — Table of support cases + “New Ticket” + filters; show when `pendingAction === 'cases'` on open, or when user clicks “View Tickets”.

**Loom flow** (if active): Replaces the normal body with recording / post-record / get-support steps. Not detailed here; treat as a separate sub-flow.

**Home body (when not Loom):**

- **Input:** One text input or textarea (Option A: inside popover; Option B: in header bar, popover body mirrors or is empty). Value = `query` (controlled); `onChange` updates `query`. Placeholder: “Ask Rovo for Help”.
- **Tabs:** Two tabs: **Help** | **AI**.
  - **Help tab:** Context-aware help links, “Try asking” (suggested prompts), “Recently asked” (recent questions), optional “Support AI Insights” list, and optionally a **proactive error** block (e.g. JSM error + “Apply recommended fix” + follow-up buttons) when in proactive mode.
  - **AI tab:** Sub-tabs: Summary | Help | Community | Videos. Content is driven by **debounced** query (see §5).

**Empty / initial state (no query or short query):**

- Show **Recently asked** (list of recent questions; each click opens Rovo panel with that query and context).
- Show **Try asking** or **Suggested prompts** (static or from `SUGGESTED_PROMPTS`).
- Optionally show **Help pages** list (context-based).
- No “live” results yet.

**Active search state (after debounced query):**

- **liveQuery** is set from input after debounce (e.g. 200–350 ms).
- When `liveQuery` has length ≥ 1 (Option B) or ≥ 3 (Option A), show:
  - **AI Summary** — One paragraph from `getAiSummary(liveQuery)`.
  - **Relevant prompts** — Up to 3 from `getRelevantPrompts(liveQuery)`.
  - **Help** (and optionally Community / Videos) lists filtered or derived from the same query.
- Optionally show a short **loading** state (e.g. “Rovo is thinking…”) during the debounce delay.

**Submit (Enter or Send button):**

- Call `submitSearch(localQuery.trim())`: set `searchQuery`, set state to `'closed'`. The **main content** then renders the **full-page Search Results** view (see below). Popover unmounts.

### 3.3 When State Is `results` — Popover “Search Results” View

A **separate** content variant is shown **inside the same popover** when state is `'results'` (reached by calling `submitQuery(q)` from somewhere, e.g. when user clicks a suggested prompt or follow-up chip in the full-page results view that triggers “search again” in popover).

- **Header:** Same as home (icon, “Ask Rovo for Help”, close).
- **Input:** Same as home; value = `query`; submit calls `submitSearch` (close and show full-page results).
- **Context chip:** “Context: &lt;contextUrl&gt;” with optional dismiss; when dismissed, AI summary uses “Searching by keyword only” prefix.
- **Body:**  
  - **Loading:** For ~600 ms show “Rovo is thinking…” and a spinner.  
  - **Then:**  
    - **AI Summary** — `getAiSummary(query).summary` and `.followUps` (as chips).  
    - **Relevant prompts** — `getRelevantPrompts(query)` (up to 3).  
    - **Relevant search results** — `getSearchResults(query)` as a list; each row: title, category, link, “Open in Rovo” button, “Open in new window” button.  
    - **Follow-up chips** — From `aiSummary.followUps`; click runs `onQuerySubmit(f)` so the parent can call `submitQuery(f)` and keep state `'results'` with new query.
- **Footer:** e.g. “Uses AI. Verify results.”

### 3.4 Full-Page Search Results (Main Content)

When **`searchQuery`** is non-empty, the **main content area** (below the header) does **not** render the normal routes; it renders a **full-page Search Results** layout:

- Same logical content as §3.3 (context chip, AI summary, suggested prompts, result list, follow-ups).
- Optional tabs: All | Help Pages | Community | Videos.
- Clearing `searchQuery` (e.g. from the bar’s clear button or a “Clear search” control) restores the normal routes.

So there are two ways to show “results”:

1. **Popover “results” view** — state `'results'`, popover visible with results inside it.  
2. **Full-page results** — `searchQuery` set, state usually `'closed'`, main content = Search Results page.

---

## 4. Data Structures & Mock JSON

### 4.1 Recent Questions

Used for “Recently asked” in the Help tab and for history.

```json
[
  { "id": "rq-1", "text": "Why is the EMEA billing queue surging?", "timestamp": 1709560800000 },
  { "id": "rq-2", "text": "Show SLA breach rate for NA Chat", "timestamp": 1709557200000 },
  { "id": "rq-3", "text": "How to set up automation in JSM?", "timestamp": 1709546400000 },
  { "id": "rq-4", "text": "Analyze customer sentiment trends", "timestamp": 1709463600000 },
  { "id": "rq-5", "text": "What is the average first response time today?", "timestamp": 1709377200000 }
]
```

- **id:** string.  
- **text:** string (the question).  
- **timestamp:** number (ms; for ordering “recent”).

### 4.2 Suggested Prompts (Static)

Shown when the input is empty or short.

```json
[
  "What are permission schemes in Jira?",
  "How do I configure SLA policies?",
  "What's the current P1/P2 ticket trend?",
  "Help me set up automation rules",
  "Show me today's support summary",
  "Identify cost saving opportunities from ticket deflection",
  "Summarize support health across all regions"
]
```

### 4.3 Search Results (Query-Dependent)

**SearchResult** shape:

```json
{
  "id": "sr-1",
  "title": "Getting Started with Support Insights 360",
  "category": "Getting Started",
  "excerpt": "Learn how to navigate the Support Insights 360 dashboard and understand key metrics.",
  "slug": "getting-started-support-insights-360",
  "url": "/article/getting-started-support-insights-360"
}
```

**Lookup rule (no backend):** From the user’s query string (lowercased), pick a bucket and return the corresponding array:

- Query contains **“permission”** → return **permissions** bucket.
- Query contains **“sla”** or **“breach”** → return **sla** bucket.
- Query contains **“automation”** or **“rule”** → return **automation** bucket.
- Query contains **“429”**, **“rate limit”**, or **“too many requests”** → return **rateLimit** bucket.
- Otherwise → return **default** bucket.

**Example buckets (default and permissions):**

```json
{
  "default": [
    {
      "id": "sr-1",
      "title": "Getting Started with Support Insights 360",
      "category": "Getting Started",
      "excerpt": "Learn how to navigate the Support Insights 360 dashboard and understand key metrics.",
      "slug": "getting-started-support-insights-360",
      "url": "/article/getting-started-support-insights-360"
    },
    {
      "id": "sr-3",
      "title": "What are permission schemes in Jira?",
      "category": "Jira Administration",
      "excerpt": "Permission schemes define what users can do within a project, controlling access to features.",
      "slug": "jira-permission-schemes",
      "url": "/article/jira-permission-schemes"
    }
  ],
  "permissions": [
    {
      "id": "sr-3",
      "title": "What are permission schemes in Jira?",
      "category": "Jira Administration",
      "excerpt": "Permission schemes define what users can do within a project, controlling access to features.",
      "slug": "jira-permission-schemes",
      "url": "/article/jira-permission-schemes"
    },
    {
      "id": "sr-5",
      "title": "Project Roles vs Permission Schemes",
      "category": "Jira Administration",
      "excerpt": "Understand the difference between project roles and permission schemes in Jira.",
      "slug": "project-roles-vs-permission-schemes",
      "url": "/article/project-roles-vs-permission-schemes"
    }
  ]
}
```

(Implement equivalent buckets for **sla**, **automation**, **rateLimit** with 3–4 items each.)

### 4.4 AI Summary (Query-Dependent)

**AiSummary** shape:

```json
{
  "query": "permissions jira",
  "summary": "Permission schemes in Jira define what users can do within a project. They control access to features like creating, editing, and managing issues. You can configure them under Project Settings > Permissions.",
  "followUps": [
    "How do I grant admin permissions to a project?",
    "What is the difference between a project role and a group?",
    "Can I copy a permission scheme to another project?"
  ]
}
```

**Lookup rule:** Match the query (lowercased) against a small list of **keyword phrases**; if any phrase’s words appear in the query, return that entry’s summary and followUps; otherwise return a **default** summary and 3 generic follow-ups. Prefix the summary with “Searching by keyword only (page context removed). ” when the user has dismissed context.

**Example default:**

```json
{
  "query": "",
  "summary": "I found several relevant articles and documentation that may help with your query. The results below are ranked by relevance based on your current page context and question.",
  "followUps": [
    "Can you explain this in more detail?",
    "Show me step-by-step instructions",
    "What are the best practices for this?"
  ]
}
```

### 4.5 Relevant Prompts (Query-Dependent, Up to 3)

Input: current query string. Output: array of up to **3** prompt strings.

**Logic:** Maintain a **prompt pool**: each entry has `keywords: string[]` and `prompt: string`. Split the query into words; for each pool entry, count how many keywords match (word overlap). Sort by score descending; take top 3 prompts. If query length &lt; 3 characters, return `[]`.

**Example pool (subset):**

```json
[
  { "keywords": ["permission", "access", "role"], "prompt": "How do I grant admin access to a Jira project?" },
  { "keywords": ["sla", "breach", "policy"], "prompt": "How do I configure SLA time goals for different priorities?" },
  { "keywords": ["automation", "rule", "trigger"], "prompt": "How do I create an automation rule in Jira Service Management?" }
]
```

### 4.6 Context URL (Derived from Route)

No mock JSON; derive from current pathname, e.g.:

- `/` or `` → `https://williamsracing.com/jsm/projects`
- `/insights` → `https://williamsracing.com/insights`
- `/insight/:id` → `https://williamsracing.com/insight/:id`
- `/confluence` → `https://williamsracing.com/confluence/pages`
- Include search and hash if needed.

Use this for the “Context:” chip and for passing “with context” vs “without context” into `getAiSummary`.

---

## 5. Interactions & Micro-animations

### 5.1 Debounce (Live Query)

- **Input** in the bar or popover updates **query** on every `onChange`.
- **Live query** (used for inline AI summary and suggestions) is updated **after a delay** when the user stops typing:
  - **Option A:** delay **350 ms**; only set live query when `query.trim().length >= 3`.
  - **Option B:** delay **200 ms**; set live query when `query.trim().length >= 1`.
- While waiting for the timer, show a **loading** flag (e.g. `liveLoading = true`). When the timer fires, set `liveQuery = trimmedQuery` and `liveLoading = false`. If the user types again before the timer fires, cancel the previous timer and start a new one.

### 5.2 Loading States

- **Popover “live” content (AI tab):** During the debounce period, show a subtle “Rovo is thinking…” or spinner so the user sees that the list will update.
- **Search Results view (popover or full page):** After the user submits, show a loading state for **~600 ms** (e.g. spinner + “Rovo is thinking…”), then show the AI summary, result list, and follow-ups. This can be a simple `useState` + `setTimeout` or a small state machine.

### 5.3 Hover & Focus

- **Bar:** Hover and “active” (popover open) states should be distinct (e.g. background, border, or glow). The bar is the primary affordance; styling should make it feel like a premium AI entry point.
- **Result rows / suggestion chips:** Apply hover and focus styles (e.g. background change) so the user can see which item is interactive. If you implement **keyboard navigation** (§2.2), the item at `highlightedIndex` should use the same or a stronger visual state (e.g. focus ring or background).
- **Buttons (clear, close, Add, Voice, Loom, etc.):** Hover and focus visible; optional focus ring for accessibility.

### 5.4 Popover Position

- Update popover **top/left/width** when:
  - The window **scrolls** (use capture so you get scroll from any scrollable container).
  - The window **resizes**.
  - The bar’s size or position changes (**ResizeObserver** on the bar element).
- Use **requestAnimationFrame** or throttle so you don’t update layout on every scroll tick. Gap between bar and popover: e.g. **1px** (configurable).

### 5.5 Optional Micro-animations

- **Popover open:** Fade-in or short slide-down (e.g. 150–200 ms).
- **Popover close:** Reverse or fade-out.
- **Loading spinner:** Indeterminate spinner or three dots for “Rovo is thinking…”.
- **Bar “recording”:** Spinner or pulse when Loom is recording.

---

## Summary for Implementation

- **State:** One global omni context with `state`, `query`, `searchQuery`, `contextUrl`, `contextDismissed`, `pendingAction`, `initialMainTab`; actions `open`, `close`, `setQuery`, `submitQuery`, `submitSearch`, `clearSearch`, etc.
- **Triggers:** Bar click, **R** key (no modifiers, not in input), Enter/Space on bar; close via Escape, overlay click, close button, and submit (which calls `submitSearch` and closes).
- **Keyboard:** Add optional Up/Down + Enter for result/suggestion list with a single `highlightedIndex`; focus input on open, focus bar on close.
- **Shell:** Bar (anchor ref) → overlay (when modal) → popover (fixed under bar). Popover content: home (tabs Help / AI, empty vs live) or cases; or results view when state is `'results'`. Full-page results when `searchQuery` is set.
- **Data:** Recent questions (array of `{ id, text, timestamp }`), suggested prompts (string array), search results (bucket by keywords, return array of `{ id, title, category, excerpt, slug, url }`), AI summary (keyword match → `{ query, summary, followUps }`), relevant prompts (keyword score → top 3 strings).
- **Interactions:** Debounce live query (200–350 ms), loading flag during debounce and for 600 ms on results view, hover/focus on list items and bar, position sync on scroll/resize/ResizeObserver.

Use this spec to rebuild the omni bar and popover with **custom premium styling** for the bar and **Atlassian Design System** for the rest of the app where appropriate.
