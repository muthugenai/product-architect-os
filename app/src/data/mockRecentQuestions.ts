export interface RecentQuestion {
  id: string;
  text: string;
  timestamp: number;
}

export const DEFAULT_RECENT_QUESTIONS: RecentQuestion[] = [
  { id: 'rq-1', text: 'Why is the EMEA billing queue surging?', timestamp: Date.now() - 1000 * 60 * 15 },
  { id: 'rq-2', text: 'Show SLA breach rate for NA Chat', timestamp: Date.now() - 1000 * 60 * 60 },
  { id: 'rq-3', text: 'How to set up automation in JSM?', timestamp: Date.now() - 1000 * 60 * 60 * 3 },
  { id: 'rq-4', text: 'Analyze customer sentiment trends', timestamp: Date.now() - 1000 * 60 * 60 * 24 },
  { id: 'rq-5', text: 'What is the average first response time today?', timestamp: Date.now() - 1000 * 60 * 60 * 48 },
];

export const SUGGESTED_PROMPTS = [
  'What are permission schemes in Jira?',
  'How do I configure SLA policies?',
  "What's the current P1/P2 ticket trend?",
  'Help me set up automation rules',
  "Show me today's support summary",
  'Identify cost saving opportunities from ticket deflection',
  'Summarize support health across all regions',
];
