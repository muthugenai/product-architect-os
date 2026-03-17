# Omni-box tab information architecture

**Goal:** Clearly segment **Help and Support**, **Rovo Brief**, and **AI Mode** so users know where to go for each type of action.

---

## 1. Three segments (tabs)

| Tab | Purpose | Contents |
|-----|--------|----------|
| **Help and Support** | Self-service + human support and tickets | Help Pages, Try asking, Recently asked, and Support (Live Chat, New Ticket, View my cases). All in one panel. **First tab.** |
| **Rovo Brief** | Proactive "for you" list — what needs attention now | 2–4 contextual items (incidents, SLA breach, dwell tip, repeated error, churn offer) + fallback "Try asking" prompts. |
| **AI Mode** | Ask Rovo / search — AI summary and results | Shown when user types in the input. AI summary, follow-up question, help results, community, videos. When nothing typed: "Type above to get AI-powered answers." |

---

## 2. Tab order and default

- **Order:** Help and Support → Rovo Brief → AI Mode  
- **Default tab on open:** **Help and Support** (first tab).  
- **When user starts typing:** Switch to **AI Mode** and show results there.  
- **When user clears input and was on AI Mode:** Return to **Help and Support**.

---

## 3. Content per tab

### Help and Support
- **Section: Help Pages** — Contextual help articles (cards), "Read Help articles at support.atlassian.com" link
- **Section: Try asking** — Suggested prompts for current page
- **Section: Recently asked** — Recent questions (or "No recent questions yet")
- **Section: Support** — Live Chat, New Ticket, View my cases (one row per action with short description)
- Single scrollable panel with section labels; no nested tabs

### Rovo Brief
- Header: "Rovo brief" + "Things for you right now"
- List of 2–4 clickable items (from proactive alerts + fallback prompts)
- No sub-tabs

### AI Mode
- **When user has typed:** AI summary, "Ask a Follow Up Question," help results, community, videos (current behavior)
- **When user has not typed:** Short empty state: "Type in the box above to get AI-powered answers and help articles."

---

## 4. Segment definitions (for copy and UX)

- **Help and Support** = "Find answers yourself + talk to someone or create a ticket" (articles, suggestions, history, Live Chat, New Ticket, cases).  
- **Rovo Brief** = "What Rovo thinks you need right now" (proactive).  
- **AI Mode** = "Ask Rovo and get an AI answer" (conversational search).

---

## 5. Summary

| Segment         | One-line description                          |
|-----------------|------------------------------------------------|
| Help and Support| Articles, suggested questions, and support     |
| Rovo Brief      | Things for you right now                       |
| AI Mode         | Ask Rovo — AI answers and results              |

This keeps the three segments distinct and easy to scan.
