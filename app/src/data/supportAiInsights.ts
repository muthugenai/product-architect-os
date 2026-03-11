/**
 * Support AI Insights list data — shared by OmniBoxPopup (Rovo Brief) and RovoSidePanel (View Support AI Insights).
 */

export type SupportInsightLevel = 'error' | 'warning' | 'info' | 'success';

export interface SupportInsightItem {
  id: string;
  level: SupportInsightLevel;
  title: string;
  subtitle: string;
  query: string;
}

export const SUPPORT_INSIGHT_ITEMS: SupportInsightItem[] = [
  { id: 'ins-p1', level: 'error', title: 'Critical incident — P1', subtitle: 'EMEA Billing queue — 93% ticket surge over 24 h. P1/P2 breach risk elevated.', query: 'Why is the EMEA billing queue surging?' },
  { id: 'ins-sla', level: 'warning', title: 'SLA breach risk', subtitle: '12 tickets in the APAC Technical queue are within 15 min of breaching P2 SLA.', query: 'Which APAC tickets are close to SLA breach?' },
  { id: 'ins-maint', level: 'info', title: 'Scheduled maintenance', subtitle: 'JSM maintenance: Sat 22 Feb, 02:00–04:00 UTC. Some features may be unavailable.', query: 'Tell me about the upcoming JSM maintenance window' },
  { id: 'ins-resolved', level: 'success', title: 'Incident resolved', subtitle: 'EU-West auth outage (JSM-5790) fully resolved. All systems operational.', query: 'Show EU-West auth outage post-mortem' },
];

export const CONFLUENCE_SUPPORT_INSIGHT_ITEMS: SupportInsightItem[] = [
  { id: 'cf-err', level: 'error', title: 'Page content could not be displayed', subtitle: 'One or more macros or embedded content failed to load on this page.', query: 'Why did content on this Confluence page fail to load and how do I fix it?' },
  { id: 'cf-warn', level: 'warning', title: 'Sync delayed', subtitle: 'Changes from this space may take a few minutes to appear in search.', query: 'How long does Confluence search index take to update?' },
  { id: 'cf-info', level: 'info', title: 'New editor available', subtitle: 'Try the new Confluence editor for a faster editing experience.', query: 'How do I switch to the new Confluence editor?' },
  { id: 'cf-ok', level: 'success', title: 'Page restored', subtitle: 'A previously archived page was restored to this space.', query: 'How do I restore an archived Confluence page?' },
];

export const JSM_SUPPORT_INSIGHT_ITEMS: SupportInsightItem[] = [
  { id: 'jsm-err', level: 'error', title: 'SLA breach on 3 open tickets', subtitle: 'Tickets SEC-001, IT-003, and IT-001 have exceeded their "Time to first response" SLA. No agent has responded within the agreed window.', query: 'How do I resolve these SLA breaches?' },
  { id: 'jsm-warn', level: 'warning', title: 'Request type missing fields', subtitle: '2 request types in IT Support are missing required fields. Customers may be unable to submit complete requests.', query: 'Which request types have missing required fields?' },
  { id: 'jsm-info', level: 'info', title: 'New portal theme available', subtitle: 'A new customer portal theme with improved accessibility is available. Apply it from Project Settings > Portal.', query: 'How do I apply a new portal theme in JSM?' },
  { id: 'jsm-ok', level: 'success', title: 'SLA goals on track', subtitle: 'All active SLA policies are within target. Current compliance rate: 97.2% across all queues.', query: 'Show current SLA compliance across all queues' },
];

export const SUPPORT_INSIGHT_COLORS: Record<SupportInsightLevel, { accent: string; bg: string }> = {
  error:   { accent: '#DE350B', bg: '#FFEBE6' },
  warning: { accent: '#FF8B00', bg: '#FFFAE6' },
  info:    { accent: '#0052CC', bg: '#DEEBFF' },
  success: { accent: '#006644', bg: '#E3FCEF' },
};

export function getSupportInsightItemsForPath(pathname: string): SupportInsightItem[] {
  if (pathname.startsWith('/confluence')) return CONFLUENCE_SUPPORT_INSIGHT_ITEMS;
  if (pathname === '/' || pathname.startsWith('/jsm')) return JSM_SUPPORT_INSIGHT_ITEMS;
  return SUPPORT_INSIGHT_ITEMS;
}
