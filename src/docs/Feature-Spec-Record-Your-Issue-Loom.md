# Feature Specification: Record Your Issue (Loom Recording)

**Purpose:** Extract the core mechanics of the "Record your issue" (Loom) flow so an AI coding agent can rebuild it as a frontend-only, highly interactive UX demo using the Atlassian Design System. This spec focuses on **React state, component transitions, user interactions, and mock data**. It ignores real media streaming, camera/microphone APIs, and backend upload.

---

## 1. Trigger & Initial State

### 1.1 Entry Points for "Record Your Issue"

There are **two distinct trigger paths**. Both lead to an "active recording" state; only the surrounding UI differs.

#### Path A — From the header bar (no popover)

**Where:** Header bar Loom dropdown, or Help tab inside the popover → Support sub-tab → "Record your issue" button → sub-menu.

**Exact `onClick` logic (e.g. from Help tab sub-menu):**

```ts
// Close the sub-menu and popover, then start recording
setRecordSubMenuOpen(false);   // if from Help tab sub-menu
// OR setLoomMenuOpen(false);   // if from header Loom dropdown
omniBox.setState('closed');    // close the Ask Rovo popover (if open)
omniBox.startLoomRecording();  // sets loomRecordingInProgress = true
```

**Immediate UI changes:**

- Popover closes (omni box state becomes `'closed'`).
- The **Ask Rovo bar** in the header is the only visible recording UI: it shows a **spinner** and the text **"Recording…"** (replacing the placeholder or input). The bar remains clickable in principle but typically does not open the popover again until recording finishes.
- **No modal opens.** There is **no camera/microphone permissions** mock or dialog. Recording is simulated; no real `getDisplayMedia` or permission UI is required for the demo.

#### Path B — From inside the popover (Loom flow)

**Where:** Popover open → Support dropdown → "Record your issue", **or** Loom dropdown → "Record screen only". Both set the internal Loom flow view to recording.

**Exact `onClick` logic:**

```ts
setSupportOpen(false);   // or setLoomOpen(false)
setLoomFlowView('recording');
```

**Immediate UI changes:**

- Popover **stays open** but its content switches to the **Loom flow**.
- A **Back** button appears at the top of the flow; the main body shows the **"Record screen only"** step: title, short description, and the **LoomRecorder** component (a single button: "Record a Loom").
- When the user clicks "Record a Loom", `LoomRecorder` calls `startRecording()` and then `onRecordingStart()` → `omniBox.setLoomRecordingInProgress(true)`. At that moment the **popover is given a class** (e.g. `omnibox-popup--recording-collapsed`) so it is moved off-screen (e.g. `left: -9999px`; `visibility: hidden`) and the **header bar** again shows **"Recording…"** and the **spinner**. So the visible "active recording" UI is the same as in Path A: the bar, not a modal.

**Summary:** In both paths, the **only** visible recording state is the **header bar** with spinner + "Recording…". No modal, no permissions screen. Popover either closes (Path A) or is hidden via CSS (Path B).

---

## 2. The "Active Recording" UI

### 2.1 Where It Is Shown

- **Container:** The **Ask Rovo** bar in the app header (same bar that normally shows "Ask Rovo for Help" or the search input).
- **Condition:** `omniBox.loomRecordingInProgress === true`.

### 2.2 Layout and Controls

When `loomRecordingInProgress` is true, the bar content (middle area) is replaced by:

| Element        | Description |
|----------------|-------------|
| **Spinner**    | A small circular loading spinner (e.g. 14×14px), border-based rotation animation (e.g. 0.7s linear infinite). Color: brand purple or neutral. |
| **Label**      | Text: **"Recording…"** (with ellipsis). |

Layout: inline flex, gap ~8px, vertically centered. No separate overlay or floating widget.

**There are no Pause, Resume, or explicit "Stop Recording" buttons in the header.** The demo uses a **fixed-duration simulation**: recording "ends" automatically after a timeout (see §4).

### 2.3 In-Popover Recording Widget (Path B only)

When the user starts from inside the popover, the **LoomRecorder** component is shown **before** they click "Record a Loom". After they click:

- **Before completion:** The same bar spinner + "Recording…" is shown (popover collapsed/hidden).
- **Inside LoomRecorder** (when `isRecording` is true and the component is still visible in DOM): The button changes to show a **pulsing red dot** and the label **"Recording…"**. The button is **disabled** (`cursor: wait`). There is **no Stop button** in the current implementation; the hook auto-completes after a delay (e.g. 2 seconds).

**LoomRecorder active state (for Replit):**

- One control: a **button** that shows:
  - A **pulsing dot** (e.g. 10×10px circle, red `#FF5733`, CSS animation `pulse` ~1s infinite).
  - The text **"Recording…"**.
- Button is **disabled** during recording; no Pause/Resume/Stop. For a richer demo, you could add a "Stop recording" control that calls a callback to end the simulation early.

### 2.4 Atlassian Design System Mapping

| Current element        | ADS / implementation note |
|------------------------|---------------------------|
| Header bar "Recording…" + spinner | Use **@atlaskit/spinner** (small size) next to **@atlaskit/text** or plain text. Bar can stay custom or use a standard header layout. |
| LoomRecorder button (idle)        | **@atlaskit/button** (secondary or default), with custom red border/icon for "Record". |
| LoomRecorder button (recording)   | **@atlaskit/button** with `isDisabled`, custom **pulsing dot** (no ADS equivalent; use a small div + CSS animation). |
| Back button in Loom flow          | **@atlaskit/button** (subtle link or secondary) with chevron-left icon. |
| "Loom Recording is ready" section | **@atlaskit/card** or a simple bordered container; headings with **@atlaskit/heading** or ADS typography. |

---

## 3. Post-Recording Flow (The Handoff)

### 3.1 What Triggers "Recording Complete"

**Path A (from header):**  
A **useEffect** in the omni box hook runs when `loomRecordingInProgress` is true. After a **3.2 second** timeout it:

1. Sets `loomRecordingInProgress = false`.
2. Sets `loomRecordingReady = true`.
3. Sets `loomAttachment = { sharedUrl, thumbnailUrl }` (mock values).
4. Sets omni box state to `'default'` so the **popover reopens**.

So the user sees the bar spinner for ~3.2s, then the popover opens and shows the "ready" content.

**Path B (from popover):**  
The **LoomRecorder** uses a **useLoom** hook that simulates recording (e.g. 2 second delay), then sets a mock `recording` object. A **useEffect** in LoomRecorder calls `onRecordingComplete(recording.sharedUrl, recording.thumbnailUrl)`. The parent then:

1. `setPendingLoomRecording({ sharedUrl: url, thumbnailUrl: thumb })`.
2. `omniBox.setLoomRecordingInProgress(false)`.
3. `setLoomFlowView('post-record')`.

The popover is no longer collapsed; the user sees the **"Loom Recording is ready"** step inside the same flow (no full-screen "Generating video..." overlay).

### 3.2 "Generating Video..." / Loading

There is **no** explicit "Generating video..." or upload progress UI. The only loading state is the **header bar** "Recording…" + spinner. When the timeout (or mock completion) fires, that state clears and the next UI (bar + open popover with "Loom Recording is ready") appears. For Replit, you can optionally add a short "Processing…" or "Generating…" step (e.g. 1s) before showing the ready state.

### 3.3 Final State UI: "Loom Recording is ready"

Shown when either:

- `loomFlowView === 'post-record' && pendingLoomRecording`, or  
- `omniBox.loomRecordingReady && omniBox.loomAttachment` (Path A or after reopening).

**Layout (single step in the Loom flow):**

1. **Back** button (returns to previous step or closes and clears Loom state).
2. **Title:** "Loom Recording is ready".
3. **AI Summary** — label "AI Summary" + one paragraph of mock summary text (from `getAiSummary(loomSampleQuery)` or similar).
4. **Recommendation** — label "Recommendation" + one paragraph (e.g. from `getSuggestedFix(loomSampleQuery)`).
5. **"What would you like to do?"** — call-to-action copy.
6. **Actions (in order):**
   - **Apply recommended fix** — primary button; sets query, loom attachment, article context, opens Rovo side panel, then clears Loom flow and closes popover.
   - **Ask a follow up question** — secondary; sets query, loom attachment, opens Live Chat, clears and closes.
   - **Loom recording attached** — read-only checkbox/label with link: "Loom recording attached — **Watch recording**" (href = `recording.sharedUrl`).
   - **Get Support** — button; sets query, attachment, opens chat panel with `__loom_support__`, clears and closes.
   - **Share recording** — button; copies `sharedUrl` to clipboard, then clears and closes.

**No embedded video player.** The recording is represented by:

- The **"Watch recording"** link (opens mock Loom URL in a new tab).
- Optionally a **thumbnail** in other contexts (e.g. ticket form or Rovo panel); in the main "ready" step the link is sufficient.

**Mock Loom URL** is stored in global/context state (`loomAttachment.sharedUrl`) and can be passed into the ticket form, Rovo panel, or chat so that "Loom recording attached" appears there too. It is **not** appended into the main search/prompt text input.

---

## 4. State Management & Mock Data

### 4.1 State Variables

**Global (e.g. OmniBox context):**

| Variable                   | Type                     | Meaning |
|----------------------------|--------------------------|--------|
| `loomRecordingInProgress` | `boolean`                | True while the simulated recording is in progress; drives bar "Recording…" + spinner and (optional) popover collapse. |
| `loomRecordingReady`      | `boolean`                | True when a recording has been "completed" and is available to attach. |
| `loomAttachment`          | `{ sharedUrl: string; thumbnailUrl: string } \| null` | The last completed recording; used by "Loom Recording is ready", ticket form, and Rovo panel. |
| `setLoomRecordingInProgress` | `(v: boolean) => void` | Set from LoomRecorder `onRecordingStart` / completion and from the 3.2s timeout (Path A). |
| `setLoomRecordingReady`    | `(v: boolean) => void`   | Set true when recording completes (Path A). |
| `setLoomAttachment`        | `(a: LoomAttachment \| null) => void` | Set when recording completes; cleared when user dismisses or clears Loom. |
| `clearLoomReady`           | `() => void`             | Sets `loomRecordingReady = false` and `loomAttachment = null`. |
| `startLoomRecording`       | `() => void`             | Sets `loomRecordingInProgress = true`; a separate effect (Path A) runs the 3.2s timeout and then sets ready + attachment + reopens popover. |

**Local to Loom flow (e.g. OmniBoxPopup):**

| Variable               | Type                                                                 | Meaning |
|------------------------|----------------------------------------------------------------------|--------|
| `loomFlowView`         | `'recording' \| 'post-record' \| 'get-support' \| null`             | Which step of the in-popover Loom flow is shown. |
| `pendingLoomRecording` | `{ sharedUrl: string; thumbnailUrl: string } \| null`               | Recording just completed in Path B; used until user leaves the flow or hands off to panel/ticket. |

**Local to LoomRecorder (useLoom hook):**

| Variable        | Type                    | Meaning |
|-----------------|-------------------------|--------|
| `isRecording`   | `boolean`               | True from start until mock completion (e.g. 2s). |
| `recording`      | `LoomRecording \| null` | Set when mock completes; drives preview and `onRecordingComplete`. |
| `error`         | `string \| null`        | Optional; e.g. if `getDisplayMedia` is not supported (demo can skip). |

### 4.2 Mock Data for Final State

**LoomAttachment (minimal, used in context):**

```json
{
  "sharedUrl": "https://www.loom.com/share/mock-recording-id",
  "thumbnailUrl": ""
}
```

**LoomRecording (full, from useLoom for LoomRecorder preview / duration):**

```json
{
  "sharedUrl": "https://www.loom.com/share/mock-recording-id-12345",
  "embedUrl": "https://www.loom.com/embed/mock-recording-id-12345",
  "thumbnailUrl": "https://cdn.loom.com/sessions/thumbnails/mock-recording-id-12345.jpg",
  "duration": 47
}
```

- **duration** is in **seconds** (e.g. 47 → "0:47" in UI).
- **thumbnailUrl** can be empty in the minimal attachment; the "Loom Recording is ready" step only needs the **Watch recording** link. Use the full object where a thumbnail is shown (e.g. ticket form or Rovo panel).

### 4.3 Timeouts (Demo)

- **Path A (header only):** After `startLoomRecording()`, run a **3200 ms** timer, then set ready + attachment and reopen popover.
- **Path B (LoomRecorder):** After `startRecording()`, run a **2000 ms** timer, then set the mock `recording` and call `onRecordingComplete`. No separate "generating" delay unless you add one for UX.

### 4.4 Clearing Loom State

When the user clicks **Back** from the "Loom Recording is ready" step and the flow was opened from global state (no `loomFlowView`), call `clearLoomReady()` and `close()`. When the user came from the in-popover flow, set `loomFlowView` back (e.g. to `null` or `'recording'`) and clear `pendingLoomRecording` (and optionally `loomFollowUpPhase` if already in get-support). This keeps the demo state consistent when re-entering the flow.

---

## Summary for Replit

- **Trigger:** One path closes the popover and starts a 3.2s bar-only recording; the other opens an in-popover "Record screen only" step with a button that starts a 2s simulation and then hides the popover and shows the bar.
- **Active recording:** Only the **header bar** shows a **spinner** and **"Recording…"**; optionally the in-popover button shows a **pulsing red dot** + "Recording…" and is disabled. No modal, no permissions screen, no Pause/Resume/Stop in the current spec (stop can be added as an optional enhancement).
- **Post-recording:** No "Generating video..." UI. After the timer, show the **"Loom Recording is ready"** step with AI summary, recommendation, and actions (Apply fix, Ask follow up, Get Support, Share). Represent the recording with a **Watch recording** link and optional thumbnail; store **sharedUrl** (and optionally **thumbnailUrl**) in context for the ticket form and Rovo panel.
- **State:** `loomRecordingInProgress`, `loomRecordingReady`, `loomAttachment` in context; `loomFlowView` and `pendingLoomRecording` in the popover; `isRecording` and `recording` in useLoom. Use the provided JSON for mock URLs and duration so the finished state renders immediately after the simulated recording ends.
