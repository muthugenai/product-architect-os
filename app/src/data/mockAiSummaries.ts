export interface AiSummary {
  query: string;
  summary: string;
  followUps: string[];
}

export const AI_SUMMARIES: AiSummary[] = [
  {
    query: 'metrics temporarily unavailable',
    summary:
      'I\'ve investigated the Support Insights 360 data pipeline and identified the issue. The metrics delay is caused by a temporary connectivity issue between the data aggregation service and the EMEA regional data store, which started at 01:42 UTC today. Affected dashboards include: Resolution Time Trend (stale data from 6h ago), Queue Health by Channel (EMEA rows showing cached values), and Cost Avoidance (delayed by ~2 hours). The engineering team has been notified (incident INC-4821) and a fix is being deployed. ETA to full restoration: ~45 minutes. In the meantime, you can rely on the KPI cards for near-real-time data, as they pull from a separate low-latency cache that is unaffected.',
    followUps: [
      'Which specific dashboards are affected right now?',
      'Is there a workaround to get real-time EMEA data?',
      'Show me the incident timeline for INC-4821',
      'How often do data pipeline delays occur?',
    ],
  },
  {
    query: 'permissions jira',
    summary:
      'Permission schemes in Jira define what users can do within a project. They control access to features like creating, editing, and managing issues. You can configure them under Project Settings > Permissions. Each permission can be granted to project roles, groups, or individual users. Global permissions apply across all of Jira, while project-level permissions are scoped to a single project.',
    followUps: [
      'How do I grant admin permissions to a project?',
      'What is the difference between a project role and a group?',
      'Can I copy a permission scheme to another project?',
    ],
  },
  {
    query: 'configure sla',
    summary:
      'SLA (Service Level Agreement) policies in Jira Service Management define the time goals for responding to and resolving requests. Navigate to Project Settings > SLAs to create or edit policies. Each SLA tracks time based on start, pause, and stop conditions you define. You can set separate time goals for different request types or priorities, and set up automation to alert agents when SLAs are at risk.',
    followUps: [
      'How do I pause an SLA during non-business hours?',
      'What triggers an SLA breach notification?',
      'How can I report on SLA compliance trends?',
    ],
  },
  {
    query: 'automation jsm',
    summary:
      'Jira Service Management automation lets you create rules that automatically perform actions based on triggers. Go to Project Settings > Automation to create a new rule. Choose a trigger (e.g., "Issue created"), add conditions to filter which issues qualify, and define actions (e.g., "Auto-assign to agent", "Transition issue", "Send email"). Rules can be scoped to a single project or run globally across multiple projects.',
    followUps: [
      'How do I auto-assign issues based on category?',
      'Can I trigger automation from a webhook?',
      'What are the most common automation templates?',
    ],
  },
  {
    query: '429 requests',
    summary:
      'HTTP 429 "Too Many Requests" means your application or API client is exceeding the rate limit enforced by the server. In Atlassian Cloud products, REST API calls are limited per user/app — typically 100 requests per 25-second window for standard endpoints. Common causes include: automation rules triggering rapid successive calls, third-party integrations polling too frequently, or bulk operations running without throttling. To resolve this, implement exponential back-off retry logic, check the `Retry-After` response header for the recommended wait time, and review your integration code for unnecessary API calls.',
    followUps: [
      'How do I check my current API rate limit usage?',
      'What are the Atlassian Cloud REST API rate limits?',
      'How do I implement exponential back-off in my integration?',
    ],
  },
  {
    query: 'billing queue surge',
    summary:
      'Based on current Support Insights 360 data, the Billing queue in EMEA has seen a 93% increase in P1/P2 ticket volume over the past 24 hours. The primary drivers are: Login Issues (43% of tickets), Billing discrepancies (28%), and Integration failures (18%). Resolution time has increased from 35 to 52 minutes. Recommended actions: add temporary staffing to the EMEA Billing queue, create an automated triage rule for common billing queries, and review the recent pricing update rollout for potential issues.',
    followUps: [
      'Which agents are handling the most Billing tickets?',
      'Is the surge related to the recent pricing update?',
      'Show me the top 5 billing issues by volume',
    ],
  },
  {
    query: 'macro failed render',
    summary:
      'When a Confluence macro fails to render, it’s usually due to the macro being removed or disabled, the associated app being unavailable, or invalid or outdated configuration. For the "Status" macro specifically: check that the Status app is installed and enabled in your Confluence space; confirm the macro’s linked Jira project or filter still exists; try removing and re-inserting the macro. If the macro was provided by a third-party app, check the vendor’s status page or re-authorize the app in Confluence settings.',
    followUps: [
      'How do I fix a broken Status macro in Confluence?',
      'Where do I enable or reinstall macros in Confluence?',
      'How do I remove a macro that won’t load?',
      'Ask a follow up question',
    ],
  },
];

const DEFAULT_SUMMARY: AiSummary = {
  query: '',
  summary:
    'I found several relevant articles and documentation that may help with your query. The results below are ranked by relevance based on your current page context and question. Click any result to view the full article, or switch to "In Page Help" to see all matching articles without the AI summary.',
  followUps: [
    'Can you explain this in more detail?',
    'Show me step-by-step instructions',
    'What are the best practices for this?',
  ],
};

const NO_CONTEXT_PREFIX = 'Searching by keyword only (page context removed). ';

export function getAiSummary(query: string, withContext = true): AiSummary {
  const q = query.toLowerCase();
  for (const s of AI_SUMMARIES) {
    if (s.query.split(' ').some(word => q.includes(word))) {
      return {
        ...s,
        query,
        summary: withContext
          ? s.summary
          : NO_CONTEXT_PREFIX + s.summary,
      };
    }
  }
  return {
    ...DEFAULT_SUMMARY,
    query,
    summary: withContext
      ? DEFAULT_SUMMARY.summary
      : NO_CONTEXT_PREFIX + DEFAULT_SUMMARY.summary,
  };
}

// ── Relevant prompt suggestions keyed by keyword ─────────────────────────────
const PROMPT_POOL: { keywords: string[]; prompt: string }[] = [
  { keywords: ['permission', 'access', 'role'], prompt: 'How do I grant admin access to a Jira project?' },
  { keywords: ['permission', 'role', 'scheme'], prompt: 'What is the difference between a project role and a group?' },
  { keywords: ['permission', 'copy', 'scheme'], prompt: 'Can I copy a permission scheme to another project?' },
  { keywords: ['sla', 'breach', 'policy'], prompt: 'How do I configure SLA time goals for different priorities?' },
  { keywords: ['sla', 'pause', 'hours'], prompt: 'How do I pause an SLA during non-business hours?' },
  { keywords: ['sla', 'notification', 'alert'], prompt: 'How do I set up SLA breach notifications?' },
  { keywords: ['sla', 'report', 'compliance'], prompt: 'How can I report on SLA compliance trends?' },
  { keywords: ['automation', 'rule', 'trigger'], prompt: 'How do I create an automation rule in Jira Service Management?' },
  { keywords: ['automation', 'assign', 'auto'], prompt: 'How do I auto-assign issues based on category?' },
  { keywords: ['automation', 'webhook', 'api'], prompt: 'Can I trigger automation rules from a webhook?' },
  { keywords: ['automation', 'template'], prompt: 'What are the most common automation templates?' },
  { keywords: ['billing', 'payment', 'invoice'], prompt: 'Why is there a spike in billing support tickets?' },
  { keywords: ['billing', 'queue', 'surge'], prompt: 'Which agents are handling the most billing tickets?' },
  { keywords: ['billing', 'pricing', 'update'], prompt: 'Is the billing surge related to the recent pricing update?' },
  { keywords: ['dashboard', 'metric', 'report'], prompt: 'How do I build a custom support metrics dashboard?' },
  { keywords: ['insight', 'trend', 'analytics'], prompt: 'Show me ticket volume trends for the last 30 days' },
  { keywords: ['queue', 'triage', 'priority'], prompt: 'How do I set up automatic ticket triage by priority?' },
  { keywords: ['agent', 'performance', 'workload'], prompt: 'How do I view agent workload distribution?' },
  { keywords: ['incident', 'outage', 'alert'], prompt: 'How do I link an incident to affected support tickets?' },
  { keywords: ['escalation', 'escalate', 'p1'], prompt: 'What is the escalation path for a P1 incident?' },
  { keywords: ['429', 'rate', 'limit', 'requests'], prompt: 'What are the Atlassian Cloud API rate limits?' },
  { keywords: ['429', 'too', 'many', 'requests', 'throttle'], prompt: 'How do I implement exponential back-off for API calls?' },
  { keywords: ['429', 'retry', 'header', 'api'], prompt: 'How do I check the Retry-After header in API responses?' },
  { keywords: ['metrics', 'unavailable', 'delayed', 'data'], prompt: 'Which dashboards are affected by the data pipeline issue?' },
  { keywords: ['metrics', 'pipeline', 'restore'], prompt: 'How often do data pipeline delays occur?' },
  { keywords: ['metrics', 'incident', 'workaround'], prompt: 'Is there a workaround to get real-time EMEA data?' },
];

export function getRelevantPrompts(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];
  const words = q.split(/\s+/);
  const scored = PROMPT_POOL.map(entry => ({
    prompt: entry.prompt,
    score: entry.keywords.filter(kw => words.some(w => kw.startsWith(w) || w.startsWith(kw))).length,
  })).filter(e => e.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(e => e.prompt);
}

// ── Relevant suggested fix (one-liner for search results) ─────────────────
const FIX_POOL: { keywords: string[]; fix: string }[] = [
  { keywords: ['metrics', 'unavailable', 'delayed'], fix: 'Use KPI cards for near-real-time data while the pipeline is restored (~45 min).' },
  { keywords: ['permission', 'jira', 'access'], fix: 'Go to Project Settings → Permissions and assign the needed role or group to the permission.' },
  { keywords: ['sla', 'configure', 'policy'], fix: 'Create or edit SLA policies under Project Settings → SLAs and set start/pause/stop conditions.' },
  { keywords: ['automation', 'jsm', 'rule'], fix: 'In Project Settings → Automation, add a new rule with your trigger, conditions, and actions.' },
  { keywords: ['429', 'rate', 'limit', 'requests'], fix: 'Implement exponential back-off and respect the Retry-After header; reduce polling frequency.' },
  { keywords: ['billing', 'queue', 'surge'], fix: 'Add temporary EMEA Billing queue staffing and an automated triage rule for common billing queries.' },
  { keywords: ['macro', 'failed', 'render', 'confluence'], fix: 'Check that the macro app is enabled, the linked Jira project exists, and try re-inserting the macro.' },
];

const DEFAULT_FIX = 'Review the summary above and follow the recommended steps for your scenario.';

export function getSuggestedFix(query: string): string {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return DEFAULT_FIX;
  const words = q.split(/\s+/);
  const scored = FIX_POOL.map(entry => ({
    fix: entry.fix,
    score: entry.keywords.filter(kw => words.some(w => kw.startsWith(w) || w.startsWith(kw))).length,
  })).filter(e => e.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.length > 0 ? scored[0].fix : DEFAULT_FIX;
}
