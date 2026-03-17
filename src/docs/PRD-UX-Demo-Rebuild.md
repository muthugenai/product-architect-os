# Product Requirements Document (PRD): AI-First Support Search Help — UX Demo Rebuild

**Purpose:** This PRD is a blueprint for rebuilding a **frontend-only User Experience (UX) Demo** of the app. All specifications focus on user journey, interface, and demo-level behavior. **Ignore:** backend logic, database schemas, and real API integrations. **Focus:** What the user sees, clicks, and experiences.

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
| `/insight/:id` | **Insight Detail** | Single insight (e.g. P1/P2 surge, Resolution time spike) with trend chart, causes, fixes. |
| `/confluence` | **Confluence Page** | Confluence home — placeholder content; same shell and header. |
| `/spaces` | **Spaces Page** | Jira Spaces — list/grid of spaces with filters, search, sort. |
| `/agenda` | **Agenda Page** | Full-screen presentation mode: “The Problem,” “The Solution,” “The Demo,” etc. No header/sidebar. |
| `/article/:slug` | **Article Page** | Help article — breadcrumb, title, markdown-style content, related articles. |
| `/support-insights-icon-options` | **Icon Demo** | Dev/demo page for Support Insights icon set. |

**Special routing behavior:**
- When the user has **submitted a search query** (global state), the main content area shows **Search Results Page** (full-width) instead of the route’s page, until the user clears search.
- **Hash or query params** (e.g. `?empty=1` on Spaces) may toggle **empty states** for demo; treat as optional.

### 2.2 Navigation Structure

- **Sidebar (left, collapsible)**
  - **Brand:** Product name (Jira Service Management, Confluence, Jira, Support Insights 360) depending on current route; **toggle** button to collapse/expand.
  - **Primary nav:** Changes by product:
    - **JSM (`/`):** No top-level nav links; shows project “Besties” with queues (STARRED, TEAM PRIORITY), bottom links (Project settings, Give feedback).
    - **Spaces (`/spaces`):** Links: Spaces, Recent, Starred.
    - **Confluence (`/confluence`):** Links: Home, Spaces, Recent, Starred.
    - **Insights (`/insights`):** Link: Dashboard; below that, INSIGHTS list (e.g. P1/P2 Tickets Surge, Resolution Time Spike, SLA Breach Risk) linking to `/insight/:id`.
  - **Bottom section (when not collapsed):**
    - **App switcher** (dropdown): “Switch application” — Agenda, JSM page, Support Insights 360, Confluence, Jira Spaces. Selecting navigates to that route.
    - **Rovo mode** (dropdown): Reactive / Proactive / Predictive / Rovo GOD mode.
    - **Experience** (dropdown): Option A V 0.1 / Option B V 0.2 (popup experience variant).
  - **Agenda page:** Sidebar is present but **dark** (e.g. black bg); brand and nav still visible; no header.

- **Top bar (header)** — hidden on `/agenda`
  - **Ask Rovo bar (primary):** Single, prominent bar with Rovo icon, placeholder “Ask Rovo for Help,” and optional inline input (Option B). Click opens the **OmniBox popup**. Keyboard: **Press R** opens the popup when closed.
  - **Bar actions (icons):** Add, Voice, **Loom** (dropdown: Record a Loom / Record screen only / Record camera only), **Support Insights** (opens popup with “insights” action).
  - **Help menu (if present):** e.g. “View Tickets” that opens popup in “Cases” view.
  - **Right:** Notifications (with badge count), Settings, User avatar (e.g. “JD”).

- **Main content**
  - One column; scrollable. When **Rovo Side Panel** or **Live Chat** is open, main content width shrinks (e.g. panel 400px fixed width).

### 2.3 Modal Overlays & Floating UI

| Overlay | Trigger | Description |
|---------|---------|-------------|
| **OmniBox popup** | Click “Ask Rovo” bar or R | Dropdown/panel below the bar (or full overlay on small screens). Contains: Home (tabs Help / AI), or Cases view, or Loom flow. |
| **Search results (full page)** | Submit query from bar or popup | Replaces main content; shows results + AI summary + tabs (All, Help, Community, Videos). Not a modal. |
| **Rovo Side Panel** | “Ask Rovo” / “Apply recommended fix” / open chat | Right-side panel (~400px) with Rovo chat, articles, community, support actions. |
| **Live Chat** | “Connect with a live agent” from popup or panel | Right-side panel — simulated live agent conversation and “Ticket created” state. |
| **Support Ticket Form** | “Create a support ticket” / “New Ticket” | Modal (or full overlay) with form: subject, description, priority, optional Loom; submit → success screen. |
| **Case Tracker** | “View Tickets” or Cases in popup | Either a dedicated modal (CaseTracker) or a “Cases” view inside the same OmniBox popup with table of cases. |
| **Overlay (dimmed)** | When popup or ticket form is open | Semi-transparent backdrop; click closes (where specified). |

---

## 3. Page-by-Page UI/UX Breakdown

### 3.1 JSM Page (`/`)

- **Layout:** Top: optional **Rovo alert block** (depends on Rovo mode). Below: breadcrumb (Projects / Besties / All tickets), page title “All open tickets,” action icons (external, star, more). Filter input. **Table** of tickets.
- **Visual hierarchy:** Alert (if any) → Breadcrumb → Title + actions → Filter → Table.
- **Styling:** Alert block: left border accent (blue for proactive, orange for predictive), light gray background, rounded corners. Table: white/card background, subtle borders; type dot (color by bug/task/request); status badge; assignee with small avatar or initials.
- **Core components:**
  - **Reactive mode:** One alert strip: title (e.g. “SLA breach on 3 open tickets”), message, CTA “Ask Rovo.”
  - **Proactive mode:** Alert + “Recommended action” block; buttons: “Apply recommended fix,” “SLA breach on 3 open tickets,” “Ask a follow up question.” If **ticket created by agent** (demo state): replace buttons with message “Ticket created” and link to WPT-1042.
  - **Predictive mode:** One warning strip: “SLA breach risk detected,” message, CTA “Preempt breach.”
  - **God mode:** Short success message “Auto-assigned breached tickets…” then fades; then normal content.
  - **Table:** Columns — checkbox, Type (dot), Key, Summary (link), Reporter, Assignee (avatar + name), Status, Created. Rows from mock tickets (e.g. SEC-001, IT-003, …).

### 3.2 Dashboard — Support Insights 360 (`/insights`)

- **Layout:** Optional alert strip at top. **KPI cards** in a responsive grid (e.g. 2–3 columns). **Today’s Summary** section (AI summary text). **Trend chart** (e.g. resolution time or ticket volume). **Insight alerts** (cards or list) with level: error, warning, info, success.
- **Visual hierarchy:** Alerts → KPI grid → Summary → Chart → Insight list.
- **Styling:** KPI cards: white/card, icon + value + delta (green/red), small label. Chart: line or area, blue tones, baseline. Insight items: left border color by level (red, orange, blue, green).
- **Core components:** KPI cards (Tickets Deflected, Avg Resolution Time, Open Tickets, SLA Breach Risk, Cost Avoidance, CSAT). “Today’s Summary” text block. One trend SVG chart. List of insight items (title, subtitle, optional “Ask Rovo” link).

### 3.3 Insight Detail (`/insight/:id`)

- **Layout:** Breadcrumb. Title and severity/tags. **What happened** copy. **Trend chart** (SVG, 7–14 days, baseline line). **Impact**, **Why likely**, **Causes** (title, confidence, detail). **How to fix** + list of fixes (action, owner). **Data sources**, **Last refreshed.**
- **Styling:** Same design tokens as rest of app. Severity: lozenges or colored labels. Chart: line + area fill, baseline in different color (e.g. orange).
- **Core components:** One TrendChart component; cause cards; fix list; metadata line.

### 3.4 Confluence Page (`/confluence`)

- **Layout:** Same shell (sidebar + header). Main: placeholder content (e.g. “Confluence Home” or simple message). Optional **Rovo alert block** (Confluence-themed: e.g. “Macro failed to render”) with Apply recommended fix / Follow-up.
- **Styling:** Consistent with JSM/Spaces; Confluence-specific alert copy and links.

### 3.5 Spaces Page (`/spaces`)

- **Layout:** Optional Rovo alert block. Toolbar: search, filters (e.g. Software, Business), sort. **Spaces grid/list:** cards with space name, key, type, description; star icon.
- **States:** **Loaded** (list of spaces), **Empty** (empty state illustration + CTA), **Error** (error state), **No results** (filter applied, zero matches).
- **Styling:** Cards: rounded, shadow or border; type badge; star filled/outline.
- **Core components:** Search input, filter chips/dropdowns, sort control, space cards (repeat from mock data).

### 3.6 Agenda Page (`/agenda`)

- **Layout:** **Full viewport;** no header. **Sidebar:** dark (black) with Agenda selected in app switcher; minimal nav. **Content:** Centered slide-style sections (e.g. “The Problem,” “The Solution,” “The Demo,” “Conclusion,” “Questions & Feedback”). Next/Previous or click to advance; keyboard arrows.
- **Styling:** Dark background for content area; light text; bullets with highlights; optional “variant” pills (e.g. search, help, askrovo, loom) for The Pain Point section.
- **Core components:** Section title, body text, bullet list, nav (prev/next or dots).

### 3.7 Article Page (`/article/:slug`)

- **Layout:** Breadcrumb. Category lozenge. **Title.** Meta (e.g. “Last updated,” “5 min read”). **Body** (markdown-rendered: headings, lists, code, links). **Related articles** (list with links).
- **Styling:** Article body: readable line length, heading hierarchy. Related: list with icons/links.
- **Core components:** Breadcrumb, title, body (from mock article content), related list.

### 3.8 Search Results Page (when `searchQuery` is set)

- **Layout:** **Context chip** at top (current page URL or “Searching by keyword only” if dismissed). **AI summary** block. **Tabs:** All | Help Pages | Community | Videos. **Result list** (cards or rows): title, category, excerpt, “Ask Rovo” or open link. **Suggested prompts** (chips) below.
- **Styling:** Summary in a card; results with hover; tabs underlined or pill for active.
- **Core components:** ContextChip (dismissible), summary text, tab bar, result list (from `getSearchResults(query)`), prompt chips.

### 3.9 OmniBox Popup (default / “Home” view)

- **Layout:** **Header:** Rovo icon, “Ask Rovo for Help,” Close. **Body:** Either **Loom flow** (recording / post-record / get-support) OR **main content:** input (or sync with header in Option B), **tabs: Help | AI.**
  - **Help tab:** Context-aware help pages (list), optional “Rovo Brief” / “Support AI Insights” section, suggested prompts. For JSM/Spaces/Confluence: may show **proactive error block** (e.g. JSM error + “Apply recommended fix” + follow-up buttons).
  - **AI tab:** Sub-tabs: Summary | Help | Community | Videos. Summary: AI summary + follow-up prompts. Others: article list, community list, video list.
- **Loom flow (inside popup):** **Recording:** “Record screen only” + LoomRecorder UI (mock: button to “finish” after 3s). **Post-record:** Thumbnail, summary, recommendation, actions: “Apply recommended fix,” “Ask a follow up question,” “Share recording,” “Get Support.” **Get Support:** “We’ve got context from your recording” → “Ask a Follow Up Question” → then follow-up flow: Rovo response, “How would you like to proceed?” → **Connect with a live agent** | **Create a support ticket.** Live agent: chat UI (agent + user bubbles). Ticket: form (summary, priority, description, page context, optional Loom), then “Create Ticket” → success (Ticket ID, link, “Show details in Rovo sidebar”).
- **Cases view (inside popup):** Back, “Your Support Cases.” Toolbar: “New Ticket,” filters (All / Open Only / Resolved). **Table:** Case ID, Subject, Priority, Status, Updated. Footer: “View all cases in JSM →.”
- **Styling:** Popup: white/frosted card, shadow, rounded; positioned under bar (Option B) or centered (Option A). Dropdown triggers in sidebar: rovo-style border (blue–purple gradient outline). Buttons: primary (Rovo purple), secondary (gray).

### 3.10 Rovo Side Panel

- **Layout:** **Header:** Rovo icon, “Rovo,” close. **Context chip** (page/query). **Messages:** user and assistant bubbles; assistant may include **chart** (bar, line, donut, table) or **support actions** (Live Agent, Create a Support ticket). **Input** at bottom. Optional **tabs:** e.g. Help articles, Community, with lists.
- **Styling:** Panel bg light gray; bubbles with distinct user/assistant styles; charts inline; support buttons with icons.
- **Core components:** Message list, chart components (Bar, Line, Donut, Table), article cards, community cards, “Connect with a live agent” / “Create a Support ticket” buttons. **Apply Fix** flow: confirm/cancel → on confirm set `fixConfirmed` so page can show “fix applied” or hide alert.

### 3.11 Live Chat Panel

- **Layout:** **Header:** Rovo, “/ Live Agent,” status dot, Close. **Connecting state:** Dots + “Connecting you to an agent…” + context summary. **Conversation:** Agent bar (avatar, name, “Active”), message list (agent/user), **scripted “Ticket created” card** and “Action taken: Ticket created” with ticket key (e.g. WPT-1042). **Input** at bottom.
- **Styling:** Same panel width as Rovo panel; chat bubbles; ticket card with green check and rows (Key, Summary, Priority, Assignee, Status).
- **Behavior:** Scripted messages advance on a timer; when script completes, set **ticketCreatedByAgent** so that on JSM/Spaces/Confluence (proactive mode) the alert block shows “Ticket created” message instead of “Apply recommended fix.”

### 3.12 Support Ticket Form (modal)

- **Layout:** Header: Back, “Create a Support Ticket,” Close. **Form:** Summary/Subject, Priority (dropdown), Description, optional Loom attach. Submit. **Success state:** Check icon, “Ticket Submitted!”, ticket # (e.g. #JSM-5821), “Done” button.
- **Styling:** Modal overlay; form in card; success state centered.

### 3.13 Case Tracker (standalone modal, if used)

- **Layout:** Header: icon, “Your Support Cases,” Close. **Actions:** “Create Support Ticket,” “All Cases,” “Open Only.” **Table:** Case ID, Subject, Priority, Status, Updated. Footer: “View all cases in JSM →.”

---

## 4. Crucial User Flows (“Happy Paths”)

### Flow 1: Ask Rovo and Get an AI Summary + Escalate to Live Agent (Proactive Demo)

1. User is on **JSM Page** with **Proactive** Rovo mode. Page shows alert: “SLA breach on 3 open tickets” and “Recommended action” with button **“Apply recommended fix.”**
2. User clicks **“Ask Rovo for Help”** in the header. **OmniBox popup** opens (Option A or B).
3. User types a query (e.g. “How do I resolve these SLA breaches?”) and submits (Enter or button). App either: **A)** opens **Rovo Side Panel** with chat + summary + “Apply recommended fix” button, or **B)** shows search results / AI in popup then “Open in Rovo” to open panel.
4. In **Rovo Side Panel**, user sees AI summary and optional chart. User clicks **“Connect with a live agent.”** App opens **Live Chat** panel (same slot as Rovo panel).
5. **Live Chat** shows “Connecting…” then scripted conversation. Agent says they’ll create a ticket; **Ticket created** card appears; “Action taken: Ticket created” with WPT-1042.
6. User closes Live Chat. On **JSM Page**, the proactive alert block now shows **“Ticket created”** message (and link WPT-1042) **instead of** “Apply recommended fix” button. *(State: `ticketCreatedByAgent === true`.)*

### Flow 2: Record Loom → Get Support → Create Ticket (Get Support Path)

1. User clicks **Ask Rovo** bar, then **Loom** icon in the bar → “Record screen only.” Popup shows **Loom recording** step; user clicks “Start” (or mock “Finish” after 3s).
2. After “recording,” popup shows **Post-record** view: thumbnail, AI summary, recommendation. User clicks **“Get Support.”**
3. Popup shows **Get Support** flow: “We’ve got context from your recording,” then **“Ask a Follow Up Question.”** User clicks it; after loading, Rovo response and **“How would you like to proceed?”** with **Connect with a live agent** and **Create a support ticket.**
4. User clicks **“Create a support ticket.”** Popup shows **ticket form** (summary pre-filled, priority, description, page context, optional “Record your issue via Loom” already done). User clicks **“Create Ticket.”**
5. **Ticket success** view: “Ticket Created Successfully!”, Ticket ID (e.g. SUP-xxxxx), “View ticket details,” “Show details in Rovo sidebar.” User can close popup.

### Flow 3: Search → Results → Open Article or Rovo Panel

1. User clicks **Ask Rovo** bar (or presses R). Popup opens with **Help** tab and context (e.g. “JSM · SLA Breach”).
2. User types a query and submits (e.g. “Configure SLA”). App sets **searchQuery**; main content is replaced by **Search Results Page**: context chip, AI summary, tabs (All / Help / Community / Videos), result list, suggested prompts.
3. User clicks an **article** in results → navigate to **Article Page** (`/article/:slug`) with breadcrumb, title, body, related articles.
4. Or user clicks **“Ask Rovo”** on a result or “Open in Rovo” → **Rovo Side Panel** opens with that context and chat/summary.

---

## 5. Interactions & State Management (Demo Level)

### 5.1 Micro-Interactions

- **Ask Rovo bar:** Hover: slight background/scale. When open: bar has “active” class (border/glow). **Option B:** bar contains inline input; placeholder “Ask Rovo for Help”; cursor blink when focused.
- **Sidebar:** Collapse/expand with icon; width transition (e.g. 240px ↔ 52px). Dropdowns (app switcher, Rovo mode, Experience): open on click, close on outside click or selection.
- **Buttons:** Hover: background change (e.g. neutral-10). Primary/Rovo: purple hover. Disabled: reduced opacity.
- **Popup:** Open: animate (e.g. slide down or fade). Close: click overlay or X. **Option B:** popup position locked to bar (ResizeObserver or scroll/resize update).
- **Rovo / Live Chat panel:** Slide in from right; main content width animates. Close: X; panel width → 0.
- **Loading:** “Connecting…” in Live Chat: three dots animation. Rovo responses: typing indicator then message. Search results: short loading (e.g. 600ms) then results.
- **Loom recording:** Mock: “Recording…” spinner in bar; after 3s “recording complete” and post-record view.
- **Toasts:** Not required for MVP; optional “Fix applied” or “Ticket created” toast if not using in-page message.

### 5.2 Core Frontend States to Mock

- **OmniBox state:** `closed` | `default` (popup) | `results` (search results page) | `chat_panel` (Rovo panel open) | `live_chat` (Live Chat open) | `ticket_form` | `case_tracker`. Single global context (e.g. React state or context).
- **Search / query:** `query`, `searchQuery`. When `searchQuery` is set, main content shows Search Results Page; clearing shows route content again.
- **Rovo mode:** `reactive` | `proactive` | `predictive` | `god`. Drives which alert block and CTAs appear on JSM, Spaces, Confluence.
- **Popup experience:** `optionA` | `optionB`. Option B: no popup header, input in header bar, popup body aligned under bar.
- **fixConfirmed:** Boolean. When true (e.g. user clicked “Apply recommended fix” in Rovo panel and confirmed), JSM/Spaces/Confluence **hide** the proactive alert block (or show “fix applied”).
- **ticketCreatedByAgent:** Boolean. When true (set when Live Chat script shows “Ticket created”), JSM/Spaces/Confluence proactive block shows **“Ticket created”** message + link instead of “Apply recommended fix” button.
- **Loom:** `loomRecordingInProgress`, `loomRecordingReady`, `loomAttachment` (url, thumbnail). Drives bar “Recording…” and popup Loom flow.
- **Popup sub-views:** `view` (home | cases), `loomFlowView` (recording | post-record | get-support), `followUpPhase` (response-loading | actions-revealed | live-agent | ticket-form | ticket-loom-recording | ticket-loom-done | ticket-success), `mainTab` (help | ai), `aiSubTab` (summary | help | community | videos).
- **Sidebar:** `collapsed` (boolean). **Agenda:** no header; dark content area.
- **Empty / error states:** Spaces: `pageState` (loaded | error), optional `?empty=1` for empty state. Article/Insight: 404 or “not found” when slug/id missing in mock data.

### 5.3 What to Avoid (Demo Scope)

- No real auth; no login/logout. User avatar and label are static.
- No real API calls. All data from in-memory mocks or JSON imports.
- No real Loom SDK; recording is simulated (timer then fake URL).
- No real live chat backend; conversation is scripted (timer-based message reveal).
- Proactive alerts (incident, SLA breach, dwell time, repeated error, churn) are **predefined** and dismissible; no server-driven rules.

---

## 6. Mock Data Schemas

Provide the following (or equivalent) so the UI looks realistic. Use **static JSON** or **in-memory objects**; no backend.

### 6.1 Tickets (JSM Page Table)

```json
[
  {
    "key": "SEC-001",
    "type": "bug",
    "summary": "My ship's navigation system has a bug and keeps pointing to Pluto",
    "reporter": "Crystal Wu",
    "assignee": "Michael Chu",
    "status": "OPEN",
    "created": "2022-11-21"
  },
  {
    "key": "IT-003",
    "type": "request",
    "summary": "Internet has disappeared from my desktop",
    "reporter": "Abdullah Ibrahim",
    "assignee": "Michael Chu",
    "status": "OPEN",
    "created": "2018-01-16"
  }
]
```

**Type colors:** `bug` → #de350b, `task` → #36b37e, `request` → #0065ff. Include at least 5–10 rows for a full table.

### 6.2 Support Cases (Case Tracker / Cases View in Popup)

```json
[
  {
    "id": "JSM-5801",
    "subject": "EMEA Billing queue spike investigation",
    "status": "open",
    "priority": "P1",
    "updated": "2h ago"
  },
  {
    "id": "JSM-5789",
    "subject": "SLA breach notifications not firing",
    "status": "in_progress",
    "priority": "P2",
    "updated": "5h ago"
  },
  {
    "id": "JSM-5765",
    "subject": "Permission scheme not propagating to sub-projects",
    "status": "resolved",
    "priority": "P3",
    "updated": "1d ago"
  }
]
```

### 6.3 Help / Search Results (for Search Results Page & Rovo)

**SearchResult:** `{ "id": "sr-1", "title": "Getting Started with Support Insights 360", "category": "Getting Started", "excerpt": "Learn how to navigate...", "slug": "getting-started-support-insights-360", "url": "/article/getting-started-support-insights-360" }`

- **Key buckets:** `default`, `permissions`, `sla`, `automation`, `rateLimit` (keyword-based: e.g. “permission” → permissions, “sla”/“breach” → sla, “429” → rateLimit).

**Article (for Article Page):** `{ "slug": "jira-permission-schemes", "title": "What are permission schemes in Jira?", "category": "Jira Administration", "breadcrumb": ["Documentation", "Jira Administration", "Permission Schemes"], "content": "## What is...\n\nA permission scheme...", "relatedArticles": [{ "title": "...", "slug": "..." }] }`

### 6.4 AI Summary (for Popup & Rovo Panel)

**AiSummary:** `{ "query": "permissions jira", "summary": "Permission schemes in Jira define what users can do...", "followUps": ["How do I grant admin permissions?", "What is the difference between a project role and a group?"] }`

- Match by keyword from `query` to a small set of canned summaries (e.g. permissions, SLA, automation, 429, billing queue, macro failed). Default summary when no match.

### 6.5 Insights (Dashboard & Insight Detail)

**Insight list item (Dashboard):** `{ "id": "i1", "label": "P1/P2 Tickets Surge", "severity": "high", "detail": "93% change in Billing • EMEA" }`

**Insight detail (`/insight/:id`):** `{ "id": "i1", "title": "P1/P2 Tickets Surge", "severity": "high", "tags": ["volume", "Billing", "EMEA"], "whatHappened": "P1/P2 ticket volume increased by 93%...", "trendData": [32, 35, 31, 40, 45, 52, 58, 63, 71, 75, 80, 84, 87, 87], "trendBaseline": 45, "current": 87, "baseline": 45, "changePercent": "+93.3%", "impact": "Potential $15K ARR at risk...", "whyLikelySummary": "Recent pricing update rollout...", "causes": [{ "title": "Pricing Update Communication Gap", "confidence": "High confidence", "detail": "..." }], "howToFix": "Deploy updated FAQ...", "fixes": [{ "action": "Update billing FAQ in help centre", "owner": "Docs Team" }], "dataSources": ["Support Tickets DB", "WFM System"], "lastRefreshed": "5 minutes ago", "detail": "93% change in Billing • EMEA" }`

### 6.6 KPI Cards (Dashboard)

Array of: `{ "id": "kpi-1", "label": "Tickets Deflected Today", "value": "1,247", "delta": "+18%", "deltaDir": "up" | "down", "sub": "via AI self-service", "color": "var(--ads-blue-700)" }` (plus icon or icon name). 5–6 cards.

### 6.7 Spaces (Spaces Page)

`{ "id": "s1", "name": "Engineering", "key": "ENG", "type": ["software"], "description": "Product development and delivery." }` — list of 6–12 items. Optional: `starred` boolean for star icon state.

### 6.8 Recent Questions / Suggested Prompts

**RecentQuestion:** `{ "id": "rq-1", "text": "Why is the EMEA billing queue surging?", "timestamp": <number> }`  
**Suggested prompts:** `["What are permission schemes in Jira?", "How do I configure SLA policies?", "What's the current P1/P2 ticket trend?"]`

### 6.9 Proactive Alerts (for Header / Popup)

- **Incident:** `{ "id": "incident", "active": true, "dismissed": false, "region": "EMEA", "product": "Jira Cloud", "status": "Investigating", "eta": "~30 min", "statuspageUrl": "https://...", "subscribed": false }`
- **SLA breach:** `{ "id": "slaBreach", "active": true, "dismissed": false, "rate": 8.2, "target": 5, "daysConsecutive": 3, "rovoQuery": "Analyze root causes for SLA breach rate exceeding 5% target" }`

Use these to drive **hasActiveAlert** and visible alert chips in the header or popup (dismiss = set `dismissed: true`).

### 6.10 Live Chat Script (for Ticket-Created Flow)

Ordered list of messages: agent greeting, agent context, user “Can you create a ticket?”, agent “I’ll create…”, **system** (HTML or card): “Ticket created” card with Key WPT-1042, Summary, Priority, Assignee, Status, then agent “Done! Ticket WPT-1042 has been created…”. After the last message is shown, set **ticketCreatedByAgent** = true so page alert updates.

---

## Implementation Notes for Rebuild

- **Routing:** Use React Router (or equivalent) with the routes in §2.1. One global context or store for: `omniBoxState`, `searchQuery`, `rovoMode`, `popupExperience`, `fixConfirmed`, `ticketCreatedByAgent`, Loom state, popup sub-views.
- **Styling:** Use CSS variables (tokens) for colors, spacing, radius, shadow (§3 and `tokens.css`). Preserve Rovo purple (#6554C0 / var(--color-rovo)) and Atlassian neutrals/blues for consistency.
- **Accessibility:** aria-labels on icon buttons, role="dialog" and aria-modal on modals, keyboard (R to open, Escape to close, arrows on Agenda).
- **No server:** All data from JSON or .ts/.js mock modules; navigation is client-only; form submit and “Create Ticket” only update local state and show success UI.

---

*End of PRD. Use this document as the single source of truth for rebuilding the frontend-only UX demo.*
