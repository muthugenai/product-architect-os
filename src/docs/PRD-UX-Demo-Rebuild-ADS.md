# Product Requirements Document (PRD): AI-First Support Search Help — UX Demo Rebuild (Atlassian Design System)

**Purpose:** This PRD is a blueprint for rebuilding a **frontend-only UX Demo** of the app **strictly using the Atlassian Design System (ADS)**. All specifications focus on user journey, interface, and **mapping every UI element to @atlaskit components**. **Ignore:** backend logic, database schemas, and real API integrations. **Focus:** What the user sees, clicks, and which ADS component implements it.

---

## 1. App Overview & Core Value Proposition

### Summary
The app is an **AI-first help and support experience** for Atlassian product admins (Jira Service Management, Jira Spaces, Confluence, Support Insights 360). It unifies search, in-context help, AI assistance (Rovo), and escalation to live agents or support tickets into a single entry point: the **Unified Ask Rovo Omni Bar** in the header.

### Problem Solved
Admins today encounter **fragmented touchpoints** for help: header search, help icon, “Ask Rovo” in a corner, and a separate Loom recording button. This app demonstrates a **unified, proactive** experience: one bar that can detect page context, surface relevant articles and AI summaries, and—when deflection isn’t enough—let users record a Loom and escalate to a live agent or create a ticket without leaving the flow.

### Core Value
- **Single entry point:** One “Ask Rovo for Help” bar for search, help, and support.
- **Context-aware:** Help and AI responses are informed by the current page (JSM, Confluence, Insights, Spaces).
- **Progressive disclosure:** From quick answers → Rovo chat/summaries → Live Chat or Create Ticket, with Loom attachable.
- **Demo modes:** “Rovo modes” (Reactive, Proactive, Predictive, God) change how alerts and CTAs appear on pages to showcase proactive vs reactive behavior.

---

## 2. Information Architecture & Routing

### 2.1 Sitemap (Routes)

| Route | Page / Screen | Description |
|-------|----------------|-------------|
| `/` | **JSM Page** | Jira Service Management — ticket queue view (e.g. “Besties” project, All open tickets). |
| `/insights` | **Dashboard** | Support Insights 360 — KPI cards, Today’s Summary, trend chart, insight alerts. |
| `/insight/:id` | **Insight Detail** | Single insight with trend chart, causes, fixes. |
| `/confluence` | **Confluence Page** | Confluence home — placeholder content; same shell and header. |
| `/spaces` | **Spaces Page** | Jira Spaces — list/grid of spaces with filters, search, sort. |
| `/agenda` | **Agenda Page** | Full-screen presentation mode; no header. |
| `/article/:slug` | **Article Page** | Help article — breadcrumb, title, content, related articles. |
| `/support-insights-icon-options` | **Icon Demo** | Dev/demo page for Support Insights icon set. |

**Special behavior:** When `searchQuery` is set, main content shows **Search Results Page** (full-width) until search is cleared.

### 2.2 Navigation Structure & ADS Layout Components

- **App shell**
  - Use **@atlaskit/page-layout** (or equivalent layout primitives) to define: **left sidebar** + **main content** + optional **right panel** (Rovo / Live Chat). Main content area should shrink when right panel is open (e.g. 400px panel width).

- **Left sidebar (collapsible)**
  - **ADS mapping:** **@atlaskit/side-navigation** for the primary nav list (Spaces, Recent, Starred; or Dashboard + Insights list; or JSM project/queues).
  - **Brand + product name:** Use a custom header block above the side nav, or **@atlaskit/side-navigation** `NavigationHeader` / top slot for product name (e.g. “Jira Service Management,” “Confluence”).
  - **Collapse toggle:** **@atlaskit/button** (icon-only, `appearance="subtle"`) to collapse/expand; width 240px ↔ 52px.
  - **Bottom section (app switcher, Rovo mode, Experience):** Each is a **@atlaskit/dropdown-menu** trigger (or **@atlaskit/select** for single-select). Use **@atlaskit/button** with `iconAfter` chevron; menu content via **@atlaskit/dropdown-menu** with **@atlaskit/menu-group** and **@atlaskit/button** as items (navigate on click).
  - **Agenda page:** Same sidebar; apply dark theme (e.g. `theme="dark"` if supported, or custom dark background).

- **Top bar (header)** — hidden on `/agenda`
  - **ADS mapping:** **@atlaskit/atlassian-navigation** (or **@atlaskit/navigation-next** if rebuilding with modern nav). Structure:
    - **Primary slot:** The “Ask Rovo” bar — use a **@atlaskit/button** (or custom composite: icon + **@atlaskit/textfield** for Option B) that fills the primary area; `appearance="primary"` or custom Rovo purple styling per design tokens.
    - **Icon actions:** **@atlaskit/button** (icon-only) for Add, Voice, Loom, Support Insights. Loom opens **@atlaskit/dropdown-menu** (Record a Loom / Record screen only / Record camera only).
    - **Right section:** **@atlaskit/button** (icon) for Notifications; **@atlaskit/badge** for count (e.g. 4). **@atlaskit/button** for Settings. **@atlaskit/avatar** for user (“JD” initials).
  - **Keyboard:** “R” opens OmniBox; implement via global keydown when bar is focused or document.

- **Main content**
  - Single column; scrollable. Use **@atlaskit/page-layout** content area or a simple scrollable container. When Rovo/Live Chat panel is open, reserve 400px for the right panel (custom panel slot; no specific ADS component—use layout + **@atlaskit/button** close + content).

### 2.3 Modal Overlays & ADS Mapping

| Overlay | Trigger | ADS component |
|---------|---------|----------------|
| **OmniBox popup** | Click “Ask Rovo” bar or R | **@atlaskit/popup** or **@atlaskit/modal-dialog** (if full overlay). Prefer **@atlaskit/popup** anchored to the bar; content: **@atlaskit/tabs** (Help | AI), **@atlaskit/textfield** / textarea for input, lists with **@atlaskit/button**. |
| **Search results (full page)** | Submit query | Not a modal; replace main content. Use **@atlaskit/page-layout** + **@atlaskit/tabs** + list of **@atlaskit/card** or rows. |
| **Rovo Side Panel** | “Ask Rovo” / “Apply recommended fix” | Right panel: **@atlaskit/button** (close), **@atlaskit/textfield** (input), message list (custom or **@atlaskit/card** per message), **@atlaskit/button** for actions. |
| **Live Chat** | “Connect with a live agent” | Same panel slot as Rovo; **@atlaskit/spinner** for “Connecting…”; message list; **@atlaskit/flag** (success) when “Ticket created” is shown (optional). |
| **Support Ticket Form** | “Create a support ticket” / “New Ticket” | **@atlaskit/modal-dialog** with **@atlaskit/form**-like layout: **@atlaskit/textfield** (subject), **@atlaskit/select** (priority), **@atlaskit/textarea** (description), **@atlaskit/button** (Submit). Success state: inline content with **@atlaskit/flag** (success) or simple message + **@atlaskit/button** “Done.” |
| **Case Tracker / Cases view** | “View Tickets” or Cases in popup | Inside popup: **@atlaskit/button** (New Ticket, filters), **@atlaskit/dynamic-table** for cases. Standalone: **@atlaskit/modal-dialog** + same table. |
| **Overlay (dimmed)** | When popup or ticket form open | **@atlaskit/modal-dialog** provides overlay; or **@atlaskit/layer** for custom overlay + **@atlaskit/blanket** for dimming. |

---

## 3. Page-by-Page UI/UX Breakdown & ADS Mapping

### 3.1 JSM Page (`/`)

- **Layout & structure**
  - Top: optional **Rovo alert block** (depends on Rovo mode). Below: **@atlaskit/breadcrumbs** (Projects / Besties / All tickets). Then **@atlaskit/page-header** (title: “All open tickets,” actions: icon buttons). **@atlaskit/textfield** (filter). **@atlaskit/dynamic-table** (tickets).
  - Use **@atlaskit/page-layout** with **PageHeader** and content region.

- **Component mapping**
  - **Alert block (reactive/proactive/predictive/god):** **@atlaskit/banner** or **@atlaskit/flag** (error / warning / info). Or **@atlaskit/card** with left border color (blue/orange) and **@atlaskit/button** CTAs.
  - **Breadcrumb:** **@atlaskit/breadcrumbs**.
  - **Page title + actions:** **@atlaskit/page-header** (title, optional breadcrumb, **@atlaskit/button** icon buttons).
  - **Filter input:** **@atlaskit/textfield** (`placeholder="Placeholder"`).
  - **Ticket table:** **@atlaskit/dynamic-table**. Columns: checkbox (**@atlaskit/checkbox**), Type (custom cell with colored dot), Key, Summary (link), Reporter, Assignee (**@atlaskit/avatar** + name), Status (**@atlaskit/lozenge**), Created. Rows from mock tickets.
  - **Buttons in alert:** **@atlaskit/button** (“Apply recommended fix” = primary or custom Rovo; “Ask Rovo,” “Ask a follow up question” = default/subtle).
  - **Ticket created message (when ticketCreatedByAgent):** **@atlaskit/card** or **@atlaskit/flag** (success) with text and link (**@atlaskit/link**).

- **Typography & styling**
  - Use **@atlaskit/heading** for page title (e.g. `level="h800"`). Body text: ADS default body (e.g. **@atlaskit/design-system** typography). Status: **@atlaskit/lozenge** (appearance: `success` | `inprogress` | `default`).

---

### 3.2 Dashboard — Support Insights 360 (`/insights`)

- **Layout & structure**
  - **@atlaskit/page-layout** + optional **@atlaskit/flag** at top. Grid of KPI cards; then “Today’s Summary” block; then trend chart; then insight list.

- **Component mapping**
  - **KPI cards:** **@atlaskit/card** (or **@atlaskit/section-message** for single metric). Each: icon (custom or **@atlaskit/icon**), value (**@atlaskit/heading**), delta (**@atlaskit/lozenge** or text), sub label.
  - **Today’s Summary:** **@atlaskit/card** with **@atlaskit/heading** + body text.
  - **Trend chart:** Custom SVG or **@atlaskit/chart** if used in ADS; otherwise custom inline SVG with ADS colors.
  - **Insight list:** **@atlaskit/card** or **@atlaskit/section-message** per item; left border color by level (error/warning/info/success). **@atlaskit/button** “Ask Rovo” (subtle).

- **Typography**
  - Section titles: **@atlaskit/heading** (e.g. `h600`). Body: default body.

---

### 3.3 Insight Detail (`/insight/:id`)

- **Layout & structure**
  - **@atlaskit/breadcrumbs** → **@atlaskit/page-header** (title, **@atlaskit/lozenge** severity, tags). Sections: What happened, Trend chart, Impact, Causes, How to fix, Data sources.

- **Component mapping**
  - **Breadcrumb:** **@atlaskit/breadcrumbs**.
  - **Title + severity/tags:** **@atlaskit/page-header**; **@atlaskit/lozenge** for severity (e.g. `appearance="danger"` for high).
  - **Trend chart:** Custom SVG (or ADS chart if available).
  - **Cause cards:** **@atlaskit/card** with **@atlaskit/heading** + text.
  - **Fix list:** **@atlaskit/list** or table of action + owner.
  - **Metadata:** **@atlaskit/text** (small).

---

### 3.4 Confluence Page (`/confluence`)

- **Layout & structure**
  - Same shell. Main: placeholder content. Optional **@atlaskit/flag** or **@atlaskit/banner** (e.g. “Macro failed to render”) with **@atlaskit/button** (“Apply recommended fix,” “Ask a follow up question”).

- **Component mapping**
  - **Alert:** **@atlaskit/flag** (error) or **@atlaskit/banner**; **@atlaskit/button** (primary / subtle).

---

### 3.5 Spaces Page (`/spaces`)

- **Layout & structure**
  - Optional alert; toolbar: **@atlaskit/textfield** (search), **@atlaskit/select** or **@atlaskit/button** group (filters), sort control. Grid of space cards.

- **Component mapping**
  - **Search:** **@atlaskit/textfield**.
  - **Filters / sort:** **@atlaskit/select** or **@atlaskit/dropdown-menu** with **@atlaskit/button**.
  - **Space cards:** **@atlaskit/card** (name, key, type **@atlaskit/lozenge**, description, **@atlaskit/button** icon for star).
  - **Empty state:** **@atlaskit/empty-state** (illustration + title + description + **@atlaskit/button** CTA).
  - **Error state:** **@atlaskit/flag** (error) or **@atlaskit/empty-state** (error variant if available).

---

### 3.6 Agenda Page (`/agenda`)

- **Layout & structure**
  - Full viewport; no header. Sidebar: **@atlaskit/side-navigation** (dark). Content: centered slides with **@atlaskit/heading** + **@atlaskit/text** + list. Nav: **@atlaskit/button** (prev/next) or dots.

- **Component mapping**
  - **Section content:** **@atlaskit/heading**, **@atlaskit/text**, **@atlaskit/list** (bullets). Optional **@atlaskit/lozenge** or **@atlaskit/tag** for “variant” pills (search, help, askrovo, loom).
  - **Navigation:** **@atlaskit/button** (icon: ChevronLeft, ChevronRight); or custom dot indicators.

---

### 3.7 Article Page (`/article/:slug`)

- **Layout & structure**
  - **@atlaskit/breadcrumbs** → **@atlaskit/lozenge** (category) → **@atlaskit/heading** (title) → meta → body (markdown) → **@atlaskit/list** (related articles).

- **Component mapping**
  - **Breadcrumb:** **@atlaskit/breadcrumbs**.
  - **Category:** **@atlaskit/lozenge**.
  - **Title:** **@atlaskit/heading**.
  - **Body:** Rendered markdown (use **@atlaskit/design-system** typography; or **@atlaskit/editor-core** read-only if ADF).
  - **Related:** **@atlaskit/list** with **@atlaskit/link**.

---

### 3.8 Search Results Page (when `searchQuery` is set)

- **Layout & structure**
  - **Context chip:** **@atlaskit/tag** or **@atlaskit/card** (dismissible with **@atlaskit/button** icon). **@atlaskit/card** (AI summary). **@atlaskit/tabs** (All | Help Pages | Community | Videos). Result list. **@atlaskit/button** chips (suggested prompts).

- **Component mapping**
  - **Context chip:** **@atlaskit/tag** + **@atlaskit/button** (close icon).
  - **Summary:** **@atlaskit/card** with text.
  - **Tabs:** **@atlaskit/tabs** (tab items: All, Help Pages, Community, Videos).
  - **Result rows:** **@atlaskit/card** or list row: title (**@atlaskit/heading** or link), category (**@atlaskit/lozenge**), excerpt, **@atlaskit/button** “Ask Rovo.”
  - **Suggested prompts:** **@atlaskit/button** (appearance="subtle") repeated.

---

### 3.9 OmniBox Popup (Home view)

- **Layout & structure**
  - **@atlaskit/popup** (or **@atlaskit/modal-dialog**). Header: icon + “Ask Rovo for Help” (**@atlaskit/heading**) + **@atlaskit/button** (close). Body: **@atlaskit/tabs** (Help | AI). Help tab: help page list, proactive error block, suggested prompts. AI tab: **@atlaskit/tabs** (Summary | Help | Community | Videos); Summary: AI text + **@atlaskit/button** follow-ups.

- **Component mapping**
  - **Header:** **@atlaskit/heading** + **@atlaskit/button** (icon, close).
  - **Input (Option A):** **@atlaskit/textarea** or **@atlaskit/textfield** (multiline if needed).
  - **Tabs:** **@atlaskit/tabs**.
  - **Help list / AI lists:** **@atlaskit/list** or **@atlaskit/card** per item; **@atlaskit/button** on each.
  - **Proactive error block (JSM/Confluence):** **@atlaskit/card** or **@atlaskit/flag**; **@atlaskit/button** (“Apply recommended fix,” etc.).
  - **Loom flow (recording):** **@atlaskit/button** “Start” / “Finish”; **@atlaskit/spinner** when “Recording…”
  - **Post-record / Get Support:** **@atlaskit/card** (thumbnail, summary), **@atlaskit/button** (“Apply recommended fix,” “Ask a follow up question,” “Get Support,” “Connect with a live agent,” “Create a support ticket”).
  - **Cases view (inside popup):** **@atlaskit/button** (Back, New Ticket), **@atlaskit/button** group (All / Open Only / Resolved), **@atlaskit/dynamic-table** (Case ID, Subject, Priority **@atlaskit/lozenge**, Status **@atlaskit/lozenge**, Updated), **@atlaskit/link** “View all cases in JSM.”

---

### 3.10 Rovo Side Panel

- **Component mapping**
  - **Header:** **@atlaskit/heading** + **@atlaskit/button** (close). **@atlaskit/tag** or chip for context.
  - **Messages:** Custom message list; each bubble: **@atlaskit/card** or div with **@atlaskit/avatar** (assistant) + **@atlaskit/text**. Charts: custom SVG or **@atlaskit/chart**.
  - **Support actions:** **@atlaskit/button** (“Connect with a live agent,” “Create a Support ticket”).
  - **Input:** **@atlaskit/textfield** or **@atlaskit/textarea** + **@atlaskit/button** (send).
  - **Apply Fix:** **@atlaskit/button** (primary) + **@atlaskit/modal-dialog** (confirm/cancel) or **@atlaskit/button** (Cancel). On confirm: set `fixConfirmed`; optionally **@atlaskit/flag** (success).

---

### 3.11 Live Chat Panel

- **Component mapping**
  - **Header:** **@atlaskit/heading** (“Rovo / Live Agent”), **@atlaskit/avatar** (agent), status dot, **@atlaskit/button** (close).
  - **Connecting:** **@atlaskit/spinner** + **@atlaskit/text** “Connecting you to an agent…”
  - **Messages:** Same as Rovo (bubbles with **@atlaskit/card** / **@atlaskit/text**).
  - **Ticket created card:** **@atlaskit/card** with **@atlaskit/flag** (success) or green check; rows: Key, Summary, Priority, Assignee, Status (**@atlaskit/lozenge**).
  - **Input:** **@atlaskit/textfield** + **@atlaskit/button** (send).

---

### 3.12 Support Ticket Form (modal)

- **Component mapping**
  - **Container:** **@atlaskit/modal-dialog** (title: “Create a Support Ticket,” **@atlaskit/button** Back, **@atlaskit/button** Close).
  - **Form:** **@atlaskit/textfield** (Summary), **@atlaskit/select** (Priority: P1, P2, P3, P4), **@atlaskit/textarea** (Description), optional Loom attach (**@atlaskit/button**). **@atlaskit/button** (Submit, appearance="primary").
  - **Success:** Same modal body replaced with **@atlaskit/heading** “Ticket Submitted!”, **@atlaskit/text** (ticket #), **@atlaskit/button** “Done.”

---

### 3.13 Case Tracker (standalone modal)

- **Component mapping**
  - **@atlaskit/modal-dialog**: header (icon + “Your Support Cases” + close). **@atlaskit/button** “Create Support Ticket,” **@atlaskit/button** (All Cases, Open Only). **@atlaskit/dynamic-table** (Case ID, Subject, Priority, Status, Updated). Footer: **@atlaskit/link** “View all cases in JSM.”

---

## 4. Crucial User Flows (“Happy Paths”) — With ADS Components

### Flow 1: Ask Rovo → AI Summary → Escalate to Live Agent (Proactive Demo)

1. User is on **JSM Page** (Proactive mode). Page shows **@atlaskit/flag** or **@atlaskit/banner** + **@atlaskit/button** “Apply recommended fix.”
2. User clicks **“Ask Rovo for Help”** (**@atlaskit/button** in **@atlaskit/atlassian-navigation**). **@atlaskit/popup** opens with **@atlaskit/tabs** (Help | AI).
3. User types in **@atlaskit/textfield** / **@atlaskit/textarea** and submits. App opens **Rovo Side Panel** (right panel) with **@atlaskit/card** messages and **@atlaskit/button** “Apply recommended fix” / “Connect with a live agent.”
4. User clicks **“Connect with a live agent.”** **Live Chat** panel opens (same slot). **@atlaskit/spinner** “Connecting…” then scripted **@atlaskit/card** messages; **@atlaskit/card** “Ticket created” (WPT-1042).
5. User closes panel. On JSM Page, alert block now shows **“Ticket created”** (**@atlaskit/flag** success or **@atlaskit/card** with **@atlaskit/link** WPT-1042) instead of **@atlaskit/button** “Apply recommended fix.”

### Flow 2: Record Loom → Get Support → Create Ticket

1. User clicks **Ask Rovo** bar → **@atlaskit/button** (Loom) → **@atlaskit/dropdown-menu** “Record screen only.” **@atlaskit/popup** shows Loom step; **@atlaskit/button** “Start” → after 3s **@atlaskit/spinner** then “complete.”
2. **@atlaskit/popup** shows **@atlaskit/card** (thumbnail, summary), **@atlaskit/button** “Get Support.”
3. Get Support flow: **@atlaskit/button** “Ask a Follow Up Question” → loading (**@atlaskit/spinner**) → Rovo response + **@atlaskit/button** “Create a support ticket.”
4. User clicks “Create a support ticket.” **@atlaskit/modal-dialog** (Support Ticket Form): **@atlaskit/textfield**, **@atlaskit/select**, **@atlaskit/textarea**, **@atlaskit/button** “Create Ticket.”
5. Success state in modal: **@atlaskit/heading** “Ticket Created Successfully!”, **@atlaskit/flag** (success) or text + ticket ID, **@atlaskit/button** “Done.”

### Flow 3: Search → Results → Article or Rovo Panel

1. User clicks **Ask Rovo** bar → **@atlaskit/popup** opens. User types in **@atlaskit/textfield** and submits.
2. Main content shows **Search Results Page**: **@atlaskit/tag** (context), **@atlaskit/card** (AI summary), **@atlaskit/tabs** (All | Help | Community | Videos), result list (**@atlaskit/card** or rows), **@atlaskit/button** (suggested prompts).
3. User clicks a result link → **Article Page** (**@atlaskit/breadcrumbs**, **@atlaskit/heading**, body, **@atlaskit/list** related). Or user clicks “Ask Rovo” on result → **Rovo Side Panel** opens with **@atlaskit/card** messages and **@atlaskit/button** actions.

---

## 5. Interactions & State Management (Demo Level) — ADS

### 5.1 Loading & Empty States (ADS)

- **Loading**
  - **@atlaskit/spinner** for: “Connecting…” (Live Chat), “Recording…” (Loom bar), “Loading…” (Search results), Rovo “typing” in panel.
  - Use **@atlaskit/spinner** with `size="large"` or `"medium"` as appropriate; optionally wrap content in a container that shows spinner until data is ready.

- **Empty states**
  - **Spaces Page (no spaces):** **@atlaskit/empty-state** (title, description, **@atlaskit/button** CTA).
  - **Search (no results):** **@atlaskit/empty-state** or inline message “No results” with **@atlaskit/text**.
  - **Cases (no cases):** **@atlaskit/empty-state** in Cases view or **@atlaskit/dynamic-table** empty body.

- **Error states**
  - **Spaces (page error):** **@atlaskit/flag** (error) or **@atlaskit/empty-state** (error variant).
  - **Article/Insight not found:** **@atlaskit/heading** “Article not found” + **@atlaskit/button** “Back to Dashboard.”

### 5.2 Success & Feedback (ADS)

- **Ticket created (Live Chat):** Show **@atlaskit/card** with ticket key and **@atlaskit/flag** (success) in panel; set `ticketCreatedByAgent = true` so page alert updates.
- **Ticket form submitted:** Replace form body with success message + **@atlaskit/button** “Done”; optionally **@atlaskit/flag** (success) at top of modal.
- **Fix applied (Rovo panel):** On “Apply recommended fix” confirm, set `fixConfirmed = true`; optionally **@atlaskit/flag** (success) and close panel; page hides proactive alert block.

### 5.3 Core Frontend States to Mock

- **OmniBox state:** `closed` | `default` | `results` | `chat_panel` | `live_chat` | `ticket_form` | `case_tracker`.
- **searchQuery**, **query**: when `searchQuery` set, show Search Results Page.
- **rovoMode:** `reactive` | `proactive` | `predictive` | `god` — drives **@atlaskit/flag** / **@atlaskit/banner** content on JSM, Spaces, Confluence.
- **fixConfirmed**, **ticketCreatedByAgent**: booleans; drive alert block content (hide vs show “Ticket created” message).
- **Loom:** `loomRecordingInProgress`, `loomRecordingReady`, `loomAttachment`.
- **Popup sub-views:** view (home | cases), loomFlowView, followUpPhase, mainTab, aiSubTab.
- **Sidebar:** collapsed (boolean).
- **Empty/error:** Spaces `pageState`; optional `?empty=1` for **@atlaskit/empty-state**.

---

## 6. Mock Data Schemas (for ADS Components)

### 6.1 Tickets — for @atlaskit/dynamic-table (JSM Page)

Use this shape for **@atlaskit/dynamic-table** `head` and `rows`. Map `type` to a custom cell (colored dot); `status` to **@atlaskit/lozenge**; `assignee` to **@atlaskit/avatar** + name.

```json
{
  "head": {
    "cells": [
      { "key": "checkbox", "content": "" },
      { "key": "type", "content": "T" },
      { "key": "key", "content": "Key" },
      { "key": "summary", "content": "Summary" },
      { "key": "reporter", "content": "Reporter" },
      { "key": "assignee", "content": "Assignee" },
      { "key": "status", "content": "Status" },
      { "key": "created", "content": "Created" }
    ]
  },
  "rows": [
    {
      "key": "SEC-001",
      "cells": [
        { "key": "checkbox", "content": "<Checkbox />" },
        { "key": "type", "content": "bug", "meta": { "color": "#de350b" } },
        { "key": "key", "content": "SEC-001" },
        { "key": "summary", "content": "My ship's navigation system has a bug...", "meta": { "href": "#" } },
        { "key": "reporter", "content": "Crystal Wu" },
        { "key": "assignee", "content": "Michael Chu", "meta": { "avatarUrl": "https://..." } },
        { "key": "status", "content": "OPEN", "meta": { "lozengeAppearance": "inprogress" } },
        { "key": "created", "content": "2022-11-21" }
      ]
    }
  ]
}
```

Extend `rows` with 5–10 items. **@atlaskit/dynamic-table** accepts `head` and `rows`; render custom cells (checkbox, type dot, link, avatar, lozenge) via `cellRenderer` or equivalent.

### 6.2 Support Cases — for @atlaskit/dynamic-table (Case Tracker / Cases view)

Use for **@atlaskit/dynamic-table** in Cases view and Case Tracker modal. Priority and Status map to **@atlaskit/lozenge** (e.g. P1 → danger, P2 → warning, P3 → default; open → inprogress, resolved → success).

```json
{
  "head": {
    "cells": [
      { "key": "id", "content": "Case ID" },
      { "key": "subject", "content": "Subject" },
      { "key": "priority", "content": "Priority" },
      { "key": "status", "content": "Status" },
      { "key": "updated", "content": "Updated" }
    ]
  },
  "rows": [
    {
      "key": "JSM-5801",
      "cells": [
        { "key": "id", "content": "JSM-5801" },
        { "key": "subject", "content": "EMEA Billing queue spike investigation" },
        { "key": "priority", "content": "P1", "meta": { "lozengeAppearance": "danger" } },
        { "key": "status", "content": "Open", "meta": { "lozengeAppearance": "inprogress" } },
        { "key": "updated", "content": "2h ago" }
      ]
    },
    {
      "key": "JSM-5789",
      "cells": [
        { "key": "id", "content": "JSM-5789" },
        { "key": "subject", "content": "SLA breach notifications not firing" },
        { "key": "priority", "content": "P2", "meta": { "lozengeAppearance": "warning" } },
        { "key": "status", "content": "In Progress", "meta": { "lozengeAppearance": "inprogress" } },
        { "key": "updated", "content": "5h ago" }
      ]
    }
  ]
}
```

### 6.3 Priority options — for @atlaskit/select (Support Ticket Form)

Use for **@atlaskit/select** (single select) in the ticket form.

```json
[
  { "label": "P1 — Critical", "value": "P1" },
  { "label": "P2 — High", "value": "P2" },
  { "label": "P3 — Medium", "value": "P3" },
  { "label": "P4 — Low", "value": "P4" }
]
```

---

## Implementation Notes for Rebuild (ADS)

- **Design tokens:** Use **@atlaskit/design-system** (or **@atlaskit/theme**) for colors, spacing, typography. Preserve Rovo purple (#6554C0) for primary “Ask Rovo” and Rovo CTAs where design specifies.
- **Navigation:** **@atlaskit/atlassian-navigation** (or **@atlaskit/navigation-next**) for top bar; **@atlaskit/side-navigation** for left sidebar. Ensure collapse/expand and dropdowns use **@atlaskit/dropdown-menu** and **@atlaskit/button**.
- **Modals & popups:** **@atlaskit/modal-dialog** for ticket form and Case Tracker; **@atlaskit/popup** for OmniBox (anchored to bar). Use **@atlaskit/blanket** + **@atlaskit/layer** if custom overlay is needed.
- **Tables:** **@atlaskit/dynamic-table** for JSM tickets and Cases; provide `head` and `rows` from mock JSON; use custom cell renderers for checkbox, type dot, **@atlaskit/lozenge**, **@atlaskit/avatar**, **@atlaskit/link**.
- **Forms:** **@atlaskit/textfield**, **@atlaskit/textarea**, **@atlaskit/select**, **@atlaskit/checkbox**; **@atlaskit/button** for submit/cancel.
- **Feedback:** **@atlaskit/spinner** for loading; **@atlaskit/empty-state** for empty; **@atlaskit/flag** for success/error/info; **@atlaskit/banner** for persistent alerts where appropriate.
- **Accessibility:** All @atlaskit components follow ADS a11y; add aria-labels where needed; ensure “R” shortcut and Escape close behavior.

---

*End of PRD. Use this document as the single source of truth for rebuilding the frontend-only UX demo with the Atlassian Design System.*
