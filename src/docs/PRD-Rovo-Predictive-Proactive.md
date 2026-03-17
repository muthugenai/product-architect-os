# Mini PRD: Rovo — From Reactive to Predictive & Proactive

**Product:** Support Insights 360 – Rovo (AI Persona)  
**Document:** Product Requirements Document (Mini)  
**Theme:** Making Rovo proactively tell users what needs to be done, in context  
**Status:** Draft  
**Last updated:** Feb 2026

---

## 1. Context

### 1.1 Rovo as the AI persona

- **Rovo** is the unified AI persona across the product: help, support, insights, and guidance.
- Today the mental model is **reactive**: “**Ask Rovo**” — the user must initiate. Rovo responds when asked.

### 1.2 Why this limits value

- Users don’t always know what to ask or when to ask.
- Important issues (SLA breach risk, incidents, repeated errors, churn signals) can go unnoticed until it’s too late.
- Help and next-best actions are buried until the user opens the omni-box and formulates a question.

### 1.3 Desired shift

Move from **“Ask Rovo”** to **“Rovo tells you what needs to be done”** — contextually, at the right time, without the user having to ask first.

---

## 2. Vision: Predictive & Proactive Rovo

**Rovo should proactively surface contextually relevant guidance and next-best actions so users see what needs attention before they have to ask.**

| Dimension | Reactive (today) | Predictive & Proactive (target) |
|-----------|------------------|----------------------------------|
| **Trigger** | User opens omni-box and types | Rovo surfaces based on context, behavior, and signals |
| **Message** | Answer to a question | “Here’s what needs your attention” / “You might want to…” |
| **Placement** | Inside the omni-box / panel after open | Omni-box indicator, in-page hints, and panel when opened |
| **Content** | Search + AI summary + links | Prioritized alerts, suggested actions, and explanations |

---

## 3. How to make it proactive: contextual “what needs to be done”

Rovo should **practically tell the user contextually what needs to be done** by combining:

### 3.1 Context awareness

- **Page / route:** Dashboard vs. specific insight (e.g. SLA Breach Risk, P1/P2 Surge) vs. article.
- **Data state:** KPIs, SLA %, resolution time, incident status, queue health.
- **User role and history:** Recent questions, resolved tickets, usage patterns.

### 3.2 Proactive signals (what to surface)

| Signal type | Example | Proactive message / action |
|-------------|--------|----------------------------|
| **Incident / outage** | Statuspage: incident in user’s region | “We detected an ongoing incident affecting Jira Cloud in EMEA. Status: Investigating. [View status] [Ask Rovo if this affects my project]” |
| **SLA / KPI breach** | SLA breach rate &gt; target for N days | “SLA breach rate at 8.2% — above your 5% target for 3 days. [Analyze root causes with Rovo]” |
| **Page dwell** | User on dashboard &gt; 3 min, no interaction | “Need help with this dashboard? Try: ‘What are the top 3 drivers of ticket volume this week?’” |
| **Repeated failure** | Same action fails 3+ times (e.g. filter) | “Having trouble with filters? [Guide: Configuring Data Sources]” |
| **Churn / at-risk** | ML: low usage, open tickets, low CSAT | “We noticed you’ve had a few open issues. [Connect with a dedicated support specialist]” |
| **Left sidebar alerts** | P1/P2 surge, Resolution time spike, SLA risk | Mirror or deepen in Rovo: “You have high-priority alerts. [Explain P1/P2 surge] [Suggest actions for SLA risk]” |

### 3.3 Surfaces (where Rovo “tells” the user)

1. **Omni-box header**  
   - Warning or info indicator when there is something proactive to show (e.g. incident, SLA breach, at-risk).

2. **On open: prominent alert / card at top of popup**  
   - One primary proactive message per open (or a short list), with:
     - Short explanation.
     - Primary CTA (e.g. “Analyze with Rovo”, “Open status page”, “Talk to specialist”).
     - Dismiss / “Don’t show again” where appropriate.

3. **In-context hints (optional)**  
   - Subtle tooltips or inline suggestions on the page (e.g. next to a spiking chart or an alert badge) that point to Rovo: “Rovo can explain this” / “See what Rovo suggests.”

4. **Rovo side panel**  
   - When user follows a proactive CTA, panel opens with **pre-filled context** (e.g. “Is this incident affecting my project?”, “Analyze root causes for SLA breach”) so the user doesn’t have to type.

---

## 4. Principles

- **Contextual:** Only show proactive content that is relevant to the current page, data, and user.
- **Prioritized:** One primary message at a time when possible; avoid alert fatigue.
- **Actionable:** Every proactive message should have a clear next step (open Rovo, read article, talk to support, view status).
- **Dismissible:** User can dismiss or snooze so Rovo doesn’t feel intrusive.
- **Consistent persona:** All copy and actions are “Rovo” (Help Agent) so the experience feels like one AI telling you what needs to be done.

---

## 5. Success metrics (draft)

| Metric | Target |
|--------|--------|
| **Proactive engagement rate** | % of users who click a proactive CTA (e.g. “Analyze with Rovo”, “View incident”) within a session. |
| **Deflection / resolution** | % of proactive flows that end in self-service (Rovo / article) vs. Live Chat / Ticket. |
| **Time to action** | Reduction in time from “something is wrong” to user taking an action (e.g. opening Rovo, viewing status). |
| **Relevance / satisfaction** | User feedback or survey: “Rovo’s suggestions were relevant” / “I knew what to do next.” |

---

## 6. Out of scope for this mini PRD

- Full ML model design for churn/at-risk.
- Detailed Statuspage API integration.
- Exact copy and UX for every proactive type (to be refined in design).
- Backend pipelines for real-time KPI/SLA thresholds (assumed to exist or be planned elsewhere).

---

## 7. Summary

**Today:** Rovo is reactive — “Ask Rovo” drives all interaction.  
**Target:** Rovo is **predictive and proactive** — Rovo **practically tells the user contextually what needs to be done** via:

- **Signals:** Incidents, SLA/KPI breach, dwell time, repeated errors, churn risk, sidebar alerts.
- **Surfaces:** Omni-box indicator, alert/card on open, optional in-context hints, and Rovo panel with pre-filled context.
- **Principles:** Contextual, prioritized, actionable, dismissible, one Rovo persona.

This mini PRD is the bridge from “Ask Rovo” to “Rovo tells you what needs your attention.”
