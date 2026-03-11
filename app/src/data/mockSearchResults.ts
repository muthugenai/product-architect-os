export interface SearchResult {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  slug: string;
  url: string;
}

export const SEARCH_RESULTS: Record<string, SearchResult[]> = {
  default: [
    {
      id: 'sr-1',
      title: 'Getting Started with Support Insights 360',
      category: 'Getting Started',
      excerpt: 'Learn how to navigate the Support Insights 360 dashboard and understand key metrics.',
      slug: 'getting-started-support-insights-360',
      url: '/article/getting-started-support-insights-360',
    },
    {
      id: 'sr-2',
      title: 'Configuring Data Sources',
      category: 'Support Best Practices',
      excerpt: 'Connect Jira Service Management, Zendesk, and other sources to your insights dashboard.',
      slug: 'configuring-data-sources',
      url: '/article/configuring-data-sources',
    },
    {
      id: 'sr-3',
      title: 'What are permission schemes in Jira?',
      category: 'Jira Administration',
      excerpt: 'Permission schemes define what users can do within a project, controlling access to features.',
      slug: 'jira-permission-schemes',
      url: '/article/jira-permission-schemes',
    },
    {
      id: 'sr-4',
      title: 'Jira Service Management Documentation',
      category: 'JSM',
      excerpt: 'Full product documentation for Jira Service Management including SLA policies and automation.',
      slug: 'jsm-documentation',
      url: '/article/jsm-documentation',
    },
  ],
  permissions: [
    {
      id: 'sr-3',
      title: 'What are permission schemes in Jira?',
      category: 'Jira Administration',
      excerpt: 'Permission schemes define what users can do within a project, controlling access to features.',
      slug: 'jira-permission-schemes',
      url: '/article/jira-permission-schemes',
    },
    {
      id: 'sr-5',
      title: 'Project Roles vs Permission Schemes',
      category: 'Jira Administration',
      excerpt: 'Understand the difference between project roles and permission schemes in Jira.',
      slug: 'project-roles-vs-permission-schemes',
      url: '/article/project-roles-vs-permission-schemes',
    },
    {
      id: 'sr-6',
      title: 'Setting Up Issue Security Levels',
      category: 'Jira Administration',
      excerpt: 'Control which users can see issues within a project using security levels.',
      slug: 'issue-security-levels',
      url: '/article/issue-security-levels',
    },
    {
      id: 'sr-4',
      title: 'Jira Service Management Documentation',
      category: 'JSM',
      excerpt: 'Full product documentation for Jira Service Management including SLA policies and automation.',
      slug: 'jsm-documentation',
      url: '/article/jsm-documentation',
    },
  ],
  sla: [
    {
      id: 'sr-7',
      title: 'Configuring SLA Policies in JSM',
      category: 'JSM',
      excerpt: 'Step-by-step guide to setting up SLA policies and time-based goals for your service desk.',
      slug: 'configuring-sla-policies',
      url: '/article/configuring-sla-policies',
    },
    {
      id: 'sr-8',
      title: 'Monitoring SLA Compliance',
      category: 'Support Best Practices',
      excerpt: 'Use dashboards and reports to track SLA compliance and identify breach patterns.',
      slug: 'monitoring-sla-compliance',
      url: '/article/monitoring-sla-compliance',
    },
    {
      id: 'sr-9',
      title: 'SLA Breach Notifications',
      category: 'JSM',
      excerpt: 'Set up alerts and automation rules to notify agents when SLAs are at risk.',
      slug: 'sla-breach-notifications',
      url: '/article/sla-breach-notifications',
    },
  ],
  automation: [
    {
      id: 'sr-10',
      title: 'Automation Rules in JSM',
      category: 'JSM',
      excerpt: 'Create powerful automation rules to streamline your service desk workflows.',
      slug: 'automation-rules-jsm',
      url: '/article/automation-rules-jsm',
    },
    {
      id: 'sr-11',
      title: 'Trigger Conditions and Actions',
      category: 'JSM',
      excerpt: 'Understand how to configure trigger conditions, conditions, and actions in Jira Automation.',
      slug: 'trigger-conditions-actions',
      url: '/article/trigger-conditions-actions',
    },
    {
      id: 'sr-12',
      title: 'Auto-assigning Issues with Automation',
      category: 'Support Best Practices',
      excerpt: 'Automatically assign incoming requests to the right team member based on issue type.',
      slug: 'auto-assigning-issues',
      url: '/article/auto-assigning-issues',
    },
  ],
  rateLimit: [
    {
      id: 'sr-429-1',
      title: 'Understanding Atlassian Cloud REST API rate limits',
      category: 'API & Integrations',
      excerpt: 'Learn about rate limiting on Atlassian Cloud REST APIs, common causes of 429 errors, and best practices.',
      slug: 'api-rate-limits',
      url: '/article/api-rate-limits',
    },
    {
      id: 'sr-429-2',
      title: 'Implementing exponential back-off for API calls',
      category: 'Developer Guide',
      excerpt: 'Step-by-step guide to handling 429 responses with retry logic and exponential back-off.',
      slug: 'exponential-backoff-api',
      url: '/article/exponential-backoff-api',
    },
    {
      id: 'sr-429-3',
      title: 'Troubleshooting integration throttling issues',
      category: 'Troubleshooting',
      excerpt: 'Diagnose and resolve issues where third-party integrations hit rate limits on Atlassian products.',
      slug: 'integration-throttling',
      url: '/article/integration-throttling',
    },
    {
      id: 'sr-429-4',
      title: 'Atlassian Forge & Connect app rate limit policies',
      category: 'Platform',
      excerpt: 'Rate limit details for Forge apps, Connect apps, and OAuth 2.0 integrations with Atlassian Cloud.',
      slug: 'forge-connect-rate-limits',
      url: '/article/forge-connect-rate-limits',
    },
  ],
};

export function getSearchResults(query: string): SearchResult[] {
  const q = query.toLowerCase();
  if (q.includes('429') || q.includes('rate limit') || q.includes('too many requests')) return SEARCH_RESULTS.rateLimit;
  if (q.includes('permission')) return SEARCH_RESULTS.permissions;
  if (q.includes('sla') || q.includes('breach')) return SEARCH_RESULTS.sla;
  if (q.includes('automation') || q.includes('rule')) return SEARCH_RESULTS.automation;
  return SEARCH_RESULTS.default;
}
