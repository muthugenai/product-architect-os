import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { RovoIcon } from '../icons/RovoIcon';
import { ContextChip } from './ContextChip';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import type { UseProactiveAlertsReturn, ProactiveAlert } from '../../hooks/useProactiveAlerts';
import type { RovoMode } from '../../App';
import type { RecentQuestion } from '../../data/mockRecentQuestions';
import { SUGGESTED_PROMPTS } from '../../data/mockRecentQuestions';
import { getAiSummary, getRelevantPrompts, getSuggestedFix } from '../../data/mockAiSummaries';
import { getSearchResults } from '../../data/mockSearchResults';
import { getSupportInsightItemsForPath, SUPPORT_INSIGHT_COLORS } from '../../data/supportAiInsights';
import { LoomRecorder } from '../ticket/LoomRecorder';
import './OmniBoxPopup.css';

type LoomFlowView = 'recording' | 'post-record' | 'get-support';

interface HelpPage {
  id: string;
  slug: string;
  title: string;
  category: string;
  updated: string;
  views: string;
  thumbsUp: number;
  href: string;
}

const ALL_HELP_PAGES: HelpPage[] = [
  { id: 'hp1', slug: 'getting-started-support-insights-360', title: 'Getting Started with Support Insights 360', category: 'Onboarding', updated: 'Feb 14, 2026', views: '12.4K', thumbsUp: 847, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/getting-started/' },
  { id: 'hp2', slug: 'jira-permission-schemes', title: 'What are permission schemes in Jira?', category: 'Admin', updated: 'Jan 22, 2026', views: '5.2K', thumbsUp: 411, href: 'https://support.atlassian.com/jira-software-cloud/docs/what-are-permission-schemes/' },
  { id: 'hp3', slug: 'automation-rules-jsm', title: 'Setting up automation rules in JSM', category: 'Automation', updated: 'Feb 2, 2026', views: '6.7K', thumbsUp: 503, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/use-automation/' },
  { id: 'hp4', slug: 'configuring-sla-policies', title: 'Configuring SLA Policies in JSM', category: 'SLA', updated: 'Jan 30, 2026', views: '8.1K', thumbsUp: 612, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/configure-sla-goals/' },
  { id: 'hp5', slug: 'billing-subscription-management', title: 'Billing and subscription management guide', category: 'Billing', updated: 'Feb 10, 2026', views: '4.3K', thumbsUp: 302, href: 'https://support.atlassian.com/subscriptions-and-licensing/docs/manage-your-bill/' },
  { id: 'hp6', slug: 'onboarding-new-agents', title: 'Onboarding new agents to your service desk', category: 'Onboarding', updated: 'Jan 28, 2026', views: '3.9K', thumbsUp: 274, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/onboard-agents/' },
  { id: 'hp7', slug: 'jsm-confluence-knowledge-base', title: 'Integrating JSM with Confluence for knowledge base', category: 'Integration', updated: 'Feb 1, 2026', views: '3.6K', thumbsUp: 258, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/link-confluence/' },
  { id: 'hp8', slug: 'sla-escalation-rules', title: 'SLA escalation rules and breach notifications', category: 'SLA', updated: 'Feb 5, 2026', views: '4.8K', thumbsUp: 345, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/sla-escalation/' },
  { id: 'hp9', slug: 'admin-global-permissions', title: 'Managing global permissions and site access', category: 'Admin', updated: 'Jan 18, 2026', views: '3.1K', thumbsUp: 198, href: 'https://support.atlassian.com/jira-software-cloud/docs/global-permissions/' },
  { id: 'hp10', slug: 'automation-smart-values', title: 'Using smart values in automation rules', category: 'Automation', updated: 'Feb 8, 2026', views: '5.5K', thumbsUp: 410, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/smart-values/' },
  { id: 'hp11', slug: 'billing-invoices-receipts', title: 'How to download invoices and receipts', category: 'Billing', updated: 'Jan 15, 2026', views: '2.9K', thumbsUp: 186, href: 'https://support.atlassian.com/subscriptions-and-licensing/docs/invoices/' },
  { id: 'hp12', slug: 'slack-integration-jsm', title: 'Connecting Slack with Jira Service Management', category: 'Integration', updated: 'Feb 12, 2026', views: '6.2K', thumbsUp: 478, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/slack-integration/' },
];

/* JSM-specific help pages for the JSM "Get Started" page */
const JSM_HELP_PAGES: typeof ALL_HELP_PAGES = [
  { id: 'jsm1', slug: 'jsm-get-started', title: 'Getting started with Jira Service Management', category: 'Onboarding', updated: 'Feb 16, 2026', views: '22K', thumbsUp: 1120, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/get-started-with-jira-service-management/' },
  { id: 'jsm2', slug: 'jsm-request-types', title: 'Set up request types for your service project', category: 'Setup', updated: 'Feb 12, 2026', views: '14K', thumbsUp: 780, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-request-types/' },
  { id: 'jsm3', slug: 'jsm-queues', title: 'Using queues to manage requests', category: 'Queues', updated: 'Feb 10, 2026', views: '11K', thumbsUp: 625, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/use-queues/' },
  { id: 'jsm4', slug: 'jsm-customer-channels', title: 'Setting up customer request channels', category: 'Channels', updated: 'Feb 8, 2026', views: '9.4K', thumbsUp: 540, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-request-channels/' },
  { id: 'jsm5', slug: 'jsm-portal-customization', title: 'Customize your customer portal', category: 'Portal', updated: 'Feb 5, 2026', views: '7.8K', thumbsUp: 410, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/customize-your-customer-portal/' },
  { id: 'jsm6', slug: 'jsm-automation-rules', title: 'Automate your service project workflows', category: 'Automation', updated: 'Feb 3, 2026', views: '8.6K', thumbsUp: 490, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-automation/' },
  { id: 'jsm7', slug: 'jsm-incidents', title: 'Managing incidents in Jira Service Management', category: 'Incidents', updated: 'Feb 1, 2026', views: '6.2K', thumbsUp: 355, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/manage-incidents/' },
  { id: 'jsm8', slug: 'jsm-sla-setup', title: 'Set up SLA goals for your service project', category: 'SLA', updated: 'Jan 28, 2026', views: '10K', thumbsUp: 580, href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-sla-goals/' },
];

/* Confluence-specific help pages for popup and Rovo sidebar when on Confluence */
const CONFLUENCE_HELP_PAGES: typeof ALL_HELP_PAGES = [
  { id: 'cf1', slug: 'confluence-getting-started', title: 'Getting started with Confluence', category: 'Confluence', updated: 'Feb 14, 2026', views: '18K', thumbsUp: 920, href: 'https://support.atlassian.com/confluence-cloud/docs/getting-started-with-confluence/' },
  { id: 'cf2', slug: 'confluence-create-edit', title: 'Creating and editing pages', category: 'Confluence', updated: 'Feb 10, 2026', views: '12K', thumbsUp: 654, href: 'https://support.atlassian.com/confluence-cloud/docs/create-and-edit-pages/' },
  { id: 'cf3', slug: 'confluence-macros', title: 'Using macros in Confluence', category: 'Confluence', updated: 'Feb 8, 2026', views: '9.1K', thumbsUp: 512, href: 'https://support.atlassian.com/confluence-cloud/docs/insert-macros/' },
  { id: 'cf4', slug: 'confluence-jira-integration', title: 'Linking Confluence and Jira', category: 'Integrations', updated: 'Feb 5, 2026', views: '7.8K', thumbsUp: 445, href: 'https://support.atlassian.com/confluence-cloud/docs/link-to-jira/' },
  { id: 'cf5', slug: 'confluence-templates', title: 'Page templates and blueprints', category: 'Confluence', updated: 'Jan 28, 2026', views: '5.2K', thumbsUp: 298, href: 'https://support.atlassian.com/confluence-cloud/docs/use-page-templates/' },
];

/* Jira Spaces–related help pages when on /spaces (not Support Insights 360) */
const SPACES_HELP_PAGES: typeof ALL_HELP_PAGES = [
  { id: 'sp1', slug: 'jira-spaces-get-started', title: 'Getting started with Jira Spaces', category: 'Spaces', updated: 'Feb 14, 2026', views: '16K', thumbsUp: 890, href: 'https://support.atlassian.com/jira-software-cloud/docs/get-started-with-jira/' },
  { id: 'sp2', slug: 'jira-permission-schemes', title: 'What are permission schemes in Jira?', category: 'Admin', updated: 'Jan 22, 2026', views: '5.2K', thumbsUp: 411, href: 'https://support.atlassian.com/jira-software-cloud/docs/what-are-permission-schemes/' },
  { id: 'sp3', slug: 'jira-create-project', title: 'Create a project in Jira', category: 'Projects', updated: 'Feb 10, 2026', views: '11K', thumbsUp: 620, href: 'https://support.atlassian.com/jira-software-cloud/docs/create-a-project/' },
  { id: 'sp4', slug: 'jira-boards', title: 'Use boards in Jira', category: 'Boards', updated: 'Feb 8, 2026', views: '9.4K', thumbsUp: 540, href: 'https://support.atlassian.com/jira-software-cloud/docs/use-boards/' },
  { id: 'sp5', slug: 'jira-indexing', title: 'Understanding search and indexing in Jira', category: 'Admin', updated: 'Feb 5, 2026', views: '4.2K', thumbsUp: 280, href: 'https://support.atlassian.com/jira-cloud-administration/docs/manage-reindexing/' },
  { id: 'sp6', slug: 'admin-global-permissions', title: 'Managing global permissions and site access', category: 'Admin', updated: 'Jan 18, 2026', views: '3.1K', thumbsUp: 198, href: 'https://support.atlassian.com/jira-software-cloud/docs/global-permissions/' },
];

export type PopupVariant = 'optionA' | 'optionB';

export interface OmniBoxPopupProps {
  omniBox: OmniBoxContext;
  recentQuestions: RecentQuestion[];
  onQuerySubmit: (q: string) => void;
  proactiveAlerts?: UseProactiveAlertsReturn;
  /** When true, render inline (no fixed overlay) */
  inline?: boolean;
  /** When true, do not render the header (title + close X) */
  hideHeader?: boolean;
  /** optionB = no header, context URL below text field, Rovo in field, aligned position */
  variant?: PopupVariant;
  /** Rovo mode (reactive / proactive / predictive / god) — used e.g. for Option B JSM proactive error CTA */
  rovoMode?: RovoMode;
  /** Ref to header bar element — when set, popover position is locked to it (scroll/resize) */
  barAnchorRef?: React.RefObject<HTMLDivElement>;
}

interface ContextHelpPages {
  contextLabel: string;
  pages: typeof ALL_HELP_PAGES;
  otherPages: typeof ALL_HELP_PAGES;
}

function getContextHelpPages(pathname: string): ContextHelpPages {
  const slugsFor = (slugs: string[]) =>
    slugs.map(s => ALL_HELP_PAGES.find(p => p.slug === s)).filter(Boolean) as typeof ALL_HELP_PAGES;

  if (/\/insight\/i1\b/.test(pathname)) {
    const relevant = slugsFor([
      'automation-rules-jsm',
      'getting-started-support-insights-360',
      'configuring-sla-policies',
    ]);
    return {
      contextLabel: 'P1/P2 Tickets Surge',
      pages: relevant,
      otherPages: ALL_HELP_PAGES.filter(p => !relevant.some(r => r.slug === p.slug)),
    };
  }

  if (/\/insight\/i2\b/.test(pathname)) {
    const relevant = slugsFor([
      'jira-permission-schemes',
      'sla-escalation-rules',
      'configuring-sla-policies',
    ]);
    return {
      contextLabel: 'Resolution Time Spike',
      pages: relevant,
      otherPages: ALL_HELP_PAGES.filter(p => !relevant.some(r => r.slug === p.slug)),
    };
  }

  if (/\/insight\/i3\b/.test(pathname)) {
    const relevant = slugsFor([
      'configuring-sla-policies',
      'sla-escalation-rules',
      'getting-started-support-insights-360',
    ]);
    return {
      contextLabel: 'SLA Breach Risk – Chat',
      pages: relevant,
      otherPages: ALL_HELP_PAGES.filter(p => !relevant.some(r => r.slug === p.slug)),
    };
  }

  if (pathname.startsWith('/confluence')) {
    return {
      contextLabel: 'Confluence Home',
      pages: CONFLUENCE_HELP_PAGES,
      otherPages: [],
    };
  }

  if (pathname === '/' || pathname.startsWith('/jsm')) {
    return {
      contextLabel: 'Jira Service Management',
      pages: JSM_HELP_PAGES,
      otherPages: [],
    };
  }

  if (pathname === '/spaces' || pathname.startsWith('/spaces')) {
    return {
      contextLabel: 'Jira Spaces',
      pages: SPACES_HELP_PAGES,
      otherPages: [],
    };
  }

  if (pathname === '/insights' || pathname.startsWith('/insight/')) {
    return {
      contextLabel: 'Support Insights 360',
      pages: ALL_HELP_PAGES,
      otherPages: [],
    };
  }

  return {
    contextLabel: 'Support Insights 360',
    pages: ALL_HELP_PAGES,
    otherPages: [],
  };
}

/* ── Context-aware "Try Asking" prompts ─────────────────────────── */
interface ContextPrompts {
  pageLabel: string;
  prompts: string[];
}

function getContextPrompts(pathname: string): ContextPrompts {
  /* Insight: P1/P2 Tickets Surge */
  if (/\/insight\/i1\b/.test(pathname)) return {
    pageLabel: 'P1/P2 Tickets Surge',
    prompts: [
      'Why did the EMEA billing queue spike by 93%?',
      'What actions can reduce the billing ticket volume?',
      'Compare this surge with last month\'s baseline',
      'Which agents are handling the most billing tickets?',
      'Show ticket volume breakdown by sub-category',
    ],
  };
  /* Insight: Resolution Time Spike */
  if (/\/insight\/i2\b/.test(pathname)) return {
    pageLabel: 'Resolution Time Spike',
    prompts: [
      'What is causing the resolution time spike in NA Admin?',
      'How can I reduce average resolution time below 40 min?',
      'Which ticket types are taking the longest to resolve?',
      'Show resolution time trend for the last 7 days',
      'Compare NA Admin resolution time to other queues',
    ],
  };
  /* Insight: SLA Breach Risk – Chat */
  if (/\/insight\/i3\b/.test(pathname)) return {
    pageLabel: 'SLA Breach Risk – Chat',
    prompts: [
      'Which NA Chat tickets are closest to breaching SLA?',
      'How do I fix the routing rule causing SLA risk?',
      'Suggest a re-prioritisation plan for at-risk tickets',
      'What is the current SLA compliance rate for Chat?',
      'Show me the top 5 at-risk tickets right now',
    ],
  };
  /* Confluence */
  if (pathname.startsWith('/confluence')) {
    return {
      pageLabel: 'Confluence Home',
      prompts: [
        'How do I create a new page in Confluence?',
        'How do I fix content that failed to load on a page?',
        'How do I link a Confluence page to a Jira issue?',
        'What are macros and how do I use them?',
        'How do I use page templates?',
      ],
    };
  }

  /* Jira Service Management (root or /jsm) */
  if (pathname === '/' || pathname.startsWith('/jsm')) {
    return {
      pageLabel: 'Jira Service Management',
      prompts: [
        'SLA breach on 3 open tickets',
        'How do I resolve SLA breaches quickly?',
        'Which tickets are at risk of breaching SLA?',
      ],
    };
  }

  /* Dashboard / default */
  return {
    pageLabel: 'Support Insights 360',
    prompts: [
      "What's the current P1/P2 ticket trend?",
      'Show SLA breach risk across all queues',
      'Summarize support health across all regions',
      'How many tickets were deflected this week?',
      'What is the average resolution time today?',
    ],
  };
}

type PopupView = 'home' | 'cases';

const CASES = [
  { id: 'JSM-5801', subject: 'EMEA Billing queue spike investigation',        status: 'open',        priority: 'P1', updated: '2h ago' },
  { id: 'JSM-5789', subject: 'SLA breach notifications not firing',            status: 'in_progress', priority: 'P2', updated: '5h ago' },
  { id: 'JSM-5765', subject: 'Permission scheme not propagating to sub-projects', status: 'resolved', priority: 'P3', updated: '1d ago' },
  { id: 'JSM-5741', subject: 'Automation rule fails on subtask create',        status: 'resolved',    priority: 'P3', updated: '2d ago' },
];

/* ── Mock community answers (per-app) ──────────────────────────── */
type CommunityAnswer = { id: string; title: string; author: string; solved: boolean; replies: number; href: string };

const JSM_COMMUNITY_ANSWERS: CommunityAnswer[] = [
  { id: 'jc1', title: 'How to set up request types for a new service project', author: 'Alex R.', solved: true, replies: 18, href: 'https://community.atlassian.com/t5/Jira-Service-Management/request-types-setup/qaq-p/2001' },
  { id: 'jc2', title: 'Best practices for customer portal customization', author: 'Nina P.', solved: true, replies: 12, href: 'https://community.atlassian.com/t5/Jira-Service-Management/portal-customization/qaq-p/2002' },
  { id: 'jc3', title: 'Automation rule not firing on subtask creation', author: 'James L.', solved: false, replies: 6, href: 'https://community.atlassian.com/t5/Jira-Service-Management/automation-subtask/qaq-p/2003' },
  { id: 'jc4', title: 'How to connect Slack and Teams as request channels', author: 'David M.', solved: true, replies: 9, href: 'https://community.atlassian.com/t5/Jira-Service-Management/chat-channels/qaq-p/2004' },
];

const INSIGHTS_COMMUNITY_ANSWERS: CommunityAnswer[] = [
  { id: 'ca1', title: 'How to auto-escalate tickets based on priority in JSM', author: 'Sarah K.', solved: true, replies: 14, href: 'https://community.atlassian.com/t5/Jira-Service-Management/auto-escalate-tickets/qaq-p/1234' },
  { id: 'ca2', title: 'Best practice for setting up SLA breach alerts', author: 'Marcus T.', solved: true, replies: 9, href: 'https://community.atlassian.com/t5/Jira-Service-Management/sla-breach-alerts/qaq-p/1235' },
  { id: 'ca3', title: 'Automation rule not firing on subtask creation', author: 'James L.', solved: false, replies: 6, href: 'https://community.atlassian.com/t5/Jira-Service-Management/automation-subtask/qaq-p/1236' },
  { id: 'ca4', title: 'How to bulk reassign tickets across queues?', author: 'Priya M.', solved: true, replies: 11, href: 'https://community.atlassian.com/t5/Jira-Service-Management/bulk-reassign/qaq-p/1237' },
];

const CONFLUENCE_COMMUNITY_ANSWERS: CommunityAnswer[] = [
  { id: 'cc1', title: 'How to fix macros that fail to render in Confluence', author: 'Lisa T.', solved: true, replies: 22, href: 'https://community.atlassian.com/t5/Confluence/fix-macros/qaq-p/3001' },
  { id: 'cc2', title: 'Best practices for organizing Confluence spaces', author: 'Tom H.', solved: true, replies: 15, href: 'https://community.atlassian.com/t5/Confluence/organize-spaces/qaq-p/3002' },
  { id: 'cc3', title: 'How to use page templates effectively', author: 'Ravi K.', solved: true, replies: 8, href: 'https://community.atlassian.com/t5/Confluence/page-templates/qaq-p/3003' },
  { id: 'cc4', title: 'Linking Confluence pages to Jira issues — tips', author: 'Amy S.', solved: false, replies: 5, href: 'https://community.atlassian.com/t5/Confluence/jira-link-tips/qaq-p/3004' },
];

function getContextCommunity(pathname: string): CommunityAnswer[] {
  if (pathname.startsWith('/confluence')) return CONFLUENCE_COMMUNITY_ANSWERS;
  if (pathname === '/' || pathname.startsWith('/jsm')) return JSM_COMMUNITY_ANSWERS;
  return INSIGHTS_COMMUNITY_ANSWERS;
}

/* ── Mock video results (per-app) ──────────────────────────────── */
type VideoResult = { id: string; title: string; duration: string; channel: string; views: string; thumb: string; href: string };

const JSM_VIDEO_RESULTS: VideoResult[] = [
  { id: 'jv1', title: 'Getting started with Jira Service Management', duration: '4:32', channel: 'Atlassian', views: '24K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=jsm1' },
  { id: 'jv2', title: 'Setting up request types and the customer portal', duration: '6:18', channel: 'Atlassian', views: '15K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=jsm2' },
  { id: 'jv3', title: 'How to use queues and boards in JSM', duration: '8:45', channel: 'Atlassian University', views: '10K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=jsm3' },
  { id: 'jv4', title: 'Incident management in Jira Service Management', duration: '11:20', channel: 'Atlassian', views: '8.5K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=jsm4' },
];

const INSIGHTS_VIDEO_RESULTS: VideoResult[] = [
  { id: 'v1', title: 'Support Insights 360 — dashboard overview', duration: '4:32', channel: 'Atlassian', views: '24K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=example1' },
  { id: 'v2', title: 'How to configure SLA policies in JSM', duration: '7:15', channel: 'Atlassian', views: '18K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=example2' },
  { id: 'v3', title: 'Automation rules deep dive – Jira Service Management', duration: '12:04', channel: 'Atlassian University', views: '9.2K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=example3' },
  { id: 'v4', title: 'Queue management and routing best practices', duration: '6:48', channel: 'Atlassian', views: '11K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=example4' },
];

const CONFLUENCE_VIDEO_RESULTS: VideoResult[] = [
  { id: 'cv1', title: 'Getting started with Confluence Cloud', duration: '5:10', channel: 'Atlassian', views: '32K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=conf1' },
  { id: 'cv2', title: 'Creating and organizing pages in Confluence', duration: '6:40', channel: 'Atlassian', views: '19K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=conf2' },
  { id: 'cv3', title: 'Using macros to build dynamic Confluence pages', duration: '9:55', channel: 'Atlassian University', views: '12K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=conf3' },
  { id: 'cv4', title: 'Confluence + Jira integration tips', duration: '7:22', channel: 'Atlassian', views: '8.1K', thumb: '🎬', href: 'https://www.youtube.com/watch?v=conf4' },
];

function getContextVideos(pathname: string): VideoResult[] {
  if (pathname.startsWith('/confluence')) return CONFLUENCE_VIDEO_RESULTS;
  if (pathname === '/' || pathname.startsWith('/jsm')) return JSM_VIDEO_RESULTS;
  return INSIGHTS_VIDEO_RESULTS;
}

const POPOVER_GAP_PX = 1;

/* Jira Spaces reactive / proactive */
const SPACES_REACTIVE_ERROR = {
  title: 'Space indexing failure on 4 projects',
  message: 'Projects LWPFH, ADOSP, VESPERS, and DMST failed to index during the last sync. Space search results may be incomplete or stale until re-indexing completes.',
};
const SPACES_RECOMMENDED_ACTION = {
  title: 'Recommended action',
  body: 'Trigger a manual re-index for the affected projects from Admin > Indexing. If the issue persists, check the Jira system log for heap memory errors and consider increasing the indexing thread pool size.',
};

/* JSM proactive error (Option B: show in popup instead of Try asking when rovoMode === 'proactive') */
const JSM_PROACTIVE_ERROR = {
  title: 'SLA breach on 3 open tickets',
  message: 'Tickets SEC-001, IT-003, and IT-001 have exceeded their "Time to first response" SLA. Customers have been waiting longer than the agreed response window and no agent has replied yet.',
};
const JSM_RECOMMENDED_ACTION = {
  title: 'Recommended action',
  body: 'Assign an available agent to the breached tickets immediately and send an acknowledgement to the affected customers. Review queue workload to prevent further SLA violations.',
};

/* JSM predictive: warning + recommended action in one container below context URL */
const JSM_PREDICTIVE_WARNING = {
  title: 'SLA breach risk detected',
  message: 'Tickets VPN-003 and TECH-001 are projected to breach their "Time to resolution" SLA within the next 2 hours based on current agent capacity.',
};
const JSM_PREDICTIVE_RECOMMENDED = {
  title: 'Recommended action',
  body: 'Reassign the at-risk tickets to available agents or add capacity to prevent the projected SLA breach. You can also escalate or adjust SLA targets if needed.',
};

/* Confluence: error + recommended (same pattern as JSM / Spaces below context URL) */
const CONFLUENCE_PAGE_ERROR = {
  title: 'Macro failed to render',
  message: 'The "Status" macro could not be displayed. This can happen when the macro has been removed, the app is unavailable, or the macro has invalid configuration.',
};
const CONFLUENCE_RECOMMENDED_ACTION = {
  title: 'Recommended action',
  body: 'Reinstall or update the Status macro from the Marketplace, or replace it with a supported macro. Check space permissions if the macro is app-based. You can also remove the macro placeholder and save the page to restore rendering.',
};

/* Unified config: error + recommended + category + applyQuery for Option B below-context-URL block */
type PageContextKey = 'jsm' | 'spaces' | 'confluence';
const PAGE_CONTEXT_CONFIG: Record<PageContextKey, { error: { title: string; message: string }; recommended: { title: string; body: string }; category: string; applyQuery: string }> = {
  jsm: {
    error: JSM_PROACTIVE_ERROR,
    recommended: JSM_RECOMMENDED_ACTION,
    category: 'JSM · SLA Breach',
    applyQuery: 'Auto-assign breached tickets and notify customers',
  },
  spaces: {
    error: SPACES_REACTIVE_ERROR,
    recommended: SPACES_RECOMMENDED_ACTION,
    category: 'Jira · Indexing',
    applyQuery: 'Re-index affected projects and resolve sync failures',
  },
  confluence: {
    error: CONFLUENCE_PAGE_ERROR,
    recommended: CONFLUENCE_RECOMMENDED_ACTION,
    category: 'Confluence · Error',
    applyQuery: 'Apply the recommended fix for the failed Status macro',
  },
};

export const OmniBoxPopup: React.FC<OmniBoxPopupProps> = ({
  omniBox, recentQuestions, onQuerySubmit, proactiveAlerts, inline = false, hideHeader = false, variant = 'optionA', rovoMode = 'reactive', barAnchorRef,
}) => {
  const isOptionB = variant === 'optionB';
  const noHeader = hideHeader || isOptionB;
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const location     = useLocation();
  /* detect insight page: /insight/:id */
  const insightMatch = location.pathname.match(/^\/insight\/([^/]+)/);
  const insightId    = insightMatch ? insightMatch[1] : null;
  /* context-aware Try Asking prompts */
  const ctxPrompts   = getContextPrompts(location.pathname);
  /* context-aware Help Pages */
  const ctxHelp      = getContextHelpPages(location.pathname);
  /* context-aware Community & Videos */
  const ctxCommunity = getContextCommunity(location.pathname);
  const ctxVideos    = getContextVideos(location.pathname);

  /* Help Agent dropdown */
  const [helpAgentOpen, setHelpAgentOpen] = useState(false);
  const helpAgentRef = useRef<HTMLDivElement>(null);

  /* Support Agent dropdown */
  const [supportOpen, setSupportOpen] = useState(false);
  const supportRef = useRef<HTMLDivElement>(null);

  /* Loom dropdown */
  const [loomOpen, setLoomOpen] = useState(false);
  const loomRef = useRef<HTMLDivElement>(null);

  /* Tab-area Help & Support dropdowns */
  const [tabHelpOpen, setTabHelpOpen] = useState(false);
  const tabHelpRef = useRef<HTMLDivElement>(null);
  const [tabSupportOpen, setTabSupportOpen] = useState(false);
  const tabSupportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (helpAgentRef.current && !helpAgentRef.current.contains(e.target as Node)) setHelpAgentOpen(false);
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) setSupportOpen(false);
      if (loomRef.current && !loomRef.current.contains(e.target as Node)) setLoomOpen(false);
      if (tabHelpRef.current && !tabHelpRef.current.contains(e.target as Node)) setTabHelpOpen(false);
      if (tabSupportRef.current && !tabSupportRef.current.contains(e.target as Node)) setTabSupportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [voiceActive, setVoiceActive] = useState(false);

  // Handle pending actions from header bar icon clicks
  useEffect(() => {
    if (omniBox.pendingAction === 'loom') {
      setLoomOpen(true);
      setHelpAgentOpen(false);
      setSupportOpen(false);
      setVoiceActive(false);
      omniBox.clearPendingAction();
    } else if (omniBox.pendingAction === 'voice') {
      setVoiceActive(true);
      setLoomOpen(false);
      setHelpAgentOpen(false);
      setSupportOpen(false);
      omniBox.clearPendingAction();
    } else if (omniBox.pendingAction === 'insights') {
      setMainTab('help');
      setHelpSubTab('support');
      setLoomOpen(false);
      setHelpAgentOpen(false);
      setSupportOpen(false);
      setVoiceActive(false);
      omniBox.clearPendingAction();
    }
  }, [omniBox.pendingAction]);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const popupBodyRef = useRef<HTMLDivElement>(null);
  const scrollToTop  = () => popupBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const [localQuery, setLocalQuery] = useState(omniBox.query);
  const [liveQuery, setLiveQuery] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [contextActive, setContextActive] = useState(true);
  const [view, setView] = useState<PopupView>('home');
  const [mainTab, setMainTab] = useState<'help' | 'ai'>('help');
  const [helpSubTab, setHelpSubTab] = useState<'helpPages' | 'tryAsking' | 'recent' | 'support'>('helpPages');
  const [aiSubTab, setAiSubTab] = useState<'summary' | 'help' | 'community' | 'videos'>('summary');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  /* Record your issue sub-menu (Help tab): open dropdown, item selected → start recording → Recording ready page */
  const [recordSubMenuOpen, setRecordSubMenuOpen] = useState(false);
  const recordSubMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (recordSubMenuRef.current && !recordSubMenuRef.current.contains(e.target as Node)) setRecordSubMenuOpen(false);
    };
    if (recordSubMenuOpen) {
      document.addEventListener('mousedown', handler, true);
      return () => document.removeEventListener('mousedown', handler, true);
    }
  }, [recordSubMenuOpen]);

  /* Loom Get Support flow: recording → post-record choice → get-support (AI summary + Ask follow-up) */
  const [loomFlowView, setLoomFlowView] = useState<LoomFlowView | null>(null);
  const [pendingLoomRecording, setPendingLoomRecording] = useState<{ sharedUrl: string; thumbnailUrl: string } | null>(null);
  type LoomFollowUpPhase = 'loading' | 'actions-revealed';
  const [loomFollowUpPhase, setLoomFollowUpPhase] = useState<LoomFollowUpPhase | null>(null);

  useEffect(() => {
    if (loomFollowUpPhase === 'loading') {
      const t = setTimeout(() => setLoomFollowUpPhase('actions-revealed'), 1200);
      return () => clearTimeout(t);
    }
  }, [loomFollowUpPhase]);

  /* Follow-up flow from AI Mode: response → loading → reveal agent/ticket links → ticket form → success */
  type FollowUpPhase = 'response-loading' | 'actions-revealed' | 'live-agent' | 'ticket-form' | 'ticket-loom-recording' | 'ticket-loom-done' | 'ticket-success';
  const [followUpPhase, setFollowUpPhase] = useState<FollowUpPhase | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [ticketLoomUrl, setTicketLoomUrl] = useState<string | null>(null);
  const [agentMessages, setAgentMessages] = useState<{ role: 'agent' | 'user'; text: string }[]>([]);
  const [agentInput, setAgentInput] = useState('');
  const agentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (followUpPhase === 'response-loading') {
      const t = setTimeout(() => setFollowUpPhase('actions-revealed'), 10000);
      return () => clearTimeout(t);
    }
  }, [followUpPhase]);

  useEffect(() => {
    agentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages]);

  /* Auto-switch to AI Mode tab when user starts typing; go back when cleared */
  useEffect(() => {
    if (liveQuery) { setMainTab('ai'); setAiSubTab('summary'); }
    else if (mainTab === 'ai' && !submittedQuery) setMainTab('help');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveQuery]);
  const [inputMode, setInputMode] = useState<'search' | 'chat'>('chat');

  /* When initialMainTab is set (e.g. from header Help icon or clear), select that tab */
  useEffect(() => {
    if (omniBox.state !== 'closed' && omniBox.initialMainTab) {
      setMainTab(omniBox.initialMainTab);
      setLiveQuery('');
      setSubmittedQuery(null);
      omniBox.clearInitialMainTab();
    }
  }, [omniBox.state, omniBox.initialMainTab, omniBox]);

  /* Option B: when opened from header "View Tickets", show cases view */
  useEffect(() => {
    if (isOptionB && omniBox.state === 'default' && omniBox.pendingAction === 'cases') {
      setView('cases');
      omniBox.clearPendingAction();
    }
  }, [isOptionB, omniBox.state, omniBox.pendingAction, omniBox]);

  /* Sync popup input with omniBox when popup opens, and keep in sync for Option B (header input) */
  const prevStateRef = useRef(omniBox.state);
  useEffect(() => {
    if (prevStateRef.current === 'closed' && omniBox.state !== 'closed') {
      setLocalQuery(omniBox.query);
    }
    prevStateRef.current = omniBox.state;
  }, [omniBox.state, omniBox.query]);

  useEffect(() => {
    if (isOptionB && omniBox.state !== 'closed') {
      setLocalQuery(omniBox.query);
    }
  }, [isOptionB, omniBox.state, omniBox.query]);

  /* Auto-focus textarea when opened (Option A only — Option B focuses header input) */
  useEffect(() => {
    if (!isOptionB && omniBox.state !== 'closed') {
      const t = setTimeout(() => textareaRef.current?.focus({ preventScroll: false }), 100);
      return () => clearTimeout(t);
    }
  }, [omniBox.state, isOptionB]);

  /* Lock popover to Ask Rovo bar: responsive to bar size/position (scroll, resize, ResizeObserver) */
  useEffect(() => {
    if (inline || !barAnchorRef?.current) {
      setAnchorPosition(null);
      return;
    }
    const el = barAnchorRef.current;
    const updatePosition = () => {
      const anchor = barAnchorRef?.current;
      if (!anchor) {
        setAnchorPosition(null);
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
      const padding = 16;
      const left = Math.max(0, rect.left);
      const maxWidth = viewportW - left - padding;
      const width = Math.min(rect.width, maxWidth);
      setAnchorPosition({
        top: rect.bottom + POPOVER_GAP_PX,
        left,
        width,
      });
    };
    const raf = requestAnimationFrame(() => updatePosition());
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updatePosition())
      : null;
    if (resizeObserver && el) resizeObserver.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (resizeObserver && el) resizeObserver.unobserve(el);
    };
  }, [inline, barAnchorRef, omniBox.state]);

  /* Auto-resize the textarea */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, []);

  useEffect(() => { autoResize(); }, [localQuery, autoResize]);

  /* ── Debounced inline results: show AI summary + results as user types ── */
  /* Option B: activate Explore on first character; Option A: after 3 chars */
  const liveQueryMinLength = isOptionB ? 1 : 3;
  useEffect(() => {
    const q = localQuery.trim();
    if (q.length < liveQueryMinLength) { setLiveQuery(''); setLiveLoading(false); return; }
    setLiveLoading(true);
    const timer = setTimeout(() => {
      setLiveQuery(q);
      setLiveLoading(false);
    }, isOptionB ? 200 : 350);
    return () => clearTimeout(timer);
  }, [localQuery, liveQueryMinLength, isOptionB]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;
    omniBox.submitSearch(localQuery.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!localQuery.trim()) return;
      omniBox.submitSearch(localQuery.trim());
    }
  };

  /* Build article-style context for Try asking / Recently asked so panel shows same rule (title, AI summary, description, open in new tab, relevant prompts) */
  const openPanelWithHelpCard = (title: string, category: string) => {
    const results = getSearchResults(title);
    const first = results[0];
    const href = first
      ? (first.url.startsWith('http') ? first.url : `${window.location.origin}${first.url}`)
      : 'https://support.atlassian.com';
    const articleContext = {
      title,
      category,
      updated: first ? '—' : '',
      views: first ? '—' : '',
      thumbsUp: 0,
      href,
    };
    omniBox.setQuery(title);
    omniBox.setArticleContext(articleContext);
    omniBox.openChatPanel('__article__');
  };

  /* Any tab link that opens in the Rovo sidebar (not new tab) should show: link title, Rovo response, relevant prompts */
  const openInRovoSidebar = (opts: { title: string; category: string; href: string; updated?: string; views?: string; thumbsUp?: number; description?: string }) => {
    const { title, category, href, updated = '', views = '', thumbsUp = 0, description } = opts;
    omniBox.setQuery(title);
    omniBox.setArticleContext({ title, category, updated, views, thumbsUp, href, description });
    omniBox.openChatPanel('__article__');
  };

  const handlePromptClick = (prompt: string) => {
    openPanelWithHelpCard(prompt, 'Try asking');
  };

  const handleRecentClick = (text: string) => {
    openPanelWithHelpCard(text, 'Recently asked');
  };

  /* Support Agent Insights: items from shared data (dashboard or Confluence context) */
  const insightItemsForContext = getSupportInsightItemsForPath(location.pathname);

  /* Back arrow SVG */
  const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5"/>
    </svg>
  );

  const popoverLockStyle = !inline && anchorPosition ? {
    position: 'fixed' as const,
    top: anchorPosition.top,
    left: anchorPosition.left,
    width: anchorPosition.width,
    maxWidth: anchorPosition.width,
  } : undefined;

  return (
    <div
      className={`omnibox-popup${inline ? ' omnibox-popup--inline' : ''}${noHeader ? ' omnibox-popup--no-header' : ''}${isOptionB && !inline ? ' omnibox-popup--option-b' : ''}${!isOptionB && !inline ? ' omnibox-popup--option-a' : ''}${omniBox.loomRecordingInProgress ? ' omnibox-popup--recording-collapsed' : ''}`}
      role="dialog"
      aria-label="Ask Rovo for Help"
      aria-modal={!inline}
      ref={popupBodyRef}
      style={popoverLockStyle}
    >

      {/* ── Header — hidden when noHeader (Option B or hideHeader) ──────────────────────── */}
      {!noHeader && (
      <div className="omnibox-popup__header">
        {view === 'cases' ? (
          /* Cases view header: back arrow + title + close */
          <>
            <button
              className="omnibox-popup__back-btn"
              onClick={() => setView('home')}
              aria-label="Back to search"
            >
              <BackIcon />
            </button>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
              <path d="M5 6h6M5 9h4"/>
            </svg>
            <span className="omnibox-popup__title">Your Support Cases</span>
          </>
        ) : (
          /* Home view header: Rovo icon + title */
          <>
            <RovoIcon size={20} />
            <span className="omnibox-popup__title">Ask Rovo for Help</span>
          </>
        )}
        <button className="omnibox-popup__close-btn" onClick={omniBox.close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      )}

      {/* ════════════════════════════════════════════════════════
          CASES VIEW — support cases table inside the same popup
          ════════════════════════════════════════════════════════ */}
      {view === 'cases' && (
        <>
          {/* Back link when no header (Option B); Option A has back in header */}
          {noHeader && (
            <div className="omnibox-popup__cases-back-wrap">
              <button type="button" className="omnibox-popup__cases-back-link" onClick={() => setView('home')} aria-label="Back to search">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 4L5 8l5 4"/>
                </svg>
                Back
              </button>
            </div>
          )}

          <div className="omnibox-popup__cases-body">
            {/* Toolbar */}
            <div className="omnibox-popup__cases-toolbar">
              <button
                className="omnibox-popup__action-chip omnibox-popup__action-chip--rovo"
                onClick={() => { omniBox.openTicketForm(); }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 2v12M2 8h12"/>
                </svg>
                New Ticket
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="omnibox-popup__cases-filter omnibox-popup__cases-filter--active">All Cases</button>
                <button className="omnibox-popup__cases-filter">Open Only</button>
                <button className="omnibox-popup__cases-filter">Resolved</button>
              </div>
            </div>

            {/* Cases table */}
            <div className="omnibox-popup__cases-table-wrap">
              <table className="omnibox-popup__cases-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {CASES.map(c => (
                    <tr key={c.id} className="omnibox-popup__cases-row">
                      <td className="omnibox-popup__cases-id">{c.id}</td>
                      <td className="omnibox-popup__cases-subject">{c.subject}</td>
                      <td>
                        <span className={`omnibox-popup__cases-badge omnibox-popup__cases-badge--${
                          c.priority === 'P1' ? 'danger' : c.priority === 'P2' ? 'warning' : 'neutral'
                        }`}>{c.priority}</span>
                      </td>
                      <td>
                        <span className={`omnibox-popup__cases-badge omnibox-popup__cases-badge--${
                          c.status === 'open' ? 'info' : c.status === 'in_progress' ? 'warning' : 'success'
                        }`}>
                          {c.status === 'in_progress' ? 'In Progress' : c.status === 'open' ? 'Open' : 'Resolved'}
                        </span>
                      </td>
                      <td className="omnibox-popup__cases-updated">{c.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="omnibox-popup__footer">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M5 6h6M5 9h4"/>
            </svg>
            <a href="#" style={{ color: 'var(--color-link)' }} onClick={e => e.preventDefault()}>
              View all cases in JSM →
            </a>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          HOME VIEW — normal search / prompt interface (or Loom flow)
          ════════════════════════════════════════════════════════ */}
      {view === 'home' && (
        <>
          {/* ── Loom: recording flow OR recording-ready from Help menu (popover brought back) ── */}
          {(loomFlowView || (omniBox.loomRecordingReady && omniBox.loomAttachment)) ? (
            <div className="omnibox-popup__loom-flow">
              <button
                type="button"
                className="omnibox-popup__loom-flow-back"
                onClick={() => {
                  if (loomFlowView) {
                    setLoomFlowView(loomFlowView === 'recording' ? null : loomFlowView === 'get-support' ? 'post-record' : 'recording');
                    if (loomFlowView === 'post-record') setPendingLoomRecording(null);
                    if (loomFlowView === 'get-support') setLoomFollowUpPhase(null);
                  } else {
                    omniBox.clearLoomReady();
                    omniBox.close();
                  }
                }}
                aria-label="Back"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                Back
              </button>

              {loomFlowView === 'recording' && (
                <div className="omnibox-popup__loom-flow-step">
                  <h3 className="omnibox-popup__loom-flow-title">Record screen only</h3>
                  <p className="omnibox-popup__loom-flow-desc">No camera. Your recording will be available to attach when you get support.</p>
                  <LoomRecorder
                    onRecordingStart={() => omniBox.setLoomRecordingInProgress(true)}
                    onRecordingComplete={(url, thumb) => {
                      setPendingLoomRecording({ sharedUrl: url, thumbnailUrl: thumb });
                      omniBox.setLoomRecordingInProgress(false);
                      setLoomFlowView('post-record');
                    }}
                  />
                </div>
              )}

              {((loomFlowView === 'post-record' && pendingLoomRecording) || (omniBox.loomRecordingReady && omniBox.loomAttachment)) && (() => {
                const recording = (loomFlowView === 'post-record' && pendingLoomRecording) ? pendingLoomRecording : omniBox.loomAttachment!;
                const loomSampleQuery = 'Screen recording - I need help with an issue I recorded.';
                const aiSummary = getAiSummary(loomSampleQuery, contextActive);
                const recommendation = getSuggestedFix(loomSampleQuery);
                const loomContextQuery = `Screen recording from ${ctxHelp.contextLabel}. Need help with an issue shown in the recording.`;
                const clearAndClose = () => {
                  setLoomFlowView(null);
                  setPendingLoomRecording(null);
                  omniBox.clearLoomReady();
                  omniBox.close();
                };
                const applyFixAndClose = () => {
                  omniBox.setQuery(loomContextQuery);
                  omniBox.setLoomAttachment({ sharedUrl: recording.sharedUrl, thumbnailUrl: recording.thumbnailUrl || '' });
                  omniBox.setArticleContext({
                    title: 'Fix from recording',
                    category: 'Loom · Apply fix',
                    updated: '',
                    views: '',
                    thumbsUp: 0,
                    href: recording.sharedUrl,
                    description: recommendation,
                    action: 'apply_fix',
                  });
                  omniBox.openChatPanel(loomContextQuery);
                  clearAndClose();
                };
                const askFollowUp = () => {
                  omniBox.setQuery(loomSampleQuery);
                  omniBox.setLoomAttachment({ sharedUrl: recording.sharedUrl, thumbnailUrl: recording.thumbnailUrl || '' });
                  omniBox.openChatPanel('__live_chat__');
                  clearAndClose();
                };
                const getSupport = () => {
                  omniBox.setQuery(loomContextQuery);
                  omniBox.setLoomAttachment({ sharedUrl: recording.sharedUrl, thumbnailUrl: recording.thumbnailUrl || '' });
                  omniBox.openChatPanel('__loom_support__');
                  clearAndClose();
                };
                const shareRecording = () => {
                  navigator.clipboard?.writeText(recording.sharedUrl);
                  clearAndClose();
                };
                return (
                  <div className="omnibox-popup__loom-flow-step">
                    <h3 className="omnibox-popup__loom-flow-title">Loom Recording is ready</h3>

                    <div className="omnibox-popup__loom-flow-summary">
                      <span className="omnibox-popup__loom-flow-summary-label">AI Summary</span>
                      <p className="omnibox-popup__loom-flow-summary-text">{aiSummary.summary}</p>
                    </div>

                    <div className="omnibox-popup__loom-flow-summary">
                      <span className="omnibox-popup__loom-flow-summary-label">Recommendation</span>
                      <p className="omnibox-popup__loom-flow-summary-text">{recommendation}</p>
                    </div>

                    <p className="omnibox-popup__loom-flow-desc omnibox-popup__loom-flow-desc--action">What would you like to do?</p>
                    <div className="omnibox-popup__loom-flow-actions">
                      <button
                        type="button"
                        className="omnibox-popup__loom-flow-btn omnibox-popup__loom-flow-btn--primary"
                        onClick={applyFixAndClose}
                      >
                        <RovoIcon size={14} />
                        Apply recommended fix
                      </button>
                      <button
                        type="button"
                        className="omnibox-popup__live-support-btn omnibox-popup__live-support-btn--followup"
                        onClick={askFollowUp}
                      >
                        <RovoIcon size={13} />
                        Ask a follow up question
                      </button>
                      <label className="omnibox-popup__loom-flow-check-wrap">
                        <input type="checkbox" defaultChecked className="omnibox-popup__loom-flow-check" readOnly />
                        <span className="omnibox-popup__loom-flow-check-label">
                          Loom recording attached —{' '}
                          <a href={recording.sharedUrl} target="_blank" rel="noopener noreferrer" className="omnibox-popup__loom-flow-rec-link">Watch recording</a>
                        </span>
                      </label>
                      <button
                        type="button"
                        className="omnibox-popup__loom-flow-btn"
                        onClick={getSupport}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h14v10H9l-4 4v-4H1V1z"/></svg>
                        Get Support
                      </button>
                      <button
                        type="button"
                        className="omnibox-popup__loom-flow-btn"
                        onClick={shareRecording}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                        Share recording
                      </button>
                    </div>
                  </div>
                );
              })()}

              {loomFlowView === 'get-support' && pendingLoomRecording && (() => {
                const loomContextQuery = `Screen recording from ${ctxHelp.contextLabel}. Need help with an issue shown in the recording.`;
                const aiSummary = getAiSummary(loomContextQuery, contextActive);

                const closeLoomAndPopup = () => {
                  setLoomFlowView(null);
                  setPendingLoomRecording(null);
                  setLoomFollowUpPhase(null);
                  omniBox.close();
                };

                if (!loomFollowUpPhase) {
                  return (
                    <div className="omnibox-popup__loom-flow-step">
                      <h3 className="omnibox-popup__loom-flow-title">We&rsquo;ve got context from your recording</h3>
                      <div className="omnibox-popup__loom-flow-thumb">
                        <a href={pendingLoomRecording.sharedUrl} target="_blank" rel="noopener noreferrer" className="omnibox-popup__loom-flow-thumb-link">
                          <span className="omnibox-popup__loom-flow-thumb-play" aria-hidden>▶</span>
                          <span className="omnibox-popup__loom-flow-thumb-label">Screen recording</span>
                        </a>
                      </div>
                      <div className="omnibox-popup__loom-flow-summary">
                        <span className="omnibox-popup__loom-flow-summary-label">Summary</span>
                        <p className="omnibox-popup__loom-flow-summary-text">{aiSummary.summary}</p>
                      </div>
                      <button
                        type="button"
                        className="omnibox-popup__live-support-btn omnibox-popup__live-support-btn--followup"
                        onClick={() => setLoomFollowUpPhase('loading')}
                      >
                        <RovoIcon size={13} />
                        Ask a Follow Up Question
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="omnibox-popup__loom-flow-step omnibox-popup__followup-flow">
                    <div className="omnibox-popup__followup-issue">
                      <span className="omnibox-popup__followup-issue-label">Your issue</span>
                      <p className="omnibox-popup__followup-issue-text">{loomContextQuery}</p>
                    </div>
                    <div className="omnibox-popup__followup-rovo">
                      <div className="omnibox-popup__followup-rovo-header">
                        <RovoIcon size={14} />
                        <span>Rovo</span>
                      </div>
                      <p className="omnibox-popup__followup-rovo-text">{aiSummary.summary}</p>
                    </div>
                    {loomFollowUpPhase === 'loading' && (
                      <div className="omnibox-popup__followup-loading">
                        <div className="omnibox-popup__followup-spinner" />
                        <span>Finding the best support options…</span>
                      </div>
                    )}
                    {loomFollowUpPhase === 'actions-revealed' && (
                      <div className="omnibox-popup__followup-actions">
                        <p className="omnibox-popup__followup-actions-label">How would you like to proceed?</p>
                        <button
                          type="button"
                          className="omnibox-popup__followup-action-btn omnibox-popup__followup-action-btn--agent"
                          onClick={() => {
                            omniBox.setQuery(loomContextQuery);
                            omniBox.setLoomAttachment({ sharedUrl: pendingLoomRecording.sharedUrl, thumbnailUrl: pendingLoomRecording.thumbnailUrl });
                            omniBox.openLiveChat();
                            closeLoomAndPopup();
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h14v10H9l-4 4v-4H1V1z"/></svg>
                          Live Chat
                        </button>
                        <button
                          type="button"
                          className="omnibox-popup__followup-action-btn omnibox-popup__followup-action-btn--ticket"
                          onClick={() => {
                            omniBox.setQuery(loomContextQuery);
                            omniBox.setLoomAttachment({ sharedUrl: pendingLoomRecording.sharedUrl, thumbnailUrl: pendingLoomRecording.thumbnailUrl });
                            omniBox.openTicketForm();
                            closeLoomAndPopup();
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1H7v6H1v2h6v6h2V9h6V7H9V1z"/></svg>
                          Create a ticket
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
          <>
          {/* Option B: no header; toolbar only in header — Help, Support, Insights, upward arrow. No multiline text field. */}
          {isOptionB ? (
            <div className="omnibox-popup__option-b-content">
              <>
                <ContextChip
                  url={omniBox.contextUrl}
                  dismissed={omniBox.contextDismissed}
                  onDismiss={omniBox.close}
                  onNavigate={omniBox.close}
                  onContextToggle={setContextActive}
                  onInPageHelp={() => { setLocalQuery('In Page Help'); onQuerySubmit('In Page Help'); }}
                />
                {(() => {
                  const pathname = location.pathname;
                  const pageKey: PageContextKey | null =
                    pathname === '/' || pathname.startsWith('/jsm') ? 'jsm'
                    : pathname === '/spaces' ? 'spaces'
                    : pathname.startsWith('/confluence') ? 'confluence'
                    : null;
                  const config = pageKey ? PAGE_CONTEXT_CONFIG[pageKey] : null;
                  if (!config) return null;
                  const { error, recommended, category, applyQuery } = config;
                  if (rovoMode !== 'reactive' && rovoMode !== 'proactive' && !(pageKey === 'jsm' && rovoMode === 'predictive')) return null;
                  if (pageKey === 'jsm' && rovoMode === 'predictive') {
                    return (
                      <div className="omnibox-popup__proactive-jsm" role="alert">
                        <span className="omnibox-popup__proactive-jsm-icon" aria-hidden="true">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                          </svg>
                        </span>
                        <div className="omnibox-popup__proactive-jsm-body">
                          <strong className="omnibox-popup__proactive-jsm-title">{JSM_PREDICTIVE_WARNING.title}</strong>
                          <p className="omnibox-popup__proactive-jsm-message">{JSM_PREDICTIVE_WARNING.message}</p>
                          <strong className="omnibox-popup__proactive-jsm-rec-title">{JSM_PREDICTIVE_RECOMMENDED.title}</strong>
                          <p className="omnibox-popup__proactive-jsm-rec-body">{JSM_PREDICTIVE_RECOMMENDED.body}</p>
                          <button
                            type="button"
                            className="omnibox-popup__proactive-jsm-cta"
                            onClick={() => {
                              omniBox.setQuery('Preempt SLA breach: reassign tickets at risk of missing resolution target');
                              omniBox.setArticleContext({
                                title: JSM_PREDICTIVE_WARNING.title,
                                category: 'JSM · At Risk',
                                updated: '',
                                views: '',
                                thumbsUp: 0,
                                href: '#',
                                action: 'apply_fix',
                              });
                              omniBox.openChatPanel('__article__');
                              omniBox.close();
                            }}
                          >
                            <RovoIcon size={16} />
                            Preempt breach
                          </button>
                          <button
                            type="button"
                            className="omnibox-popup__proactive-jsm-followup"
                            onClick={() => {
                              omniBox.setQuery('How can I prevent this SLA breach risk and resolve the at-risk tickets?');
                              omniBox.setArticleContext({
                                title: JSM_PREDICTIVE_WARNING.title,
                                category: 'JSM · At Risk',
                                updated: '',
                                views: '',
                                thumbsUp: 0,
                                href: '#',
                              });
                              omniBox.openChatPanel('__article__');
                            }}
                          >
                            Ask a follow up question
                          </button>
                        </div>
                      </div>
                    );
                  }
                  if (rovoMode === 'proactive') {
                    return (
                      <div className="omnibox-popup__proactive-jsm" role="alert">
                        <span className="omnibox-popup__proactive-jsm-icon" aria-hidden="true">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                          </svg>
                        </span>
                        <div className="omnibox-popup__proactive-jsm-body">
                          <strong className="omnibox-popup__proactive-jsm-title">{error.title}</strong>
                          <p className="omnibox-popup__proactive-jsm-message">{error.message}</p>
                          <strong className="omnibox-popup__proactive-jsm-rec-title">{recommended.title}</strong>
                          <p className="omnibox-popup__proactive-jsm-rec-body">{recommended.body}</p>
                          <button
                            type="button"
                            className="omnibox-popup__proactive-jsm-cta"
                            onClick={() => {
                              omniBox.setQuery(applyQuery);
                              omniBox.setArticleContext({
                                title: error.title,
                                category,
                                updated: '',
                                views: '',
                                thumbsUp: 0,
                                href: '#',
                                action: 'apply_fix',
                              });
                              omniBox.openChatPanel('__article__');
                              omniBox.close();
                            }}
                          >
                            <RovoIcon size={16} />
                            Apply recommended fix
                          </button>
                          <button
                            type="button"
                            className="omnibox-popup__proactive-jsm-followup"
                            onClick={() => {
                              omniBox.setQuery(`${error.title}: ${error.message}`);
                              omniBox.setArticleContext({
                                title: error.title,
                                category,
                                updated: '',
                                views: '',
                                thumbsUp: 0,
                                href: '#',
                              });
                              omniBox.openChatPanel('__article__');
                              omniBox.close();
                            }}
                          >
                            <RovoIcon size={13} />
                            {error.title}
                          </button>
                          <button
                            type="button"
                            className="omnibox-popup__proactive-jsm-followup"
                            onClick={() => {
                              omniBox.setQuery(`How can I resolve "${error.title}" and prevent it from happening again?`);
                              omniBox.setArticleContext({
                                title: error.title,
                                category,
                                updated: '',
                                views: '',
                                thumbsUp: 0,
                                href: '#',
                              });
                              omniBox.openChatPanel('__article__');
                            }}
                          >
                            Ask a follow up question
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="omnibox-popup__try-asking">
                      <span className="omnibox-popup__try-asking-label">Try asking:</span>
                      <button
                        type="button"
                        className="omnibox-popup__try-asking-prompt"
                        onClick={() => {
                          omniBox.setQuery(`${error.title}: ${error.message}`);
                          omniBox.setArticleContext({ title: error.title, category, updated: '', views: '', thumbsUp: 0, href: '#' });
                          omniBox.openChatPanel('__article__');
                        }}
                      >
                        {error.title}
                      </button>
                    </div>
                  );
                })()}
              </>
            </div>
          ) : hideHeader ? (
            !inline ? (
            <div className="omnibox-popup__mode-tabs omnibox-popup__agent-row">
              {/* Help — first */}
              <div className="omnibox-popup__help-agent-wrap" ref={helpAgentRef}>
                <button
                  type="button"
                  className="omnibox-popup__help-agent-btn"
                  onClick={() => { setHelpAgentOpen(v => !v); setSupportOpen(false); setLoomOpen(false); }}
                  aria-haspopup="true"
                  aria-expanded={helpAgentOpen}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="7"/>
                    <path d="M5.5 6a2.5 2.5 0 015 0c0 1.5-1.5 1.5-2.5 2.5"/>
                    <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                  Help
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d={helpAgentOpen ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {helpAgentOpen && (
                <div className="omnibox-popup__help-agent-menu omnibox-popup__help-agent-menu--open" role="menu">
                  <button type="button" role="menuitem" className="omnibox-popup__help-agent-menu-item" onClick={() => { setHelpAgentOpen(false); omniBox.openChatPanel(insightId ? `__insight_help__:${insightId}` : '__inapp_help__'); }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/></svg>
                    Read Help articles
                  </button>
                  <button type="button" role="menuitem" className="omnibox-popup__help-agent-menu-item" onClick={() => { setHelpAgentOpen(false); omniBox.openChatPanel('__community__'); }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 11-.001 10.001A5 5 0 018 3zm-1 3h2v1H9v3H7V7H6V6h1z"/></svg>
                    Ask Community
                  </button>
                  <button type="button" role="menuitem" className="omnibox-popup__help-agent-menu-item" onClick={() => { setHelpAgentOpen(false); omniBox.openChatPanel('__bugs__'); }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/></svg>
                    View Bugs
                  </button>
                </div>
                )}
              </div>
              {/* Support Agent — after Help */}
              <div className="omnibox-popup__help-agent-wrap" ref={supportRef}>
                <button
                  type="button"
                  className="omnibox-popup__help-agent-btn"
                  onClick={() => { setSupportOpen(v => !v); setHelpAgentOpen(false); setLoomOpen(false); }}
                  aria-haspopup="true"
                  aria-expanded={supportOpen}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M1 9V7a7 7 0 0114 0v2"/>
                    <path d="M1 9a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2V9zM11 9a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2V9z"/>
                    <path d="M15 11v1a2 2 0 01-2 2h-3"/>
                    <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  Support
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d={supportOpen ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {supportOpen && (
                <div className="omnibox-popup__help-agent-menu omnibox-popup__help-agent-menu--open" role="menu">
                  <button type="button" role="menuitem" className="omnibox-popup__help-agent-menu-item omnibox-popup__help-agent-menu-item--loom" onClick={() => { setSupportOpen(false); setLoomFlowView('recording'); }}>
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="omnibox-popup__loom-icon-grey" aria-hidden="true">
                      <circle cx="16" cy="16" r="15" fill="#6B778C"/>
                      <circle cx="16" cy="16" r="6" fill="#97A0AF"/>
                      <circle cx="16" cy="16" r="3" fill="#6B778C"/>
                      <rect x="15" y="1" width="2" height="8" rx="1" fill="#97A0AF"/>
                      <rect x="15" y="23" width="2" height="8" rx="1" fill="#97A0AF"/>
                      <rect x="1" y="15" width="8" height="2" rx="1" fill="#97A0AF"/>
                      <rect x="23" y="15" width="8" height="2" rx="1" fill="#97A0AF"/>
                      <rect x="4.22" y="4.22" width="8" height="2" rx="1" transform="rotate(45 4.22 4.22)" fill="#97A0AF"/>
                      <rect x="19.66" y="19.66" width="8" height="2" rx="1" transform="rotate(45 19.66 19.66)" fill="#97A0AF"/>
                      <rect x="25.78" y="4.22" width="2" height="8" rx="1" transform="rotate(45 25.78 4.22)" fill="#97A0AF"/>
                      <rect x="10.34" y="19.66" width="2" height="8" rx="1" transform="rotate(45 10.34 19.66)" fill="#97A0AF"/>
                    </svg>
                    Record your issue
                  </button>
                  <button type="button" role="menuitem" className="omnibox-popup__help-agent-menu-item" onClick={() => { setSupportOpen(false); omniBox.openChatPanel('__support_ai_insights__'); }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="omnibox-popup__sai-icon-sm"><path d="M1 11V9a9 9 0 0118 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 016 11v2.5A2.5 2.5 0 013.5 16h0A2.5 2.5 0 011 13.5V11zM14 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 0119 11v2.5a2.5 2.5 0 01-2.5 2.5h0A2.5 2.5 0 0114 13.5V11z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 13.5v1.5a2.5 2.5 0 01-2.5 2.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 8.8l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4.4-1z" fill="#6554C0"/><circle cx="11.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><path d="M14.5 2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5L12.4 4.1l1.5-.6z" fill="#6554C0"/><path d="M17 5.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="#6554C0"/></svg>
                    Support Agent Insights
                  </button>
                  <button type="button" role="menuitem" className="omnibox-popup__help-agent-menu-item" onClick={() => { setSupportOpen(false); setView('cases'); }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M5 5.5h6M5 8h6M5 10.5h4"/></svg>
                    View Tickets
                  </button>
                </div>
                )}
              </div>
            </div>
            ) : null
          ) : (
          <>
          {/* ── Search/Chat tab + Context chip + Help Agent ──────── */}
          <div className="omnibox-popup__mode-tabs">
            <div className="omnibox-popup__mode-segment">
              <button
                className={`omnibox-popup__mode-tab${inputMode === 'chat' ? ' omnibox-popup__mode-tab--active' : ''}`}
                onClick={() => setInputMode('chat')}
                type="button"
                title="Chat"
                aria-label="Chat mode"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 1H2a1 1 0 00-1 1v8a1 1 0 001 1h3l3 3 3-3h3a1 1 0 001-1V2a1 1 0 00-1-1z"/>
                </svg>
              </button>
              <button
                className={`omnibox-popup__mode-tab${inputMode === 'search' ? ' omnibox-popup__mode-tab--active' : ''}`}
                onClick={() => setInputMode('search')}
                type="button"
                title="Search"
                aria-label="Search mode"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6.5" cy="6.5" r="5"/>
                  <path d="M10.5 10.5L14 14"/>
                </svg>
              </button>
            </div>

            <ContextChip
              url={omniBox.contextUrl}
              dismissed={omniBox.contextDismissed}
              onDismiss={omniBox.close}
              onNavigate={omniBox.close}
              onContextToggle={setContextActive}
              onInPageHelp={() => {
                const q = 'In Page Help';
                setLocalQuery(q);
                onQuerySubmit(q);
              }}
            />

            {/* Try asking (Option A, JSM only) — below context URL; click activates AI mode tab flow */}
            {(location.pathname === '/' || location.pathname.startsWith('/jsm')) && ctxPrompts.prompts.length > 0 && (
              <div className="omnibox-popup__try-asking">
                <span className="omnibox-popup__try-asking-label">Try asking:</span>
                <button
                  type="button"
                  className="omnibox-popup__try-asking-prompt"
                  onClick={() => { handlePromptClick(ctxPrompts.prompts[0]); }}
                >
                  {ctxPrompts.prompts[0]}
                </button>
              </div>
            )}

          </div>

          {/* ── Prompt-box input ───────────────────────────────── */}
          <div className="omnibox-popup__input-wrap">
            <form onSubmit={handleSubmit} className="omnibox-popup__form">
              <textarea
                ref={textareaRef}
                className="omnibox-popup__textarea"
                placeholder="Ask Rovo anything… describe your issue, search for articles or community posts"
                value={localQuery}
                rows={1}
                onChange={e => { const v = e.target.value; setLocalQuery(v); omniBox.setQuery(v); autoResize(); }}
                onKeyDown={handleKeyDown}
                aria-label="Search or ask Rovo"
                autoComplete="off"
              />

              <div className="omnibox-popup__toolbar">
                <div className="omnibox-popup__toolbar-left">
                  <button type="button" className="omnibox-popup__tool-btn" aria-label="Add">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 2v12M2 8h12"/>
                    </svg>
                  </button>
                  <button type="button" className={`omnibox-popup__tool-btn${voiceActive ? ' omnibox-popup__tool-btn--voice-active' : ''}`} aria-label="Voice input" onClick={() => setVoiceActive(v => !v)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="1" width="6" height="9" rx="3"/>
                      <path d="M3 7a5 5 0 0010 0M8 14v2M5 16h6"/>
                    </svg>
                  </button>
                  <div className="omnibox-popup__help-agent-wrap omnibox-popup__loom-wrap" ref={helpAgentRef}>
                    <button type="button" className="omnibox-popup__tool-btn" aria-label="Help" aria-haspopup="true" aria-expanded={helpAgentOpen} onClick={() => { setHelpAgentOpen(v => !v); setSupportOpen(false); setLoomOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="8" r="7"/>
                        <path d="M5.5 6a2.5 2.5 0 015 0c0 1.5-1.5 1.5-2.5 2.5"/>
                        <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/>
                      </svg>
                    </button>
                    {helpAgentOpen && (
                    <div className="omnibox-popup__loom-menu omnibox-popup__loom-menu--open" role="menu">
                      <button type="button" role="menuitem" className="omnibox-popup__loom-item" onClick={() => { setHelpAgentOpen(false); omniBox.openChatPanel(insightId ? `__insight_help__:${insightId}` : '__inapp_help__'); }}>
                        <span className="omnibox-popup__loom-item-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/></svg></span>
                        <span><strong>Read Help articles</strong></span>
                      </button>
                      <button type="button" role="menuitem" className="omnibox-popup__loom-item" onClick={() => { setHelpAgentOpen(false); omniBox.openChatPanel('__community__'); }}>
                        <span className="omnibox-popup__loom-item-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 11-.001 10.001A5 5 0 018 3zm-1 3h2v1H9v3H7V7H6V6h1z"/></svg></span>
                        <span><strong>Ask Community</strong></span>
                      </button>
                      <button type="button" role="menuitem" className="omnibox-popup__loom-item" onClick={() => { setHelpAgentOpen(false); omniBox.openChatPanel('__bugs__'); }}>
                        <span className="omnibox-popup__loom-item-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/></svg></span>
                        <span><strong>View Bugs</strong></span>
                      </button>
                    </div>
                    )}
                  </div>
                  <div className="omnibox-popup__loom-wrap" ref={loomRef}>
                    <button type="button" className="omnibox-popup__tool-btn omnibox-popup__tool-btn--loom" aria-label="Record with Loom" aria-haspopup="true" aria-expanded={loomOpen} onClick={() => { setLoomOpen(v => !v); setHelpAgentOpen(false); setSupportOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="15" fill="#625DF5"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                        <circle cx="16" cy="16" r="3" fill="#625DF5"/>
                        <rect x="15" y="1" width="2" height="8" rx="1" fill="white"/>
                        <rect x="15" y="23" width="2" height="8" rx="1" fill="white"/>
                        <rect x="1" y="15" width="8" height="2" rx="1" fill="white"/>
                        <rect x="23" y="15" width="8" height="2" rx="1" fill="white"/>
                        <rect x="4.22" y="4.22" width="8" height="2" rx="1" transform="rotate(45 4.22 4.22)" fill="white"/>
                        <rect x="19.66" y="19.66" width="8" height="2" rx="1" transform="rotate(45 19.66 19.66)" fill="white"/>
                        <rect x="25.78" y="4.22" width="2" height="8" rx="1" transform="rotate(45 25.78 4.22)" fill="white"/>
                        <rect x="10.34" y="19.66" width="2" height="8" rx="1" transform="rotate(45 10.34 19.66)" fill="white"/>
                      </svg>
                    </button>
                    {loomOpen && (
                    <div className="omnibox-popup__loom-menu omnibox-popup__loom-menu--open" role="menu">
                      <button type="button" className="omnibox-popup__loom-item" role="menuitem">
                        <span className="omnibox-popup__loom-item-icon">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="1" y="2" width="14" height="10" rx="2"/>
                            <path d="M5 14h6M8 12v2"/>
                            <circle cx="12" cy="5" r="2.5" fill="#625DF5" stroke="#625DF5"/>
                          </svg>
                        </span>
                        <span>
                          <strong>Record a Loom</strong>
                          <em>Screen &amp; camera</em>
                        </span>
                      </button>
                      <button type="button" className="omnibox-popup__loom-item" role="menuitem" onClick={() => { setLoomOpen(false); setLoomFlowView('recording'); }}>
                        <span className="omnibox-popup__loom-item-icon">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="1" y="2" width="14" height="10" rx="2"/>
                            <path d="M5 14h6M8 12v2"/>
                          </svg>
                        </span>
                        <span>
                          <strong>Record screen only</strong>
                          <em>No camera</em>
                        </span>
                      </button>
                      <button type="button" className="omnibox-popup__loom-item" role="menuitem">
                        <span className="omnibox-popup__loom-item-icon">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 4h9v8H1zM10 6l5-2v8l-5-2V6z"/>
                          </svg>
                        </span>
                        <span>
                          <strong>Record camera only</strong>
                          <em>No screen share</em>
                        </span>
                      </button>
                    </div>
                    )}
                  </div>
                  <div className="omnibox-popup__help-agent-wrap omnibox-popup__loom-wrap" ref={supportRef}>
                    <button type="button" className="omnibox-popup__tool-btn" aria-label="Support" aria-haspopup="true" aria-expanded={supportOpen} onClick={() => { setSupportOpen(v => !v); setHelpAgentOpen(false); setLoomOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 9V7a7 7 0 0114 0v2"/>
                        <path d="M1 9a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2V9zM11 9a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2V9z"/>
                        <path d="M15 11v1a2 2 0 01-2 2h-3"/>
                        <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/>
                      </svg>
                    </button>
                    {supportOpen && (
                    <div className="omnibox-popup__loom-menu omnibox-popup__loom-menu--open" role="menu">
                      <button type="button" role="menuitem" className="omnibox-popup__loom-item" onClick={() => { setSupportOpen(false); setLoomFlowView('recording'); }}>
                        <span className="omnibox-popup__loom-item-icon"><svg width="15" height="15" viewBox="0 0 32 32" fill="none" className="omnibox-popup__loom-icon-grey"><circle cx="16" cy="16" r="15" fill="#6B778C"/><circle cx="16" cy="16" r="6" fill="#97A0AF"/><circle cx="16" cy="16" r="3" fill="#6B778C"/><rect x="15" y="1" width="2" height="8" rx="1" fill="#97A0AF"/><rect x="15" y="23" width="2" height="8" rx="1" fill="#97A0AF"/><rect x="1" y="15" width="8" height="2" rx="1" fill="#97A0AF"/><rect x="23" y="15" width="8" height="2" rx="1" fill="#97A0AF"/><rect x="4.22" y="4.22" width="8" height="2" rx="1" transform="rotate(45 4.22 4.22)" fill="#97A0AF"/><rect x="19.66" y="19.66" width="8" height="2" rx="1" transform="rotate(45 19.66 19.66)" fill="#97A0AF"/><rect x="25.78" y="4.22" width="2" height="8" rx="1" transform="rotate(45 25.78 4.22)" fill="#97A0AF"/><rect x="10.34" y="19.66" width="2" height="8" rx="1" transform="rotate(45 10.34 19.66)" fill="#97A0AF"/></svg></span>
                        <span><strong>Record your issue</strong></span>
                      </button>
                      <button type="button" role="menuitem" className="omnibox-popup__loom-item" onClick={() => { setSupportOpen(false); omniBox.openChatPanel('__support_ai_insights__'); }}>
                        <span className="omnibox-popup__loom-item-icon"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="omnibox-popup__sai-icon-sm"><path d="M1 11V9a9 9 0 0118 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 016 11v2.5A2.5 2.5 0 013.5 16h0A2.5 2.5 0 011 13.5V11zM14 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 0119 11v2.5a2.5 2.5 0 01-2.5 2.5h0A2.5 2.5 0 0114 13.5V11z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 13.5v1.5a2.5 2.5 0 01-2.5 2.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 8.8l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4.4-1z" fill="#6554C0"/><circle cx="11.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><path d="M14.5 2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5L12.4 4.1l1.5-.6z" fill="#6554C0"/><path d="M17 5.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="#6554C0"/></svg></span>
                        <span><strong>Support</strong></span>
                      </button>
                      <button type="button" role="menuitem" className="omnibox-popup__loom-item" onClick={() => { setSupportOpen(false); setView('cases'); }}>
                        <span className="omnibox-popup__loom-item-icon"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M5 5.5h6M5 8h6M5 10.5h4"/></svg></span>
                        <span><strong>View Tickets</strong></span>
                      </button>
                    </div>
                    )}
                  </div>
                </div>
                <div className="omnibox-popup__toolbar-right">
                  {/* Option B: show send (dark circle + white chevron) only when user has typed */}
                  {(!isOptionB || localQuery.trim()) && (
                    <button type="submit" className={`omnibox-popup__send${localQuery.trim() ? ' omnibox-popup__send--active' : ''}${isOptionB ? ' omnibox-popup__send--option-b' : ''}`} aria-label="Send">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M8 3.5L2.5 9l1.06 1.06L8 5.62l4.44 4.44L13.5 9 8 3.5z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
          </>
          )}

          {/* ── Loading shimmer ────────────────────────────────── */}
          {liveLoading && (
            <div className="omnibox-popup__live-loading">
              <div className="omnibox-popup__live-shimmer" />
              <div className="omnibox-popup__live-shimmer omnibox-popup__live-shimmer--short" />
            </div>
          )}

          {/* ── Tabs: Help | Explore ────── */}
          {!liveLoading && (
            <div className="omnibox-popup__suggestions">
              <div className="omnibox-popup__suggestions-tabs" role="tablist" aria-label="Rovo segments">
                <button
                  type="button"
                  className={`omnibox-popup__suggestions-tab omnibox-popup__suggestions-tab--icon${mainTab === 'help' ? ' omnibox-popup__suggestions-tab--active' : ''}`}
                  onClick={() => setMainTab('help')}
                  role="tab"
                  aria-selected={mainTab === 'help'}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="7"/>
                    <path d="M5.5 6a2.5 2.5 0 015 0c0 1.5-1.5 1.5-2.5 2.5"/>
                    <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                  Help and Support
                </button>
                <button
                  type="button"
                  className={`omnibox-popup__suggestions-tab omnibox-popup__suggestions-tab--ai${mainTab === 'ai' ? ' omnibox-popup__suggestions-tab--active' : ''}`}
                  onClick={() => { if (localQuery.trim().length >= liveQueryMinLength) setMainTab('ai'); }}
                  role="tab"
                  aria-selected={mainTab === 'ai'}
                  aria-disabled={localQuery.trim().length < liveQueryMinLength}
                  disabled={localQuery.trim().length < liveQueryMinLength}
                  title={localQuery.trim().length < liveQueryMinLength ? 'Start typing to explore' : undefined}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="omnibox-popup__ai-tab-search-icon" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="5"/>
                    <path d="M10.5 10.5L14 14"/>
                    <path d="M6.5 5.2v2.6M5.2 6.5h2.6M6.15 5.35l.7.7M7.65 6.85l.7.7M6.15 7.65l.7-.7M7.65 6.15l.7-.7" strokeWidth="1.1" fill="none" className="omnibox-popup__ai-tab-search-sparkle"/>
                  </svg>
                  Explore
                </button>
                <span className="omnibox-popup__suggestions-tabs-spacer" />
                {/* Help icon with sub-menu */}
                <div className="omnibox-popup__tab-icon-wrap" ref={tabHelpRef}>
                  <button
                    type="button"
                    className={`omnibox-popup__tab-icon-btn${tabHelpOpen ? ' omnibox-popup__tab-icon-btn--active' : ''}`}
                    aria-label="Help"
                    aria-haspopup="true"
                    aria-expanded={tabHelpOpen}
                    onClick={() => { setTabHelpOpen(v => !v); setTabSupportOpen(false); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="7"/>
                      <path d="M5.5 6a2.5 2.5 0 015 0c0 1.5-1.5 1.5-2.5 2.5"/>
                      <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>
                  {tabHelpOpen && (
                  <div className="omnibox-popup__tab-icon-menu" role="menu">
                    <button type="button" role="menuitem" className="omnibox-popup__tab-icon-menu-item" onClick={() => { setTabHelpOpen(false); omniBox.openChatPanel(insightId ? `__insight_help__:${insightId}` : '__inapp_help__'); }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/></svg>
                      Read Help articles
                    </button>
                    <button type="button" role="menuitem" className="omnibox-popup__tab-icon-menu-item" onClick={() => { setTabHelpOpen(false); omniBox.openChatPanel('__community__'); }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 11-.001 10.001A5 5 0 018 3zm-1 3h2v1H9v3H7V7H6V6h1z"/></svg>
                      Ask Community
                    </button>
                    <button type="button" role="menuitem" className="omnibox-popup__tab-icon-menu-item" onClick={() => { setTabHelpOpen(false); omniBox.openChatPanel('__bugs__'); }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/></svg>
                      View Bugs
                    </button>
                  </div>
                  )}
                </div>
                {/* Support icon with Record your issue + sub-menu */}
                <div className="omnibox-popup__tab-icon-wrap" ref={tabSupportRef}>
                  <button
                    type="button"
                    className={`omnibox-popup__tab-icon-btn${tabSupportOpen ? ' omnibox-popup__tab-icon-btn--active' : ''}`}
                    aria-label="Record your issue"
                    title="Record your issue"
                    aria-haspopup="true"
                    aria-expanded={tabSupportOpen}
                    onClick={() => { setTabSupportOpen(v => !v); setTabHelpOpen(false); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 9V7a7 7 0 0114 0v2"/>
                      <path d="M1 9a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2V9zM11 9a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2V9z"/>
                      <path d="M15 11v1a2 2 0 01-2 2h-3"/>
                      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>
                  {tabSupportOpen && (
                  <div className="omnibox-popup__tab-icon-menu" role="menu">
                    <button type="button" role="menuitem" className="omnibox-popup__tab-icon-menu-item" onClick={() => { setTabSupportOpen(false); setMainTab('help'); setHelpSubTab('support'); }}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="omnibox-popup__sai-icon-sm"><path d="M1 11V9a9 9 0 0118 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 016 11v2.5A2.5 2.5 0 013.5 16h0A2.5 2.5 0 011 13.5V11zM14 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 0119 11v2.5a2.5 2.5 0 01-2.5 2.5h0A2.5 2.5 0 0114 13.5V11z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 13.5v1.5a2.5 2.5 0 01-2.5 2.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 8.8l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4.4-1z" fill="#6554C0"/><circle cx="11.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><path d="M14.5 2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5L12.4 4.1l1.5-.6z" fill="#6554C0"/><path d="M17 5.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="#6554C0"/></svg>
                      Support Agent Insights
                    </button>
                    <button type="button" role="menuitem" className="omnibox-popup__tab-icon-menu-item" onClick={() => { setTabSupportOpen(false); setView('cases'); }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M5 5.5h6M5 8h6M5 10.5h4"/></svg>
                      View Tickets
                    </button>
                  </div>
                  )}
                </div>
              </div>

              {/* ── Help panel (first tab) ────────────────────────── */}
              {mainTab === 'help' && (() => {
                const maxItems = 4;
                const pinned    = ctxHelp.pages.slice(0, maxItems);
                const remaining = Math.max(0, maxItems - pinned.length);
                const other     = ctxHelp.otherPages.slice(0, remaining);
                const items     = [...pinned, ...other];
                return (
                <div className="omnibox-popup__suggestions-panel omnibox-popup__hp-panel omnibox-popup__help-panel" role="tabpanel">
                  {/* Sub-tabs under Help */}
                  <div className="omnibox-popup__help-subtabs" role="tablist" aria-label="Help sections">
                    <div className="omnibox-popup__help-subtabs-left">
                      <button
                        type="button"
                        className={`omnibox-popup__help-subtab${helpSubTab === 'helpPages' ? ' omnibox-popup__help-subtab--active' : ''}`}
                        onClick={() => { setHelpSubTab('helpPages'); omniBox.openChatPanel('__inapp_help__'); }}
                        role="tab"
                        aria-selected={helpSubTab === 'helpPages'}
                      >
                        Help Pages
                      </button>
                      <button
                        type="button"
                        className={`omnibox-popup__help-subtab${helpSubTab === 'tryAsking' ? ' omnibox-popup__help-subtab--active' : ''}`}
                        onClick={() => setHelpSubTab('tryAsking')}
                        role="tab"
                        aria-selected={helpSubTab === 'tryAsking'}
                      >
                        Try Asking
                      </button>
                      <button
                        type="button"
                        className={`omnibox-popup__help-subtab${helpSubTab === 'recent' ? ' omnibox-popup__help-subtab--active' : ''}`}
                        onClick={() => setHelpSubTab('recent')}
                        role="tab"
                        aria-selected={helpSubTab === 'recent'}
                      >
                        Recently Asked
                      </button>
                      <button
                        type="button"
                        className={`omnibox-popup__help-subtab${helpSubTab === 'support' ? ' omnibox-popup__help-subtab--active' : ''}`}
                        onClick={() => setHelpSubTab('support')}
                        role="tab"
                        aria-selected={helpSubTab === 'support'}
                      >
                        Support Agent Insights
                      </button>
                    </div>
                  </div>

                  {/* Help Pages sub-tab: articles only */}
                  {helpSubTab === 'helpPages' && (
                    <div className="omnibox-popup__help-section">
                      <ul className="omnibox-popup__hp-cards">
                        {items.map(a => (
                          <li key={a.id} className="omnibox-popup__hp-card">
                            <div className="omnibox-popup__hp-card-row">
                              <button
                                type="button"
                                className="omnibox-popup__hp-card-title omnibox-popup__hp-card-title--btn"
                                onClick={() => {
                                  omniBox.setQuery(a.title);
                                  omniBox.setArticleContext({ title: a.title, category: a.category, updated: a.updated, views: a.views, thumbsUp: a.thumbsUp, href: a.href });
                                  omniBox.openChatPanel('__article__');
                                }}
                              >
                                <svg className="omnibox-popup__hp-card-title-icon" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <circle cx="8" cy="8" r="7"/>
                                  <path d="M5.5 6a2.5 2.5 0 015 0c0 1.5-1.5 1.5-2.5 2.5"/>
                                  <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/>
                                </svg>
                                {a.title}
                              </button>
                              <span className="omnibox-popup__hp-card-hover-meta">
                                <span className="omnibox-popup__hp-card-cat">{a.category}</span>
                                <span className="omnibox-popup__hp-card-dot">·</span>
                                <span>{a.updated}</span>
                                <span className="omnibox-popup__hp-card-dot">·</span>
                                <span className="omnibox-popup__hp-card-stat">
                                  <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z"/></svg>
                                  {a.views}
                                </span>
                                <button
                                  type="button"
                                  className="omnibox-popup__hp-card-newtab"
                                  title="Open in new tab"
                                  onClick={(e) => { e.stopPropagation(); window.open(a.href, '_blank', 'noopener,noreferrer'); }}
                                >
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                                </button>
                              </span>
                              <span className="omnibox-popup__hp-card-arrow" aria-hidden="true">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
                              </span>
                            </div>
                          </li>
                        ))}
                        {items.length > 0 && (() => {
                          const sample = items[0];
                          return (
                            <li key={`browse-${sample.id}`} className="omnibox-popup__hp-card omnibox-popup__hp-card--browse">
                              <div className="omnibox-popup__hp-card-row omnibox-popup__hp-browse-row">
                                <button
                                  type="button"
                                  className="omnibox-popup__hp-card-title omnibox-popup__hp-card-title--btn omnibox-popup__hp-browse-label"
                                  onClick={() => {
                                    omniBox.setQuery(sample.title);
                                    omniBox.setArticleContext({ title: sample.title, category: sample.category, updated: sample.updated, views: sample.views, thumbsUp: sample.thumbsUp, href: sample.href });
                                    omniBox.openChatPanel('__article__');
                                  }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
                                    <circle cx="8" cy="8" r="7"/>
                                    <path d="M5.5 6a2.5 2.5 0 015 0c0 1.5-1.5 1.5-2.5 2.5"/>
                                    <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/>
                                  </svg>
                                  {sample.title}
                                </button>
                                <button
                                  type="button"
                                  className="omnibox-popup__hp-card-newtab"
                                  title="Open in new tab"
                                  onClick={(e) => { e.stopPropagation(); window.open(sample.href, '_blank', 'noopener,noreferrer'); }}
                                >
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                                </button>
                              </div>
                            </li>
                          );
                        })()}
                      </ul>
                      <div className="omnibox-popup__help-tab-actions">
                        <button
                          type="button"
                          className="omnibox-popup__help-tab-action"
                          onClick={() => omniBox.openChatPanel('__inapp_help__')}
                          aria-label="Read help pages"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/>
                          </svg>
                          Read help pages
                        </button>
                        <button
                          type="button"
                          className="omnibox-popup__help-tab-action"
                          onClick={() => omniBox.openChatPanel('__community__')}
                          aria-label="Ask Community"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 11-.001 10.001A5 5 0 018 3zm-1 3h2v1H9v3H7V7H6V6h1z"/>
                          </svg>
                          Ask Community
                        </button>
                        <button
                          type="button"
                          className="omnibox-popup__help-tab-action"
                          onClick={() => setView('cases')}
                          aria-label="View Tickets"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
                            <path d="M5 5.5h6M5 8h6M5 10.5h4"/>
                          </svg>
                          View Tickets
                        </button>
                        <div className="omnibox-popup__help-tab-action-wrap omnibox-popup__help-tab-action-wrap--record" ref={recordSubMenuRef}>
                          <button
                            type="button"
                            className="omnibox-popup__help-tab-action"
                            onClick={() => setRecordSubMenuOpen(v => !v)}
                            aria-label="Record your issue"
                            aria-haspopup="true"
                            aria-expanded={recordSubMenuOpen}
                          >
                            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="omnibox-popup__loom-icon-grey" aria-hidden="true">
                              <circle cx="16" cy="16" r="15" fill="#6B778C"/>
                              <circle cx="16" cy="16" r="6" fill="#97A0AF"/>
                              <circle cx="16" cy="16" r="3" fill="#6B778C"/>
                              <rect x="15" y="1" width="2" height="8" rx="1" fill="#97A0AF"/>
                              <rect x="15" y="23" width="2" height="8" rx="1" fill="#97A0AF"/>
                              <rect x="1" y="15" width="8" height="2" rx="1" fill="#97A0AF"/>
                              <rect x="23" y="15" width="8" height="2" rx="1" fill="#97A0AF"/>
                              <rect x="4.22" y="4.22" width="8" height="2" rx="1" transform="rotate(45 4.22 4.22)" fill="#97A0AF"/>
                              <rect x="19.66" y="19.66" width="8" height="2" rx="1" transform="rotate(45 19.66 19.66)" fill="#97A0AF"/>
                              <rect x="25.78" y="4.22" width="2" height="8" rx="1" transform="rotate(45 25.78 4.22)" fill="#97A0AF"/>
                              <rect x="10.34" y="19.66" width="2" height="8" rx="1" transform="rotate(45 10.34 19.66)" fill="#97A0AF"/>
                            </svg>
                            Record your issue
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="omnibox-popup__help-tab-action-chevron" aria-hidden="true">
                              <path d={recordSubMenuOpen ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {recordSubMenuOpen && (
                            <div className="omnibox-popup__record-submenu" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                className="omnibox-popup__record-submenu-item"
                                onClick={() => {
                                  setRecordSubMenuOpen(false);
                                  omniBox.setState('closed');
                                  omniBox.startLoomRecording();
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="omnibox-popup__loom-icon-grey" aria-hidden="true">
                                  <circle cx="16" cy="16" r="15" fill="#6B778C"/>
                                  <circle cx="16" cy="16" r="6" fill="#97A0AF"/>
                                  <rect x="15" y="1" width="2" height="8" rx="1" fill="#97A0AF"/>
                                  <rect x="15" y="23" width="2" height="8" rx="1" fill="#97A0AF"/>
                                  <rect x="1" y="15" width="8" height="2" rx="1" fill="#97A0AF"/>
                                  <rect x="23" y="15" width="8" height="2" rx="1" fill="#97A0AF"/>
                                </svg>
                                Record screen + camera with Loom
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="omnibox-popup__record-submenu-item"
                                onClick={() => {
                                  setRecordSubMenuOpen(false);
                                  omniBox.setState('closed');
                                  omniBox.startLoomRecording();
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="1" y="2" width="14" height="10" rx="2"/>
                                  <path d="M5 14h6M8 12v2"/>
                                  <circle cx="12" cy="5" r="2.5" fill="currentColor" stroke="currentColor"/>
                                </svg>
                                Record screen only
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Try Asking sub-tab */}
                  {helpSubTab === 'tryAsking' && (
                    <div className="omnibox-popup__help-section">
                      <ul className="omnibox-popup__list">
                        {ctxPrompts.prompts.map(p => (
                          <li key={p}>
                            <button className="omnibox-popup__list-item" onClick={() => handlePromptClick(p)}>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3 }}>
                                <path d="M2 1l5 4-5 4"/>
                              </svg>
                              {p}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recently Asked sub-tab */}
                  {helpSubTab === 'recent' && (
                    <div className="omnibox-popup__help-section">
                      {recentQuestions.length > 0 ? (
                        <ul className="omnibox-popup__list">
                          {recentQuestions.slice(0, 5).map(q => (
                            <li key={q.id}>
                              <button className="omnibox-popup__list-item" onClick={() => handleRecentClick(q.text)}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                                  <circle cx="8" cy="8" r="6.5"/><path d="M8 5v3.5l2 1.5"/>
                                </svg>
                                {q.text}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="omnibox-popup__empty-note">No recent questions yet.</div>
                      )}
                    </div>
                  )}

                  {/* Support Agent Insights sub-tab */}
                  {helpSubTab === 'support' && (
                    <div className="omnibox-popup__help-section omnibox-popup__rovo-brief-in-help">
                      <ul className="omnibox-popup__rovo-brief-list" role="list">
                        {insightItemsForContext.map(item => {
                          const colors = SUPPORT_INSIGHT_COLORS[item.level];
                          return (
                            <li key={item.id} className="omnibox-popup__rovo-brief-item">
                              <button
                                type="button"
                                className="omnibox-popup__rovo-brief-btn"
                                onClick={() => openInRovoSidebar({ title: item.title, category: 'Support Agent Insights', href: '/', description: item.subtitle })}
                              >
                                <span className="omnibox-popup__rovo-brief-btn-text">
                                  <span className="omnibox-popup__rovo-brief-btn-title" style={{ color: colors.accent }}>{item.title}</span>
                                  <span className="omnibox-popup__rovo-brief-btn-sub">{item.subtitle}</span>
                                </span>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" className="omnibox-popup__rovo-brief-btn-arrow" aria-hidden="true">
                                  <path d="M3 8h10M9 4l4 4-4 4"/>
                                </svg>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="omnibox-popup__rovo-brief-viewall">
                        <a
                          href={location.pathname.startsWith('/confluence') ? '/confluence' : '/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="omnibox-popup__rovo-brief-viewall-link"
                        >
                          View All
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}

              {/* ── Explore panel ──────────────────────────────── */}
              {mainTab === 'ai' && !liveQuery && !submittedQuery && (
                <div className="omnibox-popup__suggestions-panel omnibox-popup__ai-empty" role="tabpanel">
                  <div className="omnibox-popup__ai-empty-content">
                    <RovoIcon size={32} />
                    <p className="omnibox-popup__ai-empty-title">Ask Rovo</p>
                    <p className="omnibox-popup__ai-empty-desc">Type in the box above to get AI-powered answers and help articles.</p>
                  </div>
                </div>
              )}
              {mainTab === 'ai' && (liveQuery || submittedQuery) && (() => {
                const q = submittedQuery || liveQuery;
                const aiSummary = getAiSummary(q, contextActive);
                const results   = getSearchResults(q);
                const prompts   = getRelevantPrompts(q);
                return (
                  <div className="omnibox-popup__live-results" role="tabpanel">

                    {/* Back-to link when results were submitted */}
                    {submittedQuery && (
                      <div className="omnibox-popup__results-back-bar">
                        <button
                          type="button"
                          className="omnibox-popup__results-back-btn"
                          onClick={() => { setSubmittedQuery(null); setMainTab('help'); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 3L5 8l5 5"/>
                          </svg>
                          Back to Support
                        </button>
                        <span className="omnibox-popup__results-query-label">Results for &ldquo;{submittedQuery}&rdquo;</span>
                      </div>
                    )}

                    {/* AI Summary */}
                    <div className="omnibox-popup__live-summary">
                      <div className="omnibox-popup__live-summary-header">
                        <RovoIcon size={16} />
                        <span className="omnibox-popup__live-summary-label">AI Summary</span>
                        {!contextActive && (
                          <span className="omnibox-popup__live-no-context-badge">
                            Keyword only · no page context
                          </span>
                        )}
                      </div>
                      <p className="omnibox-popup__live-summary-text">{aiSummary.summary}</p>
                      <button
                        type="button"
                        className="omnibox-popup__live-summary-viewmore"
                        onClick={() => openInRovoSidebar({ title: q, category: 'AI Summary', href: '#', description: aiSummary.summary })}
                      >
                        View more →
                      </button>

                      <div className="omnibox-popup__live-support-actions">
                        {!followUpPhase && (
                          <button
                            type="button"
                            className="omnibox-popup__live-support-btn omnibox-popup__live-support-btn--followup"
                            onClick={() => { setFollowUpQuery(q); setFollowUpPhase('response-loading'); }}
                          >
                            <RovoIcon size={13} />
                            Ask a Follow Up Question
                          </button>
                        )}
                      </div>

                      {/* ── Follow-up flow ────────────────────── */}
                      {followUpPhase && (() => {
                        const fuSummary = getAiSummary(followUpQuery, contextActive);
                        return (
                          <div className="omnibox-popup__followup-flow">
                            {/* User's issue */}
                            <div className="omnibox-popup__followup-issue">
                              <span className="omnibox-popup__followup-issue-label">Your issue</span>
                              <p className="omnibox-popup__followup-issue-text">{followUpQuery}</p>
                            </div>

                            {/* Rovo response */}
                            <div className="omnibox-popup__followup-rovo">
                              <div className="omnibox-popup__followup-rovo-header">
                                <RovoIcon size={14} />
                                <span>Rovo</span>
                              </div>
                              <p className="omnibox-popup__followup-rovo-text">{fuSummary.summary}</p>
                            </div>

                            {/* Loading spinner (10s) */}
                            {followUpPhase === 'response-loading' && (
                              <div className="omnibox-popup__followup-loading">
                                <div className="omnibox-popup__followup-spinner" />
                                <span>Analyzing your issue and finding the best support options…</span>
                              </div>
                            )}

                            {/* Actions revealed after loading */}
                            {followUpPhase === 'actions-revealed' && (
                              <div className="omnibox-popup__followup-actions">
                                <p className="omnibox-popup__followup-actions-label">How would you like to proceed?</p>
                                <button
                                  type="button"
                                  className="omnibox-popup__followup-action-btn omnibox-popup__followup-action-btn--agent"
                                  onClick={() => {
                                    setFollowUpPhase('live-agent');
                                    setAgentMessages([{ role: 'agent', text: `Hi! I'm Sarah, your support specialist. I can see you're asking about: "${followUpQuery}". Let me help you with that. Can you share more details about the issue?` }]);
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h14v10H9l-4 4v-4H1V1z"/></svg>
                                  Connect with a live agent
                                </button>
                                <button
                                  type="button"
                                  className="omnibox-popup__followup-action-btn omnibox-popup__followup-action-btn--ticket"
                                  onClick={() => setFollowUpPhase('ticket-form')}
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1H7v6H1v2h6v6h2V9h6V7H9V1z"/></svg>
                                  Create a support ticket
                                </button>
                              </div>
                            )}

                            {/* Live agent simulation */}
                            {followUpPhase === 'live-agent' && (
                              <div className="omnibox-popup__followup-agent">
                                <div className="omnibox-popup__followup-agent-header">
                                  <div className="omnibox-popup__followup-agent-avatar">SA</div>
                                  <div>
                                    <div className="omnibox-popup__followup-agent-name">Sarah A. — Support Specialist</div>
                                    <div className="omnibox-popup__followup-agent-status"><span className="omnibox-popup__followup-agent-dot" />Active</div>
                                  </div>
                                </div>
                                <div className="omnibox-popup__followup-agent-msgs">
                                  {agentMessages.map((m, i) => (
                                    <div key={i} className={`omnibox-popup__followup-agent-msg omnibox-popup__followup-agent-msg--${m.role}`}>
                                      {m.role === 'agent' && <div className="omnibox-popup__followup-agent-msg-avatar">SA</div>}
                                      <div className="omnibox-popup__followup-agent-msg-bubble">{m.text}</div>
                                    </div>
                                  ))}
                                  <div ref={agentEndRef} />
                                </div>
                                <form className="omnibox-popup__followup-agent-form" onSubmit={e => {
                                  e.preventDefault();
                                  if (!agentInput.trim()) return;
                                  const userText = agentInput.trim();
                                  setAgentMessages(prev => [...prev, { role: 'user', text: userText }]);
                                  setAgentInput('');
                                  setTimeout(() => {
                                    setAgentMessages(prev => [...prev, { role: 'agent', text: `Thanks for that detail. I've looked into "${userText}" and here's what I found — this is typically related to configuration settings on your instance. Let me walk you through the resolution steps.` }]);
                                  }, 1200);
                                }}>
                                  <input
                                    className="omnibox-popup__followup-agent-input"
                                    type="text"
                                    value={agentInput}
                                    onChange={e => setAgentInput(e.target.value)}
                                    placeholder="Type your message…"
                                    autoFocus
                                  />
                                  <button type="submit" className="omnibox-popup__followup-agent-send">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1l13 7-13 7V10l8-2-8-2V1z"/></svg>
                                  </button>
                                </form>
                              </div>
                            )}

                            {/* Ticket form */}
                            {(followUpPhase === 'ticket-form' || followUpPhase === 'ticket-loom-recording' || followUpPhase === 'ticket-loom-done') && (
                              <div className="omnibox-popup__followup-ticket">
                                <h4 className="omnibox-popup__followup-ticket-title">
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1H7v6H1v2h6v6h2V9h6V7H9V1z"/></svg>
                                  Create Support Ticket
                                </h4>
                                <div className="omnibox-popup__followup-ticket-fields">
                                  <label className="omnibox-popup__followup-ticket-label">
                                    Summary
                                    <input type="text" className="omnibox-popup__followup-ticket-input" defaultValue={followUpQuery} readOnly />
                                  </label>
                                  <label className="omnibox-popup__followup-ticket-label">
                                    Priority
                                    <select className="omnibox-popup__followup-ticket-input" defaultValue="P2">
                                      <option value="P1">P1 — Critical</option>
                                      <option value="P2">P2 — High</option>
                                      <option value="P3">P3 — Medium</option>
                                      <option value="P4">P4 — Low</option>
                                    </select>
                                  </label>
                                  <label className="omnibox-popup__followup-ticket-label">
                                    Description
                                    <textarea className="omnibox-popup__followup-ticket-textarea" defaultValue={fuSummary.summary} rows={3} />
                                  </label>
                                  <label className="omnibox-popup__followup-ticket-label">
                                    Page Context
                                    <input type="text" className="omnibox-popup__followup-ticket-input" defaultValue={omniBox.contextUrl} readOnly />
                                  </label>
                                </div>

                                {/* Loom recording area */}
                                {followUpPhase === 'ticket-form' && !ticketLoomUrl && (
                                  <button
                                    type="button"
                                    className="omnibox-popup__followup-ticket-loom-btn"
                                    onClick={() => {
                                      setFollowUpPhase('ticket-loom-recording');
                                      setTimeout(() => {
                                        setTicketLoomUrl('https://www.loom.com/share/demo-ticket-recording-abc123');
                                        setFollowUpPhase('ticket-loom-done');
                                      }, 3000);
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="5" fill="#FF5733"/><circle cx="8" cy="8" r="7" stroke="#FF5733" strokeWidth="2" fill="none"/></svg>
                                    Record your issue via Loom
                                  </button>
                                )}
                                {followUpPhase === 'ticket-loom-recording' && (
                                  <div className="omnibox-popup__followup-ticket-loom-recording">
                                    <span className="omnibox-popup__followup-ticket-loom-pulse" />
                                    Recording your screen… please wait
                                  </div>
                                )}
                                {followUpPhase === 'ticket-loom-done' && ticketLoomUrl && (
                                  <div className="omnibox-popup__followup-ticket-loom-done">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#36B37E"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.3 5.3l-4 4a.5.5 0 01-.7 0l-2-2 .7-.7L7 9.3l3.6-3.6.7.7z"/></svg>
                                    <span>Loom recording attached</span>
                                    <a href={ticketLoomUrl} target="_blank" rel="noopener noreferrer" className="omnibox-popup__followup-ticket-loom-link">Watch recording</a>
                                  </div>
                                )}

                                {/* Create ticket button */}
                                {(followUpPhase === 'ticket-form' || followUpPhase === 'ticket-loom-done') && (
                                  <button
                                    type="button"
                                    className="omnibox-popup__followup-ticket-submit"
                                    onClick={() => setFollowUpPhase('ticket-success')}
                                  >
                                    Create Ticket
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Ticket success */}
                            {followUpPhase === 'ticket-success' && (
                              <div className="omnibox-popup__followup-success">
                                <svg width="32" height="32" viewBox="0 0 16 16" fill="#36B37E"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.3 5.3l-4 4a.5.5 0 01-.7 0l-2-2 .7-.7L7 9.3l3.6-3.6.7.7z"/></svg>
                                <h4 className="omnibox-popup__followup-success-title">Ticket Created Successfully!</h4>
                                <p className="omnibox-popup__followup-success-id">Ticket ID: <strong>SUP-{Math.floor(10000 + Math.random() * 90000)}</strong></p>
                                <div className="omnibox-popup__followup-success-links">
                                  <a
                                    href="https://support.atlassian.com/tickets/SUP-12345"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="omnibox-popup__followup-success-link"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                                    View ticket details in new tab
                                  </a>
                                  <button
                                    type="button"
                                    className="omnibox-popup__followup-success-link omnibox-popup__followup-success-link--rovo"
                                    onClick={() => {
                                      omniBox.setQuery(`Ticket SUP-12345: ${followUpQuery}`);
                                      omniBox.openChatPanel(`Show me details for ticket SUP-12345: ${followUpQuery}`);
                                    }}
                                  >
                                    <RovoIcon size={13} />
                                    Show details in Rovo sidebar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {prompts.length > 0 && (
                      <div className="omnibox-popup__live-prompts">
                        <div className="omnibox-popup__live-section-label">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/>
                          </svg>
                          Suggested prompts
                        </div>
                        <div className="omnibox-popup__live-prompt-list">
                          {prompts.map(p => (
                            <div key={p} className="omnibox-popup__hp-row" style={{ padding: '2px 8px' }}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="omnibox-popup__hp-row-icon">
                                <circle cx="6.5" cy="6.5" r="5"/><path d="M10.5 10.5L14 14"/>
                              </svg>
                              <span className="omnibox-popup__hp-row-text" onClick={() => openInRovoSidebar({ title: p, category: 'Suggested prompt', href: '#' })}>
                                <span className="omnibox-popup__help-page-title">{p}</span>
                              </span>
                              <span className="omnibox-popup__hp-row-actions">
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Ask Rovo" onClick={e => { e.stopPropagation(); openInRovoSidebar({ title: p, category: 'Suggested prompt', href: '#' }); }}><RovoIcon size={13} /></button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Help Pages preview ──────────────── */}
                    {results.length > 0 && (
                      <div className="omnibox-popup__ai-preview-section">
                        <div className="omnibox-popup__ai-preview-header">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/></svg>
                          <span>Help Pages</span>
                          <button type="button" className="omnibox-popup__ai-preview-more" onClick={() => setAiSubTab('help')}>View all &rsaquo;</button>
                        </div>
                        <ul className="omnibox-popup__ai-preview-list">
                          {results.slice(0, 3).map(r => (
                            <li key={r.id} className="omnibox-popup__hp-row">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="omnibox-popup__hp-row-icon"><path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/></svg>
                              <span className="omnibox-popup__hp-row-text" onClick={() => openInRovoSidebar({ title: r.title, category: r.category, href: r.url.startsWith('http') ? r.url : `${window.location.origin}${r.url}` })}>
                                <span className="omnibox-popup__help-page-title">{r.title}</span>
                                <span className="omnibox-popup__help-page-cat">{r.category}</span>
                              </span>
                              <span className="omnibox-popup__hp-row-actions">
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Ask Rovo" onClick={() => openInRovoSidebar({ title: r.title, category: r.category, href: r.url.startsWith('http') ? r.url : `${window.location.origin}${r.url}` })}><RovoIcon size={13} /></button>
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Open in new tab" onClick={(e) => { e.stopPropagation(); window.open(r.url, '_blank', 'noopener,noreferrer'); }}>
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1h4v4h-2V3.41L6.41 10 5 8.59 11.59 2H9V0h4V1zM1 3h6v2H3v8h8V9h2v5H1V3z"/></svg>
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ── Community preview ───────────────── */}
                    {ctxCommunity.length > 0 && (
                      <div className="omnibox-popup__ai-preview-section">
                        <div className="omnibox-popup__ai-preview-header">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h9v7H7l-3 3V8H1V1zm10 3h4v7h-2v3l-3-3h-1V8h1V4h1z"/></svg>
                          <span>Community</span>
                          <button type="button" className="omnibox-popup__ai-preview-more" onClick={() => setAiSubTab('community')}>View all &rsaquo;</button>
                        </div>
                        <ul className="omnibox-popup__ai-preview-list">
                          {ctxCommunity.slice(0, 3).map(ca => (
                            <li key={ca.id} className="omnibox-popup__hp-row">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="omnibox-popup__hp-row-icon"><path d="M1 1h9v7H7l-3 3V8H1V1zm10 3h4v7h-2v3l-3-3h-1V8h1V4h1z"/></svg>
                              <span className="omnibox-popup__hp-row-text" onClick={() => openInRovoSidebar({ title: ca.title, category: `Community · ${ca.author}`, href: ca.href })}>
                                <span className="omnibox-popup__help-page-title">
                                  {ca.title}
                                  {ca.solved && <span className="omnibox-popup__live-solved-badge" style={{ marginLeft: 6, fontSize: 10 }}><svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor"><path d="M13.28 4.28l-7 7-3.28-3.28 1.06-1.06 2.22 2.22 5.94-5.94 1.06 1.06z"/></svg>Solved</span>}
                                </span>
                                <span className="omnibox-popup__help-page-cat">by {ca.author} · {ca.replies} replies</span>
                              </span>
                              <span className="omnibox-popup__hp-row-actions">
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Ask Rovo" onClick={() => openInRovoSidebar({ title: ca.title, category: `Community · ${ca.author}`, href: ca.href })}><RovoIcon size={13} /></button>
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Open in new tab" onClick={(e) => { e.stopPropagation(); window.open(ca.href, '_blank', 'noopener,noreferrer'); }}>
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1h4v4h-2V3.41L6.41 10 5 8.59 11.59 2H9V0h4V1zM1 3h6v2H3v8h8V9h2v5H1V3z"/></svg>
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ── Videos preview ──────────────────── */}
                    {ctxVideos.length > 0 && (
                      <div className="omnibox-popup__ai-preview-section">
                        <div className="omnibox-popup__ai-preview-header">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h10v10H1V3zm11 2l4-2v10l-4-2V5z"/></svg>
                          <span>Videos</span>
                          <button type="button" className="omnibox-popup__ai-preview-more" onClick={() => setAiSubTab('videos')}>View all &rsaquo;</button>
                        </div>
                        <ul className="omnibox-popup__ai-preview-list">
                          {ctxVideos.slice(0, 3).map(v => (
                            <li key={v.id} className="omnibox-popup__hp-row">
                              <span className="omnibox-popup__ai-preview-thumb">{v.thumb}</span>
                              <span className="omnibox-popup__hp-row-text" onClick={() => openInRovoSidebar({ title: v.title, category: `${v.channel} · ${v.duration}`, href: v.href })}>
                                <span className="omnibox-popup__help-page-title">{v.title}</span>
                                <span className="omnibox-popup__help-page-cat">{v.channel} · {v.duration}</span>
                              </span>
                              <span className="omnibox-popup__hp-row-actions">
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Ask Rovo" onClick={() => openInRovoSidebar({ title: v.title, category: `${v.channel} · ${v.duration}`, href: v.href })}><RovoIcon size={13} /></button>
                                <button type="button" className="omnibox-popup__hp-action-btn" title="Open in new tab" onClick={(e) => { e.stopPropagation(); window.open(v.href, '_blank', 'noopener,noreferrer'); }}>
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1h4v4h-2V3.41L6.41 10 5 8.59 11.59 2H9V0h4V1zM1 3h6v2H3v8h8V9h2v5H1V3z"/></svg>
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          )}

          </>
          )}
          <div className="omnibox-popup__footer">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/>
            </svg>
            AI-generated. Verify important results.
          </div>
        </>
      )}
    </div>
  );
};
