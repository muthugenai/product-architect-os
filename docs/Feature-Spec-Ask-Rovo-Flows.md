# Feature Spec: Ask Rovo — Deep Interaction Logic & State (Missing Flows)

**Purpose:** Extract the exact mechanics, state transitions, and mock data for wiring up the "Ask Rovo" search and side panel. Focus: React state, component transitions, and JSON mock data. Ignore legacy CSS.

---

## 1. The "Explore" Tab & Typing Logic

### 1.1 State That Drives the Explore Tab

| State (in OmniBoxPopup or equivalent) | Type | Role |
|----------------------------------------|------|------|
| `localQuery` | `string` | Controlled input value (synced from `omniBox.query` when popover opens; Option B also syncs from `omniBox.query` while open). |
| `liveQuery` | `string` | Debounced query used to fetch and render Explore content. Only set when `localQuery.trim().length >= liveQueryMinLength`. |
| `liveQueryMinLength` | `number` | **Option B:** `1`. **Option A:** `3`. |
| `liveLoading` | `boolean` | `true` during the debounce delay; set `false` when `liveQuery` is updated. |
| `mainTab` | `'help' | 'ai'` | **`'ai'`** is the Explore tab. |
| `aiSubTab` | `'summary' | 'help' | 'community' | 'videos'` | Sub-section when viewing "View all" for Help Pages, Community, or Videos. |
| `submittedQuery` | `string | null` | When non-null, Explore shows "Results for \"…\"" with a "Back to Support" bar; used when user has submitted from this view. |
| `contextActive` | `boolean` | When `false`, AI summary uses "Searching by keyword only" prefix (tied to Context chip toggle). |

### 1.2 When Does the Explore Tab Activate?

- **Auto-switch on typing:**  
  `useEffect` depending on `liveQuery`:  
  - If `liveQuery` is non-empty → `setMainTab('ai')` and `setAiSubTab('summary')`.  
  - If `liveQuery` is empty and `mainTab === 'ai'` and `!submittedQuery` → `setMainTab('help')`.
- **Manual switch:**  
  The "Explore" tab button is **disabled** when `localQuery.trim().length < liveQueryMinLength`; when enabled, click sets `mainTab = 'ai'`.  
  `aria-disabled` and `disabled` should reflect that.  
  Optional `title`: "Start typing to explore" when disabled.

### 1.3 Debounce Logic for `liveQuery`

- On every `localQuery` change, run a timer:
  - **Option B:** delay **200 ms**.
  - **Option A:** delay **350 ms**.
- If `localQuery.trim().length < liveQueryMinLength`: set `liveQuery = ''`, `liveLoading = false`, return.
- Otherwise: set `liveLoading = true`, then when the timer fires set `liveQuery = localQuery.trim()` and `liveLoading = false`.
- Clear the previous timer on each `localQuery` change (standard debounce).

### 1.4 Explore Panel: Empty vs Active

- **Empty (Explore tab selected but no live query):**  
  `mainTab === 'ai' && !liveQuery && !submittedQuery`  
  → Show empty state: icon, "Ask Rovo", "Type in the box above to get AI-powered answers and help articles."

- **Active (has live or submitted query):**  
  `mainTab === 'ai' && (liveQuery || submittedQuery)`  
  → Use `q = submittedQuery || liveQuery` and render:
  - Optional "Back to Support" bar when `submittedQuery` is set (button clears `submittedQuery` and sets `mainTab = 'help'`).
  - **AI Summary** block (see below).
  - **Suggested prompts** (Follow-up Questions).
  - **Help Pages** preview (first 3 results + "View all" → set `aiSubTab('help')`).
  - **Community** preview (first 3 + "View all" → `aiSubTab('community')`).
  - **Videos** preview (first 3 + "View all" → `aiSubTab('videos')`).

### 1.5 Mock Data for Explore Tab Content

**AI Summary:**  
From `getAiSummary(q, contextActive)` → `{ query, summary, followUps: string[] }`.  
See §4 in the main Omni Bar spec for keyword-based lookup and default; when `contextActive === false`, prefix `summary` with `"Searching by keyword only (page context removed). "`.

**Relevant content results (Help Pages):**  
From `getSearchResults(q)` → array of:

```ts
interface SearchResult {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  slug: string;
  url: string;
}
```

Bucket by query keywords (e.g. permission, sla, automation, rateLimit, default). Example default bucket:

```json
[
  {
    "id": "sr-1",
    "title": "Getting Started with Support Insights 360",
    "category": "Getting Started",
    "excerpt": "Learn how to navigate the Support Insights 360 dashboard and understand key metrics.",
    "slug": "getting-started-support-insights-360",
    "url": "/article/getting-started-support-insights-360"
  }
]
```

**Suggested prompts (Follow-up Questions):**  
From `getRelevantPrompts(q)` → up to 3 strings. Logic: keyword-scored pool; min query length 3; return top 3 by score. Example pool entry:

```json
{ "keywords": ["permission", "access", "role"], "prompt": "How do I grant admin access to a Jira project?" }
```

**Community (Explore tab):**  
From `getContextCommunity(pathname)` → array of:

```ts
interface CommunityAnswer {
  id: string;
  title: string;
  author: string;
  solved: boolean;
  replies: number;
  href: string;
}
```

Example:

```json
[
  {
    "id": "jc1",
    "title": "How to set up request types for a new service project",
    "author": "Alex R.",
    "solved": true,
    "replies": 18,
    "href": "https://community.atlassian.com/t5/Jira-Service-Management/request-types-setup/qaq-p/2001"
  }
]
```

**Videos (Explore tab):**  
From `getContextVideos(pathname)` → array of:

```ts
interface VideoResult {
  id: string;
  title: string;
  duration: string;
  channel: string;
  views: string;
  thumb: string;
  href: string;
}
```

Example:

```json
[
  {
    "id": "jv1",
    "title": "Getting started with Jira Service Management",
    "duration": "4:32",
    "channel": "Atlassian",
    "views": "24K",
    "thumb": "🎬",
    "href": "https://www.youtube.com/watch?v=jsm1"
  }
]
```

### 1.6 "Agent Actions" in Explore (Follow-up Flow)

After the AI Summary, when the user has **not** yet started the follow-up flow:

- Show one button: **"Ask a Follow Up Question"** (with Rovo icon).  
  **onClick:** `setFollowUpQuery(q)`, `setFollowUpPhase('response-loading')`.

**Follow-up flow state:**  
`followUpPhase`: `null | 'response-loading' | 'actions-revealed' | 'live-agent' | 'ticket-form' | 'ticket-loom-recording' | 'ticket-loom-done' | 'ticket-success'`.

- **response-loading:** Show spinner + "Analyzing your issue and finding the best support options…" for **10 seconds**, then set `followUpPhase = 'actions-revealed'`.
- **actions-revealed:** Show "How would you like to proceed?" with two buttons:
  - **"Connect with a live agent"** → `setFollowUpPhase('live-agent')`, push one agent message: e.g. `"Hi! I'm Sarah, your support specialist. I can see you're asking about: \"{followUpQuery}\". Let me help you with that. Can you share more details about the issue?"` into `agentMessages`.
  - **"Create a support ticket"** → `setFollowUpPhase('ticket-form')`.
- **live-agent:** Render inline chat: `agentMessages` list + form (user input; on submit append user message, then after ~1.2s append agent reply). No global state change to `live_chat` here—this is inline in the popover.
- **ticket-form / ticket-loom-*** / **ticket-success:** In-popover ticket flow (see §3 below).

Mock for **Follow-up Questions** (shown as clickable prompts that open Rovo sidebar):  
Use `aiSummary.followUps` (from `getAiSummary`). Click → `openInRovoSidebar({ title: prompt, category: 'Suggested prompt', href: '#' })` (which sets `omniBox.query`, `omniBox.articleContext`, and `omniBox.openChatPanel('__article__')`).

---

## 2. The v0.2 Popover Options & "Record Your Issue"

### 2.1 Popover Variants (v0.2 Options)

The popover is configured by:

| Prop / concept | Values | Effect |
|----------------|--------|--------|
| `variant` / `popupExperience` | `'optionA'` \| `'optionB'` | **Option A:** Input lives inside the popover; bar shows placeholder when active. **Option B:** Input can live in the header bar; popover body may hide or simplify; "Explore" activates on first character. |
| `inline` | boolean | When true, popover is not positioned fixed below bar; it’s inline in layout (e.g. for embedding). |
| `noHeader` | boolean | When true, omit the popover header (icon, title, close). |
| `barAnchorRef` | RefObject | When set and not inline, popover position is computed from `barAnchorRef.current.getBoundingClientRect()` (top = rect.bottom + gap, left/width from rect), updated on scroll, resize, ResizeObserver. |

**Option B specifics:**

- When popover opens, focus is moved to the **header input** (not the popover textarea) after ~120 ms.
- `liveQueryMinLength = 1`; Explore tab is enabled after one character.
- When `pendingAction === 'cases'` on open, set internal `view = 'cases'` and clear `pendingAction`.

### 2.2 Top-Level Popover Layout (v0.2)

1. **Header** (unless `noHeader`): Rovo icon, "Ask Rovo for Help" (or similar), close button. When Loom is recording, header can collapse (class `omnibox-popup--recording-collapsed`).
2. **Mode tabs** (Chat | Search): `inputMode === 'chat' | 'search'`; toggles local state only (no global omni state change).
3. **Context chip:** `contextUrl`, `contextDismissed`, `onContextToggle` → `setContextActive`.
4. **Try asking** (Option A, JSM only): One contextual prompt button; click → `handlePromptClick(ctxPrompts.prompts[0])` (opens Rovo panel with that prompt as article context).
5. **Input area:** Textarea (Option A) or mirror of header input (Option B). Submit → `omniBox.submitSearch(localQuery.trim())` (close popover, set `searchQuery`, main content shows full-page search results).
6. **Toolbar below input:** Add, Voice, **Help** dropdown, **Loom** dropdown, **Support** dropdown.
7. **Tabs:** Help | Explore (see §1).
8. **Body:** Either Help content (help sub-tabs) or Explore content (empty vs live).
9. **Footer:** Disclaimer text (e.g. "AI-generated. Verify important results.").

### 2.3 "Record Your Issue" — Exact User Flow

**Two entry points:**

**A) Support dropdown in toolbar (inside popover)**  
- **Click:** Support icon (headset) in toolbar → toggles `supportOpen`.  
- **Menu items:**  
  - "Record your issue" → `setSupportOpen(false)`, `setLoomFlowView('recording')`.  
  - "Support Agent Insights" → `setSupportOpen(false)`, `omniBox.openChatPanel('__support_ai_insights__')`.  
  - "View Tickets" → `setSupportOpen(false)`, `setView('cases')`.

**B) Help tab → Support sub-tab → "Record your issue" button with sub-menu**  
- **Navigation:** Help tab → Support sub-tab (`helpSubTab = 'support'`).  
- **UI:** A row of actions: e.g. "View Tickets" button, and a **"Record your issue"** button with a chevron.  
- **Click "Record your issue":** `setRecordSubMenuOpen(v => !v)`.  
- **When `recordSubMenuOpen`:** Render a dropdown (use a ref `recordSubMenuRef` for click-outside).  
  - **Menu items:**  
    - "Record screen + camera with Loom" → `setRecordSubMenuOpen(false)`, `omniBox.setState('closed')`, `omniBox.startLoomRecording()`.  
    - "Record screen only" → same (close submenu, close popover, start Loom recording).  
- **Click-outside:** `mousedown` listener; if target not inside `recordSubMenuRef.current`, set `recordSubMenuOpen(false)`.

**State updates when "Record your issue" is chosen:**

1. `recordSubMenuOpen = false` (if from Help tab).  
2. `supportOpen = false` (if from Support toolbar dropdown).  
3. Either:  
   - `omniBox.setState('closed')` and `omniBox.startLoomRecording()` (Help tab path), or  
   - `setLoomFlowView('recording')` (toolbar path — then Loom flow runs inside popover).

**Loom flow (when started from toolbar):**  
`loomFlowView = 'recording'` → show recording UI; when "recording" finishes, set `pendingLoomRecording = { sharedUrl, thumbnailUrl }` and move to post-record view (e.g. "Get support" with options: open in Rovo with Loom context, or Live Chat, or Loom support).  
When started from Help tab, the popover is closed and the **bar** shows "Recording…" and a spinner; when recording completes, global Loom state is updated (`loomRecordingReady`, `loomAttachment`) and popover can be reopened (e.g. state back to `'default'`) to show "Loom Recording is ready" or similar.

---

## 3. The Rovo Side Panel & Ticket Creation Flow

### 3.1 Trigger: Opening the Rovo Side Panel from the Popover

**Global state transition:**  
`omniBox.openChatPanel(prompt?: string)`:

- If `prompt` is provided: `omniBox.setActivePrompt(prompt)`.
- `omniBox.setState('chat_panel')`.

**App-level rendering:**  
`rovoPanelOpen = (omniBox.state === 'chat_panel')`.  
When true, render `<RovoSidePanel omniBox={omniBox} />` in the right-hand panel slot (e.g. `rovo-panel-slot--open`). The popover can close (e.g. OmniBox returns null for `chat_panel` so the overlay/popover is not shown) or stay open depending on product; the spec treats side panel as the primary UX when `state === 'chat_panel'`.

**Exact onClick triggers that call `openChatPanel`:**

| User action | Argument passed | Effect |
|-------------|-----------------|--------|
| Click "Read Help articles" (Help dropdown) | `'__inapp_help__'` or `'__insight_help__:{insightId}'` | Panel shows Help Articles view. |
| Click "Ask Community" | `'__community__'` | Panel shows Community view. |
| Click "View Bugs" | `'__bugs__'` | Panel shows Bugs view. |
| Click "Support Agent Insights" | `'__support_ai_insights__'` | Panel shows Support AI Insights list. |
| Click a **Try asking** or **Recently asked** item | (none) | `openPanelWithHelpCard(title, category)` → sets `omniBox.setQuery(title)`, `omniBox.setArticleContext({...})`, `omniBox.openChatPanel('__article__')`. |
| Click "View more" on AI Summary (Explore) | (none) | `openInRovoSidebar({ title: q, category: 'AI Summary', href: '#', description: aiSummary.summary })` → sets query, articleContext, `openChatPanel('__article__')`. |
| Click a **Help page** row or "Ask Rovo" on a result | (none) | `openInRovoSidebar({ title, category, href, ... })` → set query + articleContext, `openChatPanel('__article__')`. |
| Click a **suggested prompt** in Explore | (none) | `openInRovoSidebar({ title: p, category: 'Suggested prompt', href: '#' })` → `openChatPanel('__article__')`. |
| Click "Connect with a live agent" (Loom post-record) | `'__live_chat__'` | Opens Live Chat (see §3.3). |
| Click "Get support" (Loom) with Loom context | `loomContextQuery` (string) | Panel opens with that query. |
| From SearchResults (popup) "Open in Rovo" on a result | `r.title` | `omniBox.openChatPanel(r.title)` (no article context set in snippet; can set query from `r.title`). |

So: any link/button that should "open in Rovo" sets `activePrompt` (and optionally `query` and `articleContext`), then calls `openChatPanel(prompt)`, which sets `state = 'chat_panel'` so the app shows the side panel.

### 3.2 Multi-Turn Chat in the Rovo Side Panel

**Panel-local state:**

- `messages: Message[]`
- `inputVal: string`
- Optional: `thumbed: 'up' | 'down' | null`, dropdowns (`supportOpen`, `ctxHelpOpen`, `ctxSupportOpen`).

**Message shape:**

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  followUps?: string[];
  isTyping?: boolean;
  chartType?: 'bar' | 'line' | 'donut' | 'table' | null;
  showSupportActions?: boolean;
}
```

**When to show which view (no messages yet):**

- `activePrompt === '__article__'` and `articleContext` → Article view (title, category, link, optional description; optional "Open in new tab").
- `activePrompt === '__inapp_help__'` (or `__read_articles__`) → Help Articles list (pinned + by category).
- `activePrompt === '__community__'` → Community posts list.
- `activePrompt === '__bugs__'` → Bugs list.
- `activePrompt === '__support_ai_insights__'` → Support AI Insights list.
- `activePrompt === '__followup__'` and `query` → Follow-up flow: show user message + typing, then assistant message with `showSupportActions: true`.
- `activePrompt === '__live_chat__'` and no messages → will transition to Live Chat (see §3.3).
- `activePrompt === '__loom_support__'` → Loom support flow (e.g. "I see you've attached a screen recording…" with Live Chat / Create ticket).
- Any other non-sentinel string → treat as user prompt: call `addUserMessage(omniBox.activePrompt)` to push user message + typing, then assistant message from `getAiSummary(activePrompt)` with `showSupportActions: true`.

**Sending a new message from the panel:**

- User submits input: `addUserMessage(inputVal.trim())`, then clear `inputVal`.
- Append message `{ id, role: 'user', text }`.
- Append typing placeholder `{ id: typingId, role: 'assistant', text: '', isTyping: true }`.
- After ~900 ms: remove typing, append assistant message: `getAiSummary(text)` and `getChartType(text)`; set `followUps`, `chartType`, `showSupportActions: true`.

**Mock for assistant response:**  
Use `getAiSummary(text)` → `{ summary, followUps }`. Optionally `getChartType(text)` → `'bar' | 'line' | 'donut' | 'table' | null` for chart placeholders. Example chart mock data (bar):  
`[{ label: 'Login Issues', value: 87, color: '#4C9AFF' }, ...]`.

**Follow-up chips:**  
Render `message.followUps`; click → `addUserMessageWithSupportActions(prompt)` (same as above but with `showSupportActions: true` and slightly longer delay, e.g. 1200 ms).

### 3.3 Escalation: Live Chat and Support Ticket

**From Rovo panel → Live Chat**

- **Trigger:** User clicks "Live Chat" in the Support dropdown, or "Connect with live agent" in a message that has `showSupportActions`.
  - Dropdown: `onClick` → `setSupportOpen(false)`, `omniBox.setQuery(inputVal)`, `omniBox.openChatPanel('__live_chat__')`.  
  - (That opens panel with `__live_chat__`; panel then can redirect to Live Chat view.)
- **Alternative (from panel):** A button that calls `omniBox.openLiveChat()` directly.
  - **State:** `omniBox.setState('live_chat')`.
- **App:** `liveChatOpen = (omniBox.state === 'live_chat')`. When true, render `<LiveChat omniBox={omniBox} />` in the same panel slot (or replace Rovo panel with Live Chat).

**Live Chat multi-turn (mock)**

- **Phases:** `'connecting'` (2.5 s) → `'conversation'`.
- **Script (mock):** Built from `buildContextSummary(omniBox)` (uses `articleContext?.title` or `query` or fallback). Script is an array of messages:
  - agent: greeting with summary.
  - agent: e.g. "I can see tickets SEC-001, IT-003 and IT-001 have exceeded…"
  - user: "Yes, please. Can you create a ticket…"
  - agent: "I'll create a high-priority ticket…"
  - system: HTML card for "Ticket created" (key e.g. WPT-1042, summary, priority, assignee, status).
  - agent: "Done! Ticket WPT-1042 has been created…"
- Messages are revealed one-by-one with delays (user ~2200 ms, system ~1400 ms, agent ~1800 ms).
- When script is fully shown: set `omniBox.setTicketCreatedByAgent(true)` so main page can show "Ticket created" instead of "Apply recommended fix".
- **ConvoMsg:** `{ id, role: 'agent' | 'user' | 'system', text, html? }`.

**From Rovo panel (or popover) → Create Support Ticket**

- **Trigger:**  
  - In panel: Support dropdown → "New Ticket" → `setSupportOpen(false)`, `omniBox.setQuery(inputVal)`, `omniBox.openTicketForm()`.  
  - Or a "Create a Support ticket" / "Create ticket" button on a message with `showSupportActions` → `omniBox.openTicketForm()`.
- **State:** `omniBox.setState('ticket_form')`.
- **App:** When `state === 'ticket_form'`, OmniBox (or main layout) renders `<SupportTicketForm omniBox={omniBox} />` as a modal (overlay + dialog).

### 3.4 Support Ticket Form — Required Fields & Mock

**Required:**

- **Subject** (required): single-line text; pre-fill from `omniBox.query` when possible.
- **Description:** textarea; pre-fill e.g. `Issue context: ${omniBox.query}` when query exists.
- **Priority:** select; one of P1–P4 (e.g. critical, high, medium, low); default e.g. `'medium'`.
- **Page context:** read-only, from `omniBox.contextUrl` (can be in a Context chip).
- **Screen recording (optional):** Loom URL or inline Loom recorder; if `omniBox.loomAttachment` is set on mount, pre-fill `loomUrl` / `loomThumb` and clear `omniBox.loomAttachment`.

**Form state (local):**

- `subject`, `description`, `priority`, `loomUrl`, `loomThumb`, `submitted`.

**Submit:**  
On submit set `submitted = true`; show success view: "Ticket Submitted!", ticket id e.g. `#JSM-5821`, optional "Screen recording attached", "Done" button that calls `omniBox.close()`.

**Back / Close:**  
Back button → `omniBox.open()` (reopen popover). Close button → `omniBox.close()`.

### 3.5 In-Popover Ticket Flow (Explore Follow-up)

When user clicks "Create a support ticket" in the **Explore** follow-up flow (inside OmniBoxPopup):

- `followUpPhase = 'ticket-form'`.
- Render inline form: **Summary** (read-only, `defaultValue={followUpQuery}`), **Priority** (select P1–P4, default P2), **Description** (textarea, `defaultValue={fuSummary.summary}`), **Page Context** (read-only, `omniBox.contextUrl`).
- Optional: **"Record your issue via Loom"** button → `followUpPhase = 'ticket-loom-recording'`; after 3 s set `ticketLoomUrl = 'https://…'`, `followUpPhase = 'ticket-loom-done'`.
- **"Create Ticket"** button → `setFollowUpPhase('ticket-success')`.
- **ticket-success:** Show success message, ticket id (e.g. SUP-xxxxx), "View ticket details in new tab", "Show details in Rovo sidebar" (sets query and `openChatPanel(...)`).

No global `state = 'ticket_form'` here; this is all local to the popover’s follow-up flow.

---

## 4. Summary: State Transitions

| From | Action | To |
|------|--------|-----|
| `closed` | Bar click / R key (no focus in input) | `default` (popover open) |
| `default` | Overlay click / Escape / Close button | `closed` |
| `default` | Submit search (Enter or Send) | `closed` + `searchQuery` set (main = full-page results) |
| `default` | openChatPanel(prompt) | `chat_panel` (side panel open) |
| `chat_panel` | Close panel | `closed` |
| `chat_panel` | openLiveChat() | `live_chat` (Live Chat in panel slot) |
| `chat_panel` | openTicketForm() | `ticket_form` (ticket modal) |
| `live_chat` | Close | `closed` |
| `ticket_form` | Close / Done | `closed` |
| `default` | startLoomRecording() (from Record your issue) | `closed` + recording state; when done, can set state back to `default` |

Use this spec to wire the existing UI: state, handlers, and mock data as above; styling and layout can stay custom or align with your design system.
