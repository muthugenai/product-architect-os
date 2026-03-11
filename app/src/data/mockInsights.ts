export type InsightSeverity = 'high' | 'medium' | 'low';

export interface InsightCause {
  title: string;
  confidence: 'High confidence' | 'Medium confidence' | 'Low confidence';
  detail: string;
}

export interface InsightFix {
  action: string;
  owner: string;
}

export interface Insight {
  id: string;
  title: string;
  severity: InsightSeverity;
  tags: string[];
  whatHappened: string;
  trendData: number[];        // 7-day values
  trendBaseline: number;
  current: number;
  baseline: number;
  changePercent: string;
  roveSuggestions: string[];
  impact: string;
  whyLikelySummary: string;
  causes: InsightCause[];
  howToFix: string;
  fixes: InsightFix[];
  dataSources: string[];
  lastRefreshed: string;
  detail: string;             // sidebar subtitle
}

export const INSIGHTS: Insight[] = [
  {
    id: 'i1',
    title: 'P1/P2 Tickets Surge',
    severity: 'high',
    tags: ['volume', 'Billing', 'EMEA'],
    whatHappened:
      'P1/P2 ticket volume increased by 93% in the Billing queue for EMEA region over the past 24 hours.',
    trendData: [32, 35, 31, 40, 45, 52, 58, 63, 71, 75, 80, 84, 87, 87],
    trendBaseline: 45,
    current: 87,
    baseline: 45,
    changePercent: '+93.3%',
    roveSuggestions: [
      'Compare with last month',
      'Find similar insights',
      'Analyse customer sentiment',
    ],
    impact: 'Potential $15K ARR at risk from delayed resolutions.',
    whyLikelySummary:
      'Recent pricing update rollout causing customer confusion about billing cycles.',
    causes: [
      {
        title: 'Pricing Update Communication Gap',
        confidence: 'High confidence',
        detail:
          'The Jan 27 pricing tier change email was sent to only 62% of affected accounts. Customers are contacting support because they were not informed of the change in advance.',
      },
      {
        title: 'Self-Service Documentation Outdated',
        confidence: 'Medium confidence',
        detail:
          'The billing FAQ in the help centre has not been updated since Q3 2025. Customers cannot self-resolve billing queries, driving ticket volume up.',
      },
    ],
    howToFix:
      'Deploy updated FAQ, brief support agents on new pricing structure, consider temporary staffing increase.',
    fixes: [
      { action: 'Update billing FAQ in help centre', owner: 'Docs Team' },
      { action: 'Send corrective email to remaining 38% of accounts', owner: 'Marketing' },
      { action: 'Add temporary capacity to EMEA Billing queue', owner: 'WFM' },
    ],
    dataSources: ['Support Tickets DB', 'WFM System', 'CRM', 'Release Tracker'],
    lastRefreshed: '5 minutes ago',
    detail: '93% change in Billing • EMEA',
  },
  {
    id: 'i2',
    title: 'Resolution Time Spike',
    severity: 'medium',
    tags: ['performance', 'Admin', 'NA'],
    whatHappened:
      'Average resolution time in the Admin queue (NA region) has increased by 49% over the past 48 hours, rising from 35 min to 52 min.',
    trendData: [34, 35, 36, 37, 40, 41, 44, 47, 49, 50, 51, 52, 52, 52],
    trendBaseline: 35,
    current: 52,
    baseline: 35,
    changePercent: '+48.6%',
    roveSuggestions: [
      'Show agent workload breakdown',
      'Compare with APAC region',
      'Identify slowest ticket categories',
    ],
    impact: 'CSAT risk if resolution times exceed SLA threshold for 2+ days.',
    whyLikelySummary:
      'Two senior agents on PTO combined with a spike in complex permission-related tickets.',
    causes: [
      {
        title: 'Agent Capacity Shortfall',
        confidence: 'High confidence',
        detail:
          '2 of 5 senior Admin agents are on planned leave. Remaining agents are handling 240% of normal ticket load.',
      },
      {
        title: 'Complex Ticket Mix',
        confidence: 'Medium confidence',
        detail:
          'Permission scheme tickets require elevated access and cross-team coordination, adding ~20 min per ticket vs the baseline.',
      },
    ],
    howToFix:
      'Temporarily reassign 2 agents from NA Chat queue, enable AI-assisted triage for permission tickets.',
    fixes: [
      { action: 'Reassign 2 agents from NA Chat to NA Admin', owner: 'WFM' },
      { action: 'Enable AI triage for permission-related tickets', owner: 'Platform' },
      { action: 'Escalate backlog to on-call senior agent', owner: 'Team Lead' },
    ],
    dataSources: ['Support Tickets DB', 'WFM System', 'HRIS'],
    lastRefreshed: '12 minutes ago',
    detail: '49% change in Admin • NA',
  },
  {
    id: 'i3',
    title: 'SLA Breach Risk – Chat',
    severity: 'high',
    tags: ['SLA', 'Chat', 'NA'],
    whatHappened:
      '12 tickets in the NA Chat queue are within 15 minutes of breaching their P2 SLA. Current breach rate has risen to 8.2%, up from 5% target.',
    trendData: [5.0, 5.1, 5.2, 5.5, 5.8, 6.2, 6.5, 6.9, 7.2, 7.6, 7.9, 8.0, 8.1, 8.2],
    trendBaseline: 5.0,
    current: 8.2,
    baseline: 5.0,
    changePercent: '+64%',
    roveSuggestions: [
      'Show tickets closest to breach',
      'Suggest re-prioritisation',
      'Draft SLA escalation notice',
    ],
    impact: 'SLA breach penalties estimated at $8K. Customer trust risk for enterprise accounts.',
    whyLikelySummary:
      'Increased ticket volume from billing surge is spilling over into the Chat queue, overwhelming current capacity.',
    causes: [
      {
        title: 'Volume Spillover from Billing Queue',
        confidence: 'High confidence',
        detail:
          'The EMEA billing surge has pushed overflow tickets into the NA Chat queue, adding ~40 tickets above normal baseline since 06:00 UTC.',
      },
      {
        title: 'Routing Rule Misconfiguration',
        confidence: 'Medium confidence',
        detail:
          'A recently updated routing rule is sending billing-adjacent tickets to Chat instead of the dedicated Billing queue, bypassing specialised agents.',
      },
    ],
    howToFix:
      'Fix routing rule immediately, manually re-queue the 12 at-risk tickets, and temporarily boost NA Chat staffing.',
    fixes: [
      { action: 'Revert routing rule change deployed Jan 27', owner: 'Platform' },
      { action: 'Manually escalate 12 at-risk tickets to senior agents', owner: 'Team Lead' },
      { action: 'Add 3 agents to NA Chat until queue stabilises', owner: 'WFM' },
    ],
    dataSources: ['Support Tickets DB', 'SLA Monitor', 'Routing Engine Logs'],
    lastRefreshed: '2 minutes ago',
    detail: '82% change in All • NA',
  },
];

export function getInsightById(id: string): Insight | undefined {
  return INSIGHTS.find(i => i.id === id);
}
