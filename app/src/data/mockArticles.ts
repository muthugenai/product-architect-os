export interface Article {
  slug: string;
  title: string;
  category: string;
  breadcrumb: string[];
  content: string;
  relatedArticles: { title: string; slug: string }[];
}

export const ARTICLES: Record<string, Article> = {
  'getting-started-support-insights-360': {
    slug: 'getting-started-support-insights-360',
    title: 'Getting Started with Support Insights 360',
    category: 'Getting Started',
    breadcrumb: ['Documentation', 'Getting Started', 'Support Insights 360'],
    content: `
## Overview
Support Insights 360 is your unified dashboard for monitoring support operations across all Atlassian products. It provides real-time KPIs, AI-generated summaries, and actionable insights to help your team maintain SLA compliance and reduce ticket volume.

## Key Features
- **Real-time KPI cards** — Tickets Deflected, Avg Resolution Time, Open Tickets, SLA Breach Risk
- **AI-generated Today's Summary** — Rovo analyses your data and surfaces the most important insights each morning
- **Trend charts** — Resolution time trends with 30-day baseline comparisons
- **Cost Avoidance Tracking** — Measure the dollar value of AI-powered ticket deflection
- **Proactive Insight Alerts** — Left sidebar alerts for high-priority situations requiring attention

## Navigation
Use the left sidebar to navigate between Dashboard, Insights, and individual insight detail pages. The header omni-box is always available for search, in-page help, or contacting support.

## Getting Help
Click the "Ask Rovo" bar at the top of any page to search help content, ask Rovo AI, or contact support.
    `,
    relatedArticles: [
      { title: 'Configuring Data Sources', slug: 'configuring-data-sources' },
      { title: 'Monitoring SLA Compliance', slug: 'monitoring-sla-compliance' },
    ],
  },
  'jira-permission-schemes': {
    slug: 'jira-permission-schemes',
    title: 'What are permission schemes in Jira?',
    category: 'Jira Administration',
    breadcrumb: ['Documentation', 'Jira Administration', 'Permission Schemes'],
    content: `
## What is a Permission Scheme?
A permission scheme is a collection of permissions that can be applied to multiple Jira projects. They control what users can do within a project — such as creating, editing, transitioning, or managing issues.

## Types of Permissions
- **Project permissions** — Control access within a specific project (e.g., Create Issues, Edit Issues, Manage Sprints)
- **Issue security levels** — Control which users can see specific issues
- **Global permissions** — Apply across all of Jira (e.g., Administer Jira, Create Shared Objects)

## How to Configure
1. Go to **Jira Settings > Issues > Permission Schemes**
2. Click **Add permission scheme** or select an existing one
3. Click **Permissions** next to the scheme name
4. For each permission, click **Edit** and choose who can perform the action (groups, project roles, individual users, or reporters)
5. Apply the scheme to a project via **Project Settings > Permissions**

## Best Practices
- Use **project roles** instead of specific groups for flexibility
- Create a baseline scheme for most projects, then customise per project only when needed
- Regularly audit permission schemes to ensure principle of least privilege
    `,
    relatedArticles: [
      { title: 'Project Roles vs Permission Schemes', slug: 'project-roles-vs-permission-schemes' },
      { title: 'Setting Up Issue Security Levels', slug: 'issue-security-levels' },
    ],
  },
  'support-best-practices': {
    slug: 'support-best-practices',
    title: 'Support Best Practices',
    category: 'Best Practices',
    breadcrumb: ['Documentation', 'Best Practices', 'Support Operations'],
    content: `
## Overview
This guide covers proven best practices for running an efficient, high-quality support operation using Atlassian tools and AI-powered workflows.

## Ticket Management
- **Triage immediately** — Assign priority and category within 15 minutes of ticket creation to meet SLA start conditions
- **Use smart forms** — Configure JSM request types with required fields to capture all context upfront, reducing back-and-forth
- **Leverage AI deflection** — Enable Rovo AI answers on your help portal to resolve common questions before they become tickets
- **Link related tickets** — Use Jira's linked issues feature to group duplicates and surface patterns

## SLA Compliance
- Set realistic, tiered goals — P1: 1h, P2: 4h, P3: 8h, P4: 24h
- Configure pause conditions for "Waiting for customer" status to avoid unfair SLA penalties
- Review SLA performance weekly using Support Insights 360 trend charts
- Alert on breach risk at 80% of time elapsed, not at 100%

## Escalation Paths
- Define a clear P1 war-room process with a Slack channel, Zoom bridge, and designated incident commander
- Automate escalation notifications using JSM automation rules
- Always create a post-incident review (PIR) within 48 hours of P1 resolution

## Knowledge Management
- Write a help article for every question asked more than 3 times
- Use Confluence templates for consistency in article structure
- Review and update articles quarterly — mark stale content with a "Needs review" label
- Enable article feedback ratings to identify low-quality content

## Agent Productivity
- Use Rovo's "Ask Rovo" panel to draft responses and summarise ticket history
- Set up quick-reply templates for the top 10 most common questions
- Review the "Tickets Deflected" KPI weekly to measure AI impact
- Hold a 15-minute daily stand-up to surface blocked tickets before SLA breach

## Metrics to Track
- **CSAT** — Target ≥ 4.5 / 5.0
- **First contact resolution (FCR)** — Target ≥ 75%
- **Average handle time** — Benchmark against team average monthly
- **Ticket deflection rate** — Track AI self-service savings in Support Insights 360
    `,
    relatedArticles: [
      { title: 'Getting Started with Support Insights 360', slug: 'getting-started-support-insights-360' },
      { title: 'Configuring SLA Policies in JSM', slug: 'configuring-sla-policies' },
    ],
  },

  'configuring-sla-policies': {
    slug: 'configuring-sla-policies',
    title: 'Configuring SLA Policies in JSM',
    category: 'JSM',
    breadcrumb: ['Documentation', 'Jira Service Management', 'SLA Policies'],
    content: `
## What is an SLA Policy?
An SLA (Service Level Agreement) policy defines time goals for responding to and resolving customer requests. In Jira Service Management, SLA policies track elapsed time based on conditions you define.

## Creating an SLA Policy
1. Navigate to **Project Settings > SLAs**
2. Click **Add SLA**
3. Give the SLA a name (e.g., "Time to first response")
4. Configure the **Start** condition (e.g., "Issue created")
5. Configure **Pause** conditions (e.g., "Waiting for customer")
6. Configure the **Stop** condition (e.g., "Issue resolved")
7. Set **Time goals** for different issue types or priorities

## Example Configuration
| Priority | Goal |
|----------|------|
| P1 (Critical) | 1 hour |
| P2 (High) | 4 hours |
| P3 (Medium) | 8 hours |
| P4 (Low) | 24 hours |

## Monitoring SLAs
View SLA performance on your JSM dashboard or in Support Insights 360 under the SLA Breach Risk metric.
    `,
    relatedArticles: [
      { title: 'SLA Breach Notifications', slug: 'sla-breach-notifications' },
      { title: 'Monitoring SLA Compliance', slug: 'monitoring-sla-compliance' },
    ],
  },
};

export function getArticle(slug: string): Article | null {
  return ARTICLES[slug] ?? null;
}
