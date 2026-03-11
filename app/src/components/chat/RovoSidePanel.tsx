import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { RovoIcon } from '../icons/RovoIcon';
import { ContextChip } from '../omnibox/ContextChip';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import { getAiSummary } from '../../data/mockAiSummaries';
import { getSupportInsightItemsForPath, SUPPORT_INSIGHT_COLORS, type SupportInsightItem } from '../../data/supportAiInsights';
import './RovoSidePanel.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  followUps?: string[];
  isTyping?: boolean;
  chartType?: 'bar' | 'line' | 'donut' | 'table' | null;
  showSupportActions?: boolean;
}

interface RovoSidePanelProps {
  omniBox: OmniBoxContext;
}

/* ── Mock data sets ──────────────────────────────────────────────── */
const BAR_DATA = [
  { label: 'Login Issues', value: 87, color: '#4C9AFF' },
  { label: 'Billing',      value: 65, color: '#6554C0' },
  { label: 'Integration',  value: 45, color: '#36B37E' },
  { label: 'Performance',  value: 38, color: '#FF8B00' },
  { label: 'Other',        value: 21, color: '#97A0AF' },
];

const LINE_DATA = [32, 38, 35, 47, 42, 55, 51, 60, 54, 63, 58, 70, 65, 72];

const DONUT_DATA = [
  { label: 'Met SLA',     value: 78, color: '#36B37E' },
  { label: 'At Risk',     value: 14, color: '#FF8B00' },
  { label: 'Breached',    value: 8,  color: '#DE350B' },
];

const TABLE_DATA = {
  headers: ['Channel', 'Open', 'Pending', 'Avg Wait', 'SLA %'],
  rows: [
    ['Billing',     '142', '38', '47m', '91%'],
    ['Chat',        '89',  '22', '8m',  '94%'],
    ['Email',       '203', '61', '6h',  '88%'],
    ['Phone',       '54',  '11', '12m', '97%'],
    ['Admin',       '76',  '29', '1.2h','85%'],
  ],
};

/* ── Determine which chart to show based on query keywords ────── */
function getChartType(query: string): 'bar' | 'line' | 'donut' | 'table' | null {
  const q = query.toLowerCase();
  if (q.match(/trend|resolution time|time spike|over time|14 day|week/)) return 'line';
  if (q.match(/sla|breach|compliance|rate|percentage|%/)) return 'donut';
  if (q.match(/queue|health|channel|region|table|summary|breakdown/)) return 'table';
  if (q.match(/billing|distribut|volume|ticket|surge|category/)) return 'bar';
  // default: show bar for anything long enough to warrant a viz
  return 'bar';
}

/* ── Help Articles data ────────────────────────────────────────── */
const ALL_ARTICLES = [
  { id: 'a1', title: 'Getting started with Jira Service Management', updated: 'Feb 14, 2026', views: '12.4K', thumbsUp: 847, category: 'Onboarding', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/getting-started-with-jira-service-management/' },
  { id: 'a2', title: 'How to configure SLA policies in JSM', updated: 'Jan 30, 2026', views: '8.1K', thumbsUp: 612, category: 'SLA', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/configure-sla-goals/' },
  { id: 'a3', title: 'Setting up queues and automation rules', updated: 'Feb 2, 2026', views: '6.7K', thumbsUp: 503, category: 'Automation', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-queues-for-your-team/' },
  { id: 'a4', title: 'Understanding permission schemes in Jira', updated: 'Jan 22, 2026', views: '5.2K', thumbsUp: 411, category: 'Admin', href: 'https://support.atlassian.com/jira-software-cloud/docs/what-are-permission-schemes/' },
  { id: 'a5', title: 'How to create and manage customer portals', updated: 'Feb 8, 2026', views: '4.8K', thumbsUp: 389, category: 'Admin', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/what-is-the-customer-portal/' },
  { id: 'a6', title: 'Billing and subscription management guide', updated: 'Feb 10, 2026', views: '4.3K', thumbsUp: 302, category: 'Billing', href: 'https://support.atlassian.com/subscriptions-and-licensing/docs/manage-your-bill-for-cloud-products/' },
  { id: 'a7', title: 'Configuring email notifications in JSM', updated: 'Jan 28, 2026', views: '3.9K', thumbsUp: 274, category: 'Automation', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-notifications-for-your-customers/' },
  { id: 'a8', title: 'Integrating JSM with Confluence for knowledge base', updated: 'Feb 1, 2026', views: '3.6K', thumbsUp: 258, category: 'Integration', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/link-confluence-spaces-to-your-service-project/' },
  { id: 'a9', title: 'SLA escalation rules and breach notifications', updated: 'Feb 5, 2026', views: '4.8K', thumbsUp: 345, category: 'SLA', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/sla-escalation/' },
  { id: 'a10', title: 'Onboarding new agents to your service desk', updated: 'Jan 28, 2026', views: '3.9K', thumbsUp: 274, category: 'Onboarding', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/onboard-agents/' },
  { id: 'a11', title: 'How to download invoices and receipts', updated: 'Jan 15, 2026', views: '2.9K', thumbsUp: 186, category: 'Billing', href: 'https://support.atlassian.com/subscriptions-and-licensing/docs/invoices/' },
  { id: 'a12', title: 'Connecting Slack with Jira Service Management', updated: 'Feb 12, 2026', views: '6.2K', thumbsUp: 478, category: 'Integration', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/slack-integration/' },
  { id: 'a13', title: 'Managing global permissions and site access', updated: 'Jan 18, 2026', views: '3.1K', thumbsUp: 198, category: 'Admin', href: 'https://support.atlassian.com/jira-software-cloud/docs/global-permissions/' },
  { id: 'a14', title: 'Using smart values in automation rules', updated: 'Feb 8, 2026', views: '5.5K', thumbsUp: 410, category: 'Automation', href: 'https://support.atlassian.com/jira-service-management-cloud/docs/smart-values/' },
];

const ARTICLE_CATEGORIES = ['All', 'Onboarding', 'SLA', 'Automation', 'Admin', 'Billing', 'Integration'] as const;

/* ── Community posts data ──────────────────────────────────────── */
const COMMUNITY_POSTS = [
  { id: 'cp1', title: 'How do I auto-escalate tickets based on priority in JSM?', author: 'Sarah K.', avatar: 'SK', avatarBg: '#E9E4FF', avatarColor: '#6554C0', replies: 14, views: '2.3K', votes: 42, solved: true,  time: '2h ago', category: 'Automation' },
  { id: 'cp2', title: 'Best practice for setting up P1/P2 SLA breach alerts?', author: 'Marcus T.', avatar: 'MT', avatarBg: '#DEEBFF', avatarColor: '#0747A6', replies: 9,  views: '1.8K', votes: 31, solved: true,  time: '5h ago', category: 'SLA' },
  { id: 'cp3', title: 'Customers not receiving email notifications after update', author: 'Priya M.', avatar: 'PM', avatarBg: '#E3FCEF', avatarColor: '#006644', replies: 6,  views: '987',  votes: 18, solved: false, time: '1d ago', category: 'Notifications' },
  { id: 'cp4', title: 'How to bulk reassign tickets across queues?', author: 'James L.', avatar: 'JL', avatarBg: '#FFF0B3', avatarColor: '#974F0C', replies: 11, views: '1.4K', votes: 27, solved: true,  time: '2d ago', category: 'Admin' },
  { id: 'cp5', title: 'Rovo AI suggestions not appearing in my project', author: 'Aiko W.', avatar: 'AW', avatarBg: '#FFEBE6', avatarColor: '#BF2600', replies: 4,  views: '743',  votes: 9,  solved: false, time: '3d ago', category: 'Rovo AI' },
  { id: 'cp6', title: 'Can I create custom SLA calendars for different regions?', author: 'Omar F.', avatar: 'OF', avatarBg: '#EAE6FF', avatarColor: '#403294', replies: 7,  views: '1.1K', votes: 22, solved: true,  time: '4d ago', category: 'SLA' },
];

const COMMUNITY_CATEGORIES = ['All', 'Automation', 'SLA', 'Admin', 'Notifications', 'Rovo AI'];

/* ── Article card renderer (shared) ──────────────────────────── */
const ArticleCard: React.FC<{
  art: typeof ALL_ARTICLES[0];
  onAskRovo: (q: string) => void;
  pinned?: boolean;
}> = ({ art, onAskRovo, pinned }) => (
  <li className={`rv-help__article${pinned ? ' rv-help__article--pinned' : ''}`}>
    {pinned && (
      <span className="rv-help__article-pin-badge">
        <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
        </svg>
        Relevant to this page
      </span>
    )}
    <a href={art.href} target="_blank" rel="noopener noreferrer" className="rv-help__article-title">
      {art.title}
    </a>
    <div className="rv-help__article-meta">
      <span className="rv-help__article-category">{art.category}</span>
      <span className="rv-help__article-dot">·</span>
      <span>Updated {art.updated}</span>
      <span className="rv-help__article-dot">·</span>
      <span className="rv-help__article-stat">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-label="Views"><path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z"/></svg>
        {art.views}
      </span>
      <span className="rv-help__article-dot">·</span>
      <span className="rv-help__article-stat">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-label="Helpful"><path d="M5 14H2V7h3v7zm8-8h-4l1-4H8L5 6v8h8.5l1.5-6H13z"/></svg>
        {art.thumbsUp}
      </span>
    </div>
  </li>
);

/* ── Read Articles Panel ──────────────────────────────────────── */
const ReadArticlesPanel: React.FC<{
  onAskRovo: (q: string) => void;
  contextInsightId?: string | null;
}> = ({ onAskRovo, contextInsightId }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  /* Compute pinned (context-relevant) articles */
  const ctxConfig      = contextInsightId ? INSIGHT_ARTICLES[contextInsightId] : null;
  const pinnedIds      = ctxConfig?.ids ?? [];
  const pinnedArticles = pinnedIds
    .map(id => ALL_ARTICLES.find(a => a.id === id))
    .filter(Boolean) as typeof ALL_ARTICLES;

  /* Remaining articles (not in pinned set), filtered by category */
  const otherArticles  = ALL_ARTICLES.filter(a =>
    !pinnedIds.includes(a.id) &&
    (activeCategory === 'All' || a.category === activeCategory)
  );

  return (
    <div className="rv-help">
      {/* Greeting */}
      <div className="rv-help__greeting">
        <svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0065FF', flexShrink: 0 }} aria-hidden="true">
          <path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9zm0 2h2v1H6v-1z"/>
        </svg>
        <div>
          <h2 className="rv-help__greeting-title">Help Articles</h2>
          <p className="rv-help__greeting-sub">
            {ctxConfig
              ? `Showing articles relevant to: ${ctxConfig.insightTitle}`
              : 'Browse the knowledge base or filter by category.'}
          </p>
        </div>
      </div>

      {/* Context badge when on an insight page */}
      {ctxConfig && (
        <div className="rv-insight-badge">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/>
          </svg>
          Page context: <strong>{ctxConfig.insightTitle}</strong>
          <span style={{ marginLeft: 'auto', fontWeight: 400, opacity: 0.7 }}>{ctxConfig.summary}</span>
        </div>
      )}

      {/* Pinned (context-relevant) articles */}
      {pinnedArticles.length > 0 && (
        <section className="rv-help__section">
          <p className="rv-help__section-label">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
            </svg>
            Recommended for this page
          </p>
          <ul className="rv-help__articles">
            {pinnedArticles.map(art => (
              <ArticleCard key={art.id} art={art} onAskRovo={onAskRovo} pinned />
            ))}
          </ul>
        </section>
      )}

      {/* Category pills (shown below pinned section) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <p className="rv-help__section-label" style={{ margin: 0 }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9zm0 2h2v1H6v-1z"/>
          </svg>
          {pinnedArticles.length > 0 ? 'More articles' : 'All articles'}
        </p>
        <div className="rv-help__cat-pills" style={{ marginBottom: 0 }}>
          {ARTICLE_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`rv-help__cat-pill${activeCategory === cat ? ' rv-help__cat-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Remaining articles */}
      <ul className="rv-help__articles">
        {otherArticles.length === 0 && (
          <li className="rv-help__empty">No articles match this category.</li>
        )}
        {otherArticles.map(art => (
          <ArticleCard key={art.id} art={art} onAskRovo={onAskRovo} />
        ))}
      </ul>

      <button className="rv-help__external-link" onClick={() => window.open('https://support.atlassian.com/', '_blank', 'noopener,noreferrer')}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/>
        </svg>
        Browse all articles on support.atlassian.com
      </button>
    </div>
  );
};

/* ── Community Panel ──────────────────────────────────────────── */
const CommunityPanel: React.FC<{ onAskRovo: (q: string) => void }> = ({ onAskRovo }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filter, setFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  const filtered = COMMUNITY_POSTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchFilter = filter === 'all' || (filter === 'solved' ? p.solved : !p.solved);
    return matchCat && matchFilter;
  });

  return (
    <div className="rv-help">
      {/* Greeting */}
      <div className="rv-help__greeting">
        <svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#36B37E', flexShrink: 0 }} aria-hidden="true">
          <path d="M1 1h9v7H7l-3 3V8H1V1zm10 3h4v7h-2v3l-3-3h-1V8h1V4h1z"/>
        </svg>
        <div>
          <h2 className="rv-help__greeting-title">Atlassian Community</h2>
          <p className="rv-help__greeting-sub">Find answers from the community or ask your own question.</p>
        </div>
      </div>

      {/* Category pills */}
      <div className="rv-help__cat-pills">
        {COMMUNITY_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`rv-help__cat-pill${activeCategory === cat ? ' rv-help__cat-pill--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="rv-help__comm-filters">
        {(['all', 'solved', 'unsolved'] as const).map(f => (
          <button
            key={f}
            className={`rv-help__comm-filter${filter === f ? ' rv-help__comm-filter--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All posts' : f === 'solved' ? '✓ Solved' : '? Unsolved'}
          </button>
        ))}
      </div>

      {/* Post list */}
      <ul className="rv-help__comm-list">
        {filtered.length === 0 && (
          <li className="rv-help__empty">No posts match your search.</li>
        )}
        {filtered.map(post => (
          <li key={post.id} className="rv-help__comm-post">
            <div className="rv-help__comm-post-header">
              <div className="rv-help__comm-avatar" style={{ background: post.avatarBg, color: post.avatarColor }}>
                {post.avatar}
              </div>
              <div className="rv-help__comm-meta">
                <span className="rv-help__comm-author">{post.author}</span>
                <span className="rv-help__comm-time">{post.time}</span>
              </div>
              {post.solved && (
                <span className="rv-help__comm-solved">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M13.28 4.28l-7 7-3.28-3.28 1.06-1.06 2.22 2.22 5.94-5.94 1.06 1.06z"/>
                  </svg>
                  Solved
                </span>
              )}
            </div>
            <p className="rv-help__comm-title">{post.title}</p>
            <div className="rv-help__comm-stats">
              <span className="rv-help__article-category">{post.category}</span>
              <span className="rv-help__article-dot">·</span>
              <span className="rv-help__comm-stat">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-label="Replies"><path d="M1 1h9v7H7l-3 3V8H1V1z"/></svg>
                {post.replies} replies
              </span>
              <span className="rv-help__article-dot">·</span>
              <span className="rv-help__comm-stat">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-label="Views"><path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z"/></svg>
                {post.views}
              </span>
              <span className="rv-help__article-dot">·</span>
              <span className="rv-help__comm-stat">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-label="Votes"><path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/></svg>
                {post.votes}
              </span>
            </div>
            <button
              className="rv-help__article-ask"
              onClick={() => onAskRovo(post.title)}
            >
              Ask Rovo about this →
            </button>
          </li>
        ))}
      </ul>

      <div className="rv-help__comm-actions">
        <button className="rv-help__comm-ask-btn" onClick={() => onAskRovo('Help me write a community question about my Jira issue')}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M9 1H7v6H1v2h6v6h2V9h6V7H9V1z"/>
          </svg>
          Post a question
        </button>
        <button className="rv-help__external-link" onClick={() => window.open('https://community.atlassian.com/', '_blank', 'noopener,noreferrer')}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/>
          </svg>
          Open community.atlassian.com
        </button>
      </div>
    </div>
  );
};

/* ── Bugs Panel ──────────────────────────────────────────────── */
const KNOWN_BUGS = [
  { id: 'BUG-4291', title: 'JQL filter returns stale results after board switch', severity: 'Critical', status: 'In Progress', product: 'Jira Software', reported: '2 days ago', votes: 47 },
  { id: 'BUG-4285', title: 'Confluence page export to PDF missing inline images', severity: 'Major', status: 'Open', product: 'Confluence', reported: '3 days ago', votes: 32 },
  { id: 'BUG-4278', title: 'Automation rule triggers twice on subtask creation', severity: 'Major', status: 'In Progress', product: 'Jira Software', reported: '5 days ago', votes: 28 },
  { id: 'BUG-4273', title: 'SSO login loop on Safari 17+ with SAML provider', severity: 'Critical', status: 'Open', product: 'Atlassian Access', reported: '1 week ago', votes: 61 },
  { id: 'BUG-4270', title: 'Bitbucket PR diff view freezes on large changesets (>500 files)', severity: 'Major', status: 'Investigating', product: 'Bitbucket', reported: '1 week ago', votes: 19 },
  { id: 'BUG-4265', title: 'JSM SLA timer pauses incorrectly across timezone boundaries', severity: 'Critical', status: 'In Progress', product: 'Jira Service Management', reported: '1 week ago', votes: 53 },
  { id: 'BUG-4261', title: 'Statuspage component updates not reflected in subscriber emails', severity: 'Minor', status: 'Open', product: 'Statuspage', reported: '2 weeks ago', votes: 11 },
  { id: 'BUG-4255', title: 'Confluence smart link previews return 403 for public pages', severity: 'Major', status: 'Open', product: 'Confluence', reported: '2 weeks ago', votes: 24 },
];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#DE350B',
  Major: '#FF991F',
  Minor: '#6554C0',
};

const STATUS_COLORS: Record<string, string> = {
  Open: '#6B778C',
  'In Progress': '#0065FF',
  Investigating: '#FF991F',
};

const BugsPanel: React.FC<{ onAskRovo: (q: string) => void }> = ({ onAskRovo }) => {
  const [activeCat, setActiveCat] = useState('All');
  const products = ['All', ...Array.from(new Set(KNOWN_BUGS.map(b => b.product)))];
  const filtered = KNOWN_BUGS.filter(b => activeCat === 'All' || b.product === activeCat);

  return (
    <div className="rv-help">
      <div className="rv-help__greeting">
        <svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#DE350B', flexShrink: 0 }} aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/>
        </svg>
        <div>
          <h2 className="rv-help__greeting-title">Known Bugs &amp; Issues</h2>
          <p className="rv-help__greeting-sub">Tracked bugs and reported issues across Atlassian products. Click one to ask Rovo for details.</p>
        </div>
      </div>

      <div className="rv-help__cat-pills">
        {products.map(cat => (
          <button
            key={cat}
            className={`rv-help__cat-pill${activeCat === cat ? ' rv-help__cat-pill--active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className="rv-bugs__list">
        {filtered.map(bug => (
          <li key={bug.id} className="rv-bugs__item">
            <div className="rv-bugs__header">
              <span className="rv-bugs__id">{bug.id}</span>
              <span className="rv-bugs__severity" style={{ color: SEVERITY_COLORS[bug.severity] || '#6B778C' }}>{bug.severity}</span>
            </div>
            <p className="rv-bugs__title">{bug.title}</p>
            <div className="rv-bugs__meta">
              <span className="rv-bugs__status" style={{ color: STATUS_COLORS[bug.status] || '#6B778C' }}>
                {bug.status === 'In Progress' && (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6"/></svg>
                )}
                {bug.status}
              </span>
              <span className="rv-help__article-dot">·</span>
              <span className="rv-bugs__product">{bug.product}</span>
              <span className="rv-help__article-dot">·</span>
              <span className="rv-bugs__reported">{bug.reported}</span>
              <span className="rv-help__article-dot">·</span>
              <span className="rv-bugs__votes">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/></svg>
                {bug.votes}
              </span>
            </div>
            <button className="rv-help__article-ask" onClick={() => onAskRovo(`Tell me about bug ${bug.id}: ${bug.title}`)}>
              Ask Rovo about this →
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ── SVG Bar Chart ───────────────────────────────────────────── */
const BarChart: React.FC = () => {
  const max = Math.max(...BAR_DATA.map(d => d.value));
  return (
    <div className="rv-chart rv-chart--bar">
      <p className="rv-chart__title">Ticket Volume by Category · Last 7 days</p>
      <div className="rv-bar-list">
        {BAR_DATA.map(d => (
          <div key={d.label} className="rv-bar-row">
            <span className="rv-bar-label">{d.label}</span>
            <div className="rv-bar-track">
              <div
                className="rv-bar-fill"
                style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
              />
            </div>
            <span className="rv-bar-num">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── SVG Line Chart ──────────────────────────────────────────── */
const LineChart: React.FC = () => {
  const W = 320, H = 110, PAD = 12;
  const max = Math.max(...LINE_DATA);
  const min = Math.min(...LINE_DATA);
  const range = max - min || 1;
  const pts = LINE_DATA.map((v, i) => {
    const x = PAD + (i / (LINE_DATA.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M${pts[0]} ` + pts.slice(1).map(p => `L${p}`).join(' ')
    + ` L${W - PAD},${H - PAD} L${PAD},${H - PAD} Z`;

  const days = ['14d', '13d', '12d', '11d', '10d', '9d', '8d', '7d', '6d', '5d', '4d', '3d', '2d', 'Today'];

  return (
    <div className="rv-chart rv-chart--line">
      <p className="rv-chart__title">Resolution Time Trend · minutes</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="rv-line-svg">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = PAD + t * (H - PAD * 2);
          const val = Math.round(max - t * range);
          return (
            <g key={i}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
              <text x={PAD - 2} y={y + 3} fontSize="7" fill="#9ca3af" textAnchor="end">{val}m</text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#lineGrad)" opacity="0.25"/>
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#4C9AFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        {/* Dots */}
        {pts.map((pt, i) => {
          const [x, y] = pt.split(',').map(Number);
          return <circle key={i} cx={x} cy={y} r="2.5" fill="white" stroke="#4C9AFF" strokeWidth="1.5"/>;
        })}
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4C9AFF"/>
            <stop offset="100%" stopColor="#4C9AFF" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
      {/* X-axis labels — show every other */}
      <div className="rv-line-labels">
        {days.filter((_, i) => i % 2 === 0).map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
};

/* ── SVG Donut Chart ─────────────────────────────────────────── */
const DonutChart: React.FC = () => {
  const R = 36, CX = 52, CY = 52, STROKE = 14;
  const circ = 2 * Math.PI * R;
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const slices = DONUT_DATA.map(d => {
    const dash = (d.value / total) * circ;
    const slice = { ...d, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="rv-chart rv-chart--donut">
      <p className="rv-chart__title">SLA Compliance Breakdown</p>
      <div className="rv-donut-wrap">
        <svg width="104" height="104" viewBox="0 0 104 104">
          {/* Background ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth={STROKE}/>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={-s.offset + circ / 4}
              strokeLinecap="butt"
            />
          ))}
          {/* Centre label */}
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e1f21">78%</text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize="7" fill="#6b6e76">Met SLA</text>
        </svg>
        <div className="rv-donut-legend">
          {DONUT_DATA.map(d => (
            <div key={d.label} className="rv-donut-legend-item">
              <span className="rv-donut-dot" style={{ background: d.color }}/>
              <span className="rv-donut-legend-label">{d.label}</span>
              <span className="rv-donut-legend-val">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Data Table ──────────────────────────────────────────────── */
const DataTable: React.FC = () => (
  <div className="rv-chart rv-chart--table">
    <p className="rv-chart__title">Queue Health by Channel</p>
    <div className="rv-table-wrap">
      <table className="rv-table">
        <thead>
          <tr>{TABLE_DATA.headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {TABLE_DATA.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={j === 4 ? (parseInt(cell) >= 95 ? 'rv-td--good' : parseInt(cell) >= 90 ? 'rv-td--warn' : 'rv-td--bad') : ''}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ── In-App Help data ─────────────────────────────────────────── */
const HELP_ARTICLES = [
  {
    id: 'ha1',
    title: 'Getting started with Jira Service Management',
    updated: 'Feb 14, 2026',
    views: '12.4K',
    thumbsUp: 847,
    category: 'Onboarding',
    href: 'https://support.atlassian.com/jira-service-management-cloud/docs/getting-started-with-jira-service-management/',
  },
  {
    id: 'ha2',
    title: 'How to configure SLA policies in JSM',
    updated: 'Jan 30, 2026',
    views: '8.1K',
    thumbsUp: 612,
    category: 'SLA',
    href: 'https://support.atlassian.com/jira-service-management-cloud/docs/configure-sla-goals/',
  },
  {
    id: 'ha3',
    title: 'Setting up queues and automation rules',
    updated: 'Feb 2, 2026',
    views: '6.7K',
    thumbsUp: 503,
    category: 'Automation',
    href: 'https://support.atlassian.com/jira-service-management-cloud/docs/set-up-queues-for-your-team/',
  },
];

/* ── Insight-specific article relevance map ───────────────────── */
const INSIGHT_ARTICLES: Record<string, { ids: string[]; summary: string; insightTitle: string }> = {
  i1: {
    insightTitle: 'P1/P2 Tickets Surge',
    summary: 'Articles relevant to billing queue surges, ticket volume management and automation.',
    ids: ['a6', 'a3', 'a1', 'a8'],
  },
  i2: {
    insightTitle: 'Resolution Time Spike',
    summary: 'Articles to help diagnose slow resolution times, agent workload and admin queue issues.',
    ids: ['a4', 'a3', 'a2', 'a1'],
  },
  i3: {
    insightTitle: 'SLA Breach Risk – Chat',
    summary: 'Articles on SLA configuration, queue routing and breach prevention.',
    ids: ['a2', 'a3', 'a5', 'a7'],
  },
};

/* ── Insight Help Panel ──────────────────────────────────────── */
const InsightHelpPanel: React.FC<{ insightId: string; onAskRovo: (q: string) => void }> = ({ insightId, onAskRovo }) => {
  const [activeCat, setActiveCat] = useState('All');
  const config  = INSIGHT_ARTICLES[insightId];
  const contextArticles = config
    ? config.ids.map(id => ALL_ARTICLES.find(a => a.id === id)).filter(Boolean) as typeof ALL_ARTICLES
    : ALL_ARTICLES.slice(0, 4);
  const title   = config?.insightTitle ?? 'this insight';
  const summary = config?.summary ?? 'Relevant articles for your current insight.';
  const filtered = activeCat === 'All' ? contextArticles : contextArticles.filter(a => a.category === activeCat);

  return (
    <div className="rv-help">
      {/* Greeting */}
      <div className="rv-help__greeting">
        <RovoIcon size={36} />
        <div>
          <h2 className="rv-help__greeting-title">Hello, I&rsquo;m Rovo &mdash; your Help agent.</h2>
          <p className="rv-help__greeting-sub">{summary}</p>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="rv-help__pills" role="tablist" aria-label="Article categories">
        {ARTICLE_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeCat === cat}
            className={`rv-help__pill${activeCat === cat ? ' rv-help__pill--active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Context badge */}
      <div className="rv-insight-badge">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/>
        </svg>
        Showing articles related to: <strong>{title}</strong>
      </div>

      {/* Relevant articles */}
      <section className="rv-help__section">
        {filtered.length > 0 ? (
          <ul className="rv-help__articles">
            {filtered.map(art => (
              <ArticleCard key={art.id} art={art} onAskRovo={onAskRovo} pinned />
            ))}
          </ul>
        ) : (
          <p className="rv-help__empty">No articles found for &ldquo;{activeCat}&rdquo;.</p>
        )}
      </section>

      {/* Ask Rovo CTA */}
      <button
        className="rv-help__external-link"
        style={{ background: '#EAF2FF', color: '#0052CC', border: '1px solid #C1DAFE' }}
        onClick={() => onAskRovo(`Help me understand and resolve: ${title}`)}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1z"/>
          <path d="M6 6.5C6 5.1 6.9 4 8 4s2 1.1 2 2.5c0 1-.5 1.8-1.2 2.2L8.5 10h-1l-.3-1.3C6.5 8.3 6 7.5 6 6.5z" fill="#fff"/>
          <circle cx="8" cy="11.5" r=".75" fill="#fff"/>
        </svg>
        Ask Rovo to help resolve this insight
      </button>

      {/* Browse all link */}
      <div className="rv-help__browse">
        <a
          href="https://support.atlassian.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rv-help__browse-link"
        >
          Browse all articles on support.atlassian.com
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M14 3.5V12h-1V4.9L3.4 14.5l-.7-.7L12.1 4.5H5v-1h9z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

/* ── In-App Help Panel ───────────────────────────────────────── */
const HELP_PANEL_TABS = ['Top Articles', ...ARTICLE_CATEGORIES.filter(c => c !== 'All')] as const;

const InAppHelpPanel: React.FC<{ onAskRovo: (q: string) => void }> = ({ onAskRovo }) => {
  const [activeTab, setActiveTab] = useState<string>('Top Articles');
  const filtered = activeTab === 'Top Articles'
    ? ALL_ARTICLES.slice(0, 5)
    : ALL_ARTICLES.filter(a => a.category === activeTab);

  return (
    <div className="rv-help">
      {/* Greeting */}
      <div className="rv-help__greeting">
        <RovoIcon size={36} />
        <div>
          <h2 className="rv-help__greeting-title">Hello, I&rsquo;m Rovo &mdash; your Help agent.</h2>
          <p className="rv-help__greeting-sub">Find answers, read articles or chat with a Rovo agent below.</p>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="rv-help__pills" role="tablist" aria-label="Article categories">
        {HELP_PANEL_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`rv-help__pill${activeTab === tab ? ' rv-help__pill--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles */}
      <section className="rv-help__section">
        {filtered.length > 0 ? (
          <ul className="rv-help__articles">
            {filtered.map(art => (
              <ArticleCard key={art.id} art={art} onAskRovo={onAskRovo} />
            ))}
          </ul>
        ) : (
          <p className="rv-help__empty">No articles found for &ldquo;{activeTab}&rdquo;.</p>
        )}
      </section>

      {/* Prompt pills */}
      <div className="rv-help__prompts">
        {[
          { label: 'Ask Community', action: '__community__' },
          { label: 'Bugs', action: '__bugs__' },
          { label: 'Site Status', action: 'What is the current Atlassian site status?' },
        ].map(({ label, action }) => (
          <button
            key={label}
            type="button"
            className="rv-help__prompt-pill"
            onClick={() => onAskRovo(action)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Browse all link */}
      <div className="rv-help__browse">
        <a
          href="https://support.atlassian.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rv-help__browse-link"
        >
          Browse all articles on support.atlassian.com
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M14 3.5V12h-1V4.9L3.4 14.5l-.7-.7L12.1 4.5H5v-1h9z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

/* ── Support Agent Insights list panel (View Support Agent Insights) ──────── */
const SupportAiInsightsPanel: React.FC<{ onAskRovo: (q: string) => void }> = ({ onAskRovo }) => {
  const location = useLocation();
  const items = getSupportInsightItemsForPath(location.pathname);

  return (
    <div className="rv-help">
      <div className="rv-help__greeting">
        <RovoIcon size={36} />
        <div>
          <h2 className="rv-help__greeting-title">Support Agent Insights</h2>
          <p className="rv-help__greeting-sub">Issues and insights from your support context. Click one to ask Rovo.</p>
        </div>
      </div>
      <section className="rv-help__section">
        <ul className="rovo-panel__support-insights-list" role="list">
          {items.map((item: SupportInsightItem) => {
            const colors = SUPPORT_INSIGHT_COLORS[item.level];
            return (
              <li key={item.id} className="rovo-panel__support-insights-item">
                <button
                  type="button"
                  className="rovo-panel__support-insights-btn"
                  onClick={() => onAskRovo(item.query)}
                >
                  <span className="rovo-panel__support-insights-btn-text">
                    <span className="rovo-panel__support-insights-btn-title" style={{ color: colors.accent }}>{item.title}</span>
                    <span className="rovo-panel__support-insights-btn-sub">{item.subtitle}</span>
                  </span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" className="rovo-panel__support-insights-btn-arrow" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

/* Suggestion cards — matches Rovo Material chat component */
const SUGGESTION_CARDS = [
  {
    icon: '💡',
    title: 'Brainstorm ideas for project',
    sub: 'Generate ideas for a common customer problem or support topic',
  },
  {
    icon: '📊',
    title: 'Analyse customer feedback',
    sub: 'Gather and synthesize customer feedback on a product or feature',
  },
  {
    icon: '🔍',
    title: 'Convert request into JQL',
    sub: 'Write a JQL query to find all unresolved bugs assigned to my queue',
  },
  {
    icon: '📄',
    title: 'Create a document of Jira...',
    sub: 'Generate a Confluence page summarising information from these tickets',
  },
];

/* ── Apply Fix button with countdown → loading → success ──────────── */
const ApplyFixButton: React.FC<{ onCancel?: () => void; onFixConfirmed?: () => void }> = ({ onCancel, onFixConfirmed }) => {
  const [phase, setPhase] = useState<'countdown' | 'loading' | 'success'>('countdown');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('loading'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const t = setTimeout(() => setPhase('success'), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'success') onFixConfirmed?.();
  }, [phase, onFixConfirmed]);

  if (phase === 'success') {
    return (
      <div className="rv-help__fix-success">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#006644"/>
          <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Fix applied successfully! The automation rule has been restored and is running normally.</span>
      </div>
    );
  }

  return (
    <div className="rv-help__fix-row">
      <button type="button" className={`rv-help__fix-btn${phase === 'loading' ? ' rv-help__fix-btn--loading' : ''}`} disabled>
        {phase === 'loading' ? (
          <>
            <RovoIcon size={16} />
            <span className="rv-help__fix-spinner" />
            Applying fix…
          </>
        ) : (
          <>
            <RovoIcon size={16} />
            Applying Fix ({countdown}s)
          </>
        )}
      </button>
      {onCancel && (
        <button type="button" className="rv-help__fix-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  );
};

export const RovoSidePanel: React.FC<RovoSidePanelProps> = ({ omniBox }) => {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [inputVal, setInputVal]     = useState('');
  const [thumbed, setThumbed]       = useState<'up' | 'down' | null>(null);
  const [connectingAgent, setConnectingAgent] = useState(false);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const bodyRef                     = useRef<HTMLDivElement>(null);

  const scrollToTop = () => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  /* Detect which insight page the user is currently on */
  const location         = useLocation();
  const pageInsightMatch = location.pathname.match(/^\/insight\/([^/]+)/);
  const pageInsightId    = pageInsightMatch ? pageInsightMatch[1] : null;

  /* Parse insight sentinel: __insight_help__:i1 */
  const insightHelpMatch = omniBox.activePrompt.match(/^__insight_help__:(.+)$/);
  const insightHelpId    = insightHelpMatch ? insightHelpMatch[1] : null;

  const PANEL_SENTINELS = ['__inapp_help__', '__read_articles__', '__community__', '__live_chat__', '__article__', '__followup__', '__support_ai_insights__', '__bugs__', '__loom_support__'];
  const isInsightMode   = !!insightHelpId && messages.length === 0;
  const isLiveChatMode  = omniBox.activePrompt === '__live_chat__'     && messages.length === 0;
  const isLoomSupportMode = omniBox.activePrompt === '__loom_support__' && messages.length === 0;
  const isSpecialPanel  = (PANEL_SENTINELS.includes(omniBox.activePrompt) || isInsightMode) && messages.length === 0;
  const isHelpMode      = omniBox.activePrompt === '__inapp_help__'    && messages.length === 0;
  const isArticlesMode  = omniBox.activePrompt === '__read_articles__' && messages.length === 0;
  const isCommunityMode = omniBox.activePrompt === '__community__'     && messages.length === 0;
  const isBugsMode      = omniBox.activePrompt === '__bugs__'          && messages.length === 0;
  const isArticleMode   = omniBox.activePrompt === '__article__'       && omniBox.articleContext && messages.length === 0;
  const isFollowUpMode  = omniBox.activePrompt === '__followup__'       && omniBox.query && messages.length === 0;
  const isSupportInsightsMode = omniBox.activePrompt === '__support_ai_insights__' && messages.length === 0;
  const [loomAttachedChecked, setLoomAttachedChecked] = useState(true);

  const followUpTriggeredRef = useRef(false);

  /* Follow-up flow: open with __followup__ + query → show loading, then response, then Talk to live agent | Create support ticket */
  useEffect(() => {
    if (!isFollowUpMode || followUpTriggeredRef.current) return;
    followUpTriggeredRef.current = true;
    const q = omniBox.query;
    const userMsg: Message = { id: `m-${Date.now()}`, role: 'user', text: q };
    const typingId = `typing-${Date.now()}`;
    setMessages([userMsg, { id: typingId, role: 'assistant', text: '', isTyping: true }]);
    const t = setTimeout(() => {
      const summary = getAiSummary(q, true);
      setMessages(prev =>
        prev
          .filter(m => m.id !== typingId)
          .concat({ id: `m-${Date.now()}`, role: 'assistant', text: summary.summary, showSupportActions: true })
      );
    }, 1200);
    return () => clearTimeout(t);
  }, [isFollowUpMode, omniBox.query]);

  /* Auto-send the prompt that launched the panel (skip special sentinels and article) */
  useEffect(() => {
    const isKnownSentinel = PANEL_SENTINELS.includes(omniBox.activePrompt) || !!omniBox.activePrompt.match(/^__insight_help__:/);
    if (omniBox.activePrompt && !isKnownSentinel && messages.length === 0) {
      addUserMessage(omniBox.activePrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [omniBox.activePrompt]);

  /* Scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Auto-resize the textarea */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  useEffect(() => { autoResize(); }, [inputVal, autoResize]);

  const addUserMessage = (text: string) => {
    const userMsg: Message = { id: `m-${Date.now()}`, role: 'user', text };
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, userMsg, { id: typingId, role: 'assistant', text: '', isTyping: true }]);
    setTimeout(() => {
      const summary = getAiSummary(text);
      const chartType = getChartType(text);
      setMessages(prev =>
        prev
          .filter(m => m.id !== typingId)
          .concat({
            id: `m-${Date.now()}`,
            role: 'assistant',
            text: summary.summary,
            followUps: summary.followUps,
            chartType,
            showSupportActions: true, // Show Live Agent + Create a Support ticket after every typed question
          })
      );
    }, 900);
  };

  /** When user clicks a relevant prompt (article or follow-up chip): show loading, then Rovo response + Live Chat | Create a ticket */
  const addUserMessageWithSupportActions = (text: string) => {
    const userMsg: Message = { id: `m-${Date.now()}`, role: 'user', text };
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, userMsg, { id: typingId, role: 'assistant', text: '', isTyping: true }]);
    setTimeout(() => {
      const summary = getAiSummary(text, true);
      setMessages(prev =>
        prev
          .filter(m => m.id !== typingId)
          .concat({ id: `m-${Date.now()}`, role: 'assistant', text: summary.summary, showSupportActions: true })
      );
    }, 1200);
  };

  const startLiveAgentConnect = () => {
    setConnectingAgent(true);
    setTimeout(() => {
      setConnectingAgent(false);
      omniBox.openLiveChat();
    }, 3000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    addUserMessage(val);
    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="rovo-panel" aria-label="Rovo Chat" role="complementary">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="rovo-panel__header">
        <button className="rovo-panel__icon-btn" aria-label="Menu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="3"  width="14" height="1.5" rx="0.75"/>
            <rect x="1" y="7"  width="14" height="1.5" rx="0.75"/>
            <rect x="1" y="11" width="14" height="1.5" rx="0.75"/>
          </svg>
        </button>

        <div className="rovo-panel__wordmark">
          <RovoIcon size={26} />
          <span className="rovo-panel__brand-name">{isSupportInsightsMode || (isArticleMode && omniBox.articleContext?.category === 'Support Agent Insights') ? 'Support Agent' : 'Help Agent'}</span>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="rovo-panel__brand-caret">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <button className="rovo-panel__icon-btn" aria-label="More options">
          <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
            <circle cx="2" cy="2" r="1.5"/>
            <circle cx="8" cy="2" r="1.5"/>
            <circle cx="14" cy="2" r="1.5"/>
          </svg>
        </button>

        <button className="rovo-panel__icon-btn" onClick={omniBox.close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Page context chip ────── */}
      <ContextChip
        url={omniBox.contextUrl}
        dismissed={omniBox.contextDismissed}
        onDismiss={omniBox.dismissContext}
        showHelp={false}
      />

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="rovo-panel__body" ref={bodyRef}>

        {/* Special panel modes */}
        {isInsightMode   && <InsightHelpPanel  insightId={insightHelpId!} onAskRovo={q => addUserMessage(q)} />}
        {isHelpMode      && <InAppHelpPanel    onAskRovo={q => addUserMessage(q)} />}
        {isArticlesMode  && <ReadArticlesPanel onAskRovo={q => addUserMessage(q)} contextInsightId={pageInsightId} />}
        {isCommunityMode && <CommunityPanel    onAskRovo={q => addUserMessage(q)} />}
        {isBugsMode      && <BugsPanel         onAskRovo={q => addUserMessage(q)} />}
        {isSupportInsightsMode && <SupportAiInsightsPanel onAskRovo={q => addUserMessage(q)} />}
        {isArticleMode   && omniBox.articleContext && (() => {
          const art = omniBox.articleContext;
          const isSupportInsight = art.category === 'Support Agent Insights';
          const isApplyFix = art.action === 'apply_fix';
          const summary = getAiSummary(art.title, true);
          const prompts = summary.followUps?.length ? summary.followUps : ['Ask a follow up question', 'Explain this in more detail', 'What are the best practices?'];
          return (
            <div className="rv-help rv-help--article">
              <h2 className="rv-help__article-detail-title">{art.title}</h2>
              {art.description && (
                <div className="rv-help__article-detail-summary">
                  <span className="rv-help__article-detail-label">Description</span>
                  <p className="rv-help__article-detail-summary-text">{art.description}</p>
                </div>
              )}
              {isApplyFix ? (
                <>
                  <div className="rv-help__article-detail-summary">
                    <span className="rv-help__article-detail-label">AI Summary — Next Steps</span>
                    <ul className="rv-help__fix-steps">
                      <li>Validate the &ldquo;Watchers&rdquo; custom field is present on the issue type scheme</li>
                      <li>Re-enable the &ldquo;Notify watchers on status change&rdquo; automation trigger</li>
                      <li>Add a guard condition to skip execution when the field is empty</li>
                      <li>Run a test transition to confirm notifications fire correctly</li>
                      <li>Monitor the rule execution log for 24 hours</li>
                    </ul>
                  </div>
                  <ApplyFixButton onCancel={() => omniBox.setArticleContext(omniBox.articleContext ? { ...omniBox.articleContext, action: undefined } : null)} onFixConfirmed={() => omniBox.setFixConfirmed(true)} />
                </>
              ) : (
              <div className="rv-help__article-detail-summary">
                <span className="rv-help__article-detail-label">AI Summary</span>
                <p className="rv-help__article-detail-summary-text">{summary.summary}</p>
              </div>
              )}
              {!isSupportInsight && (
                <div className="rv-help__article-detail-summary">
                  <span className="rv-help__article-detail-label">Description</span>
                  <p className="rv-help__article-detail-summary-text">{summary.summary}</p>
                </div>
              )}
              {!isSupportInsight && (
                <div className="rv-help__article-detail-meta">
                  <span className="rv-help__article-detail-cat">{art.category}</span>
                  <span className="rv-help__article-detail-dot">·</span>
                  <span>{art.updated}</span>
                  <span className="rv-help__article-detail-dot">·</span>
                  <span className="rv-help__article-detail-stat">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z"/></svg>
                    {art.views}
                  </span>
                  <span className="rv-help__article-detail-dot">·</span>
                  <span className="rv-help__article-detail-stat">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M5 14H2V7h3v7zm8-8h-4l1-4H8L5 6v8h8.5l1.5-6H13z"/></svg>
                    {art.thumbsUp}
                  </span>
                </div>
              )}
              {!isSupportInsight && art.href !== '/' && (
                <a href={art.href} target="_blank" rel="noopener noreferrer" className="rv-help__article-detail-open" title="Open in new tab">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                  Open in new tab
                </a>
              )}
              <div className="rv-help__article-detail-prompts">
                <span className="rv-help__article-detail-prompts-label">Relevant prompts</span>
                <div className="rv-help__article-detail-prompts-list">
                  {prompts.map(p => (
                    <button key={p} type="button" className="rv-help__article-detail-followup" onClick={() => addUserMessageWithSupportActions(p)}>
                      <RovoIcon size={13} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
        {isLiveChatMode  && (
          <div className="rv-help">
            <div className="rv-help__greeting">
              <svg width="36" height="36" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0065FF', flexShrink: 0 }} aria-hidden="true">
                <path d="M1 1h14v10H9l-4 4v-4H1V1z"/>
              </svg>
              <div>
                <h2 className="rv-help__greeting-title">Hi! I&rsquo;m Rovo, your live chat agent.</h2>
                <p className="rv-help__greeting-sub">
                  I&rsquo;m here to help you in real time. Describe your issue and I&rsquo;ll assist you right away,
                  or connect you with a human agent if needed.
                </p>
              </div>
            </div>

            {omniBox.query && (
              <div className="rv-help__context-box">
                <div className="rv-help__context-label">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 1H2a1 1 0 00-1 1v8a1 1 0 001 1h3l3 3 3-3h3a1 1 0 001-1V2a1 1 0 00-1-1z"/></svg>
                  Your issue
                </div>
                <p className="rv-help__context-query">{omniBox.query}</p>
                <p className="rv-help__context-note">This will be shared with the agent when you connect.</p>
              </div>
            )}
            {omniBox.loomAttachment && (
              <div className="rv-help__context-box rv-help__context-box--loom">
                <div className="rv-help__context-label">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1 3h10v10H1V3zm11 2l4-2v10l-4-2V5z"/></svg>
                  Screen recording attached
                </div>
                <a href={omniBox.loomAttachment.sharedUrl} target="_blank" rel="noopener noreferrer" className="rv-help__context-loom-link">
                  Watch recording
                </a>
                <p className="rv-help__context-note">The agent can view this when you connect.</p>
              </div>
            )}

            <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                className={`rv-help__external-link${connectingAgent ? ' rv-help__external-link--connecting' : ''}`}
                style={{ marginTop: 8 }}
                onClick={() => !connectingAgent && startLiveAgentConnect()}
                disabled={connectingAgent}
              >
                {connectingAgent ? (
                  <>
                    <span className="rovo-support-actions__spinner" />
                    Connecting with a live agent…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M1 1h14v10H9l-4 4v-4H1V1z"/>
                    </svg>
                    Connect with a live agent
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {isLoomSupportMode && (
          <div className="rv-help rv-help--loom-support">
            <div className="rv-help__greeting">
              <RovoIcon size={36} />
              <div>
                <h2 className="rv-help__greeting-title">Get support with your recording</h2>
                <p className="rv-help__greeting-sub">
                  I see you&rsquo;ve attached a screen recording. I can use it to understand your issue. Would you like to talk to a live agent or create a support ticket?
                </p>
              </div>
            </div>
            {omniBox.contextUrl && (
              <ContextChip
                url={omniBox.contextUrl}
                dismissed={omniBox.contextDismissed}
                onDismiss={omniBox.dismissContext}
                showHelp={false}
                showSupport={false}
              />
            )}
            {omniBox.loomAttachment && (
              <div className="rv-help__context-box rv-help__context-box--loom">
                <div className="rv-help__context-label">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1 3h10v10H1V3zm11 2l4-2v10l-4-2V5z"/></svg>
                  Screen recording attached
                </div>
                <a href={omniBox.loomAttachment.sharedUrl} target="_blank" rel="noopener noreferrer" className="rv-help__context-loom-link">
                  Watch recording
                </a>
              </div>
            )}
            <label className="rv-help__loom-checkbox">
              <input
                type="checkbox"
                checked={loomAttachedChecked}
                onChange={e => setLoomAttachedChecked(e.target.checked)}
                aria-label="Include recording with support request"
              />
              <span>Loom recording attached</span>
            </label>
            <div className="rovo-support-actions" style={{ marginTop: 12 }}>
              <p className="rovo-support-actions__label">Next steps</p>
              <div className="rovo-support-actions__buttons">
                <button
                  type="button"
                  className={`rovo-support-actions__btn rovo-support-actions__btn--agent${connectingAgent ? ' rovo-support-actions__btn--connecting' : ''}`}
                  onClick={() => !connectingAgent && startLiveAgentConnect()}
                  disabled={connectingAgent}
                >
                  {connectingAgent ? (
                    <>
                      <span className="rovo-support-actions__spinner" />
                      Connecting with a live agent…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M1 1h14v10H9l-4 4v-4H1V1z"/>
                      </svg>
                      Live Agent
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="rovo-support-actions__btn rovo-support-actions__btn--ticket"
                  onClick={() => { omniBox.openTicketForm(); }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
                    <path d="M5 5.5h6M5 8h6M5 10.5h4"/>
                  </svg>
                  Create ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty / home state — mirrors Rovo Material chat component */}
        {!hasMessages && !isSpecialPanel && (
          <div className="rovo-panel__home">
            <div className="rovo-panel__hero">
              <RovoIcon size={68} />
            </div>
            <h2 className="rovo-panel__greeting">Hey there</h2>
            <p className="rovo-panel__greeting-sub">What can I help you with today?</p>

            <div className="rovo-panel__cards">
              {SUGGESTION_CARDS.map(card => (
                <button
                  key={card.title}
                  className="rovo-suggestion-card"
                  onClick={() => addUserMessage(card.sub)}
                >
                  <span className="rovo-suggestion-card__icon">{card.icon}</span>
                  <strong className="rovo-suggestion-card__title">{card.title}</strong>
                  <p className="rovo-suggestion-card__sub">{card.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation thread */}
        {hasMessages && (
          <div className="rovo-panel__messages">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`rovo-msg rovo-msg--${msg.role}`}>

                {msg.role === 'assistant' && (
                  <div className="rovo-msg__avatar">
                    <RovoIcon size={20} />
                  </div>
                )}

                <div className="rovo-msg__body">
                  {msg.isTyping ? (
                    <div className="rovo-msg__typing">
                      <span /><span /><span />
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <>
                      <p className="rovo-msg__text">{msg.text}</p>

                      {/* Contextual chart / table */}
                      {msg.chartType === 'bar'    && <BarChart />}
                      {msg.chartType === 'line'   && <LineChart />}
                      {msg.chartType === 'donut'  && <DonutChart />}
                      {msg.chartType === 'table'  && <DataTable />}

                      {/* Key Findings + Recommendations */}
                      {idx === messages.length - 1 && msg.text.length > 100 && (
                        <>
                          <div className="rovo-section">
                            <p className="rovo-section__title">Key Findings</p>
                            <ul className="rovo-section__list">
                              <li>Average first response time decreased 15% over 30 days</li>
                              <li>P1/P2 tickets have 23% faster resolution</li>
                              <li>Customer satisfaction improved to 4.2 / 5.0</li>
                            </ul>
                          </div>
                          <div className="rovo-section">
                            <p className="rovo-section__title">Recommendations</p>
                            <ul className="rovo-section__list">
                              <li>Implement auto-categorisation for faster routing</li>
                              <li>Review peak-hours staffing to maintain SLAs</li>
                            </ul>
                          </div>
                        </>
                      )}

                      {/* Feedback row */}
                      {idx === messages.length - 1 && (
                        <div className="rovo-msg__feedback">
                          <button
                            className={`rovo-msg__fb-btn${thumbed === 'up' ? ' rovo-msg__fb-btn--active' : ''}`}
                            onClick={() => setThumbed('up')}
                            aria-label="Helpful"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5 14H2V7h3v7zm8-8h-4l1-4H8L5 6v8h8.5l1.5-6H13z"/>
                            </svg>
                          </button>
                          <button
                            className={`rovo-msg__fb-btn${thumbed === 'down' ? ' rovo-msg__fb-btn--active' : ''}`}
                            onClick={() => setThumbed('down')}
                            aria-label="Not helpful"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11 2h3v7h-3V2zm-8 8h4l-1 4h2l3-4V2H2.5L1 8H3z"/>
                            </svg>
                          </button>
                          <button
                            className="rovo-msg__fb-btn"
                            aria-label="Copy"
                            onClick={() => navigator.clipboard.writeText(msg.text)}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M4 4H1v11h9v-3H4V4zm2-3h9v11H6V1z"/>
                            </svg>
                          </button>
                          <button className="rovo-msg__fb-btn" aria-label="Regenerate">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M13.5 4A7 7 0 1115 8h-2a5 5 0 11-1.5-3.5L9 7h5V2l-2 2A7 7 0 0113.5 4z"/>
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* Support actions: Live Agent | Create a Support ticket (next best prompts after response) */}
                      {msg.showSupportActions && idx === messages.length - 1 && (
                        <div className="rovo-support-actions">
                          <p className="rovo-support-actions__label">Next steps</p>
                          <div className="rovo-support-actions__buttons">
                            <button
                              type="button"
                              className={`rovo-support-actions__btn rovo-support-actions__btn--agent${connectingAgent ? ' rovo-support-actions__btn--connecting' : ''}`}
                              onClick={() => !connectingAgent && startLiveAgentConnect()}
                              disabled={connectingAgent}
                            >
                              {connectingAgent ? (
                                <>
                                  <span className="rovo-support-actions__spinner" />
                                  Connecting with a live agent…
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                    <path d="M1 1h14v10H9l-4 4v-4H1V1z"/>
                                  </svg>
                                  Live Agent
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="rovo-support-actions__btn rovo-support-actions__btn--ticket"
                              onClick={() => omniBox.openTicketForm()}
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                <path d="M9 1H7v6H1v2h6v6h2V9h6V7H9V1z"/>
                              </svg>
                              Create a Support ticket
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Follow-up chips — click → loading → Live Chat | Create a ticket */}
                      {msg.followUps?.length && !msg.showSupportActions && idx === messages.length - 1 && (
                        <div className="rovo-followups">
                          <p className="rovo-followups__label">Try following up with:</p>
                          {msg.followUps.map(f => (
                            <button key={f} className="rovo-followup-chip" onClick={() => addUserMessageWithSupportActions(f)}>
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="rovo-msg__text">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input area — Rovo Material prompt-box style ────── */}
      <div className="rovo-panel__input-area">
        <form className="rovo-panel__input-form" onSubmit={handleSend}>
          <div className="rovo-panel__input-box">

            {/* Auto-expanding textarea */}
            <textarea
              ref={textareaRef}
              className="rovo-panel__textarea"
              value={inputVal}
              rows={1}
              placeholder={
                isLiveChatMode   ? 'Describe your issue…' :
                isLoomSupportMode ? 'Add a message (optional)…' :
                isInsightMode   ? 'Ask Rovo about this insight…' :
                isHelpMode      ? 'Ask Rovo anything… or search articles' :
                isCommunityMode ? 'Ask Rovo anything… or search community posts' :
                isBugsMode      ? 'Ask Rovo about a bug…' :
                'Ask Rovo anything...'
              }
              onChange={e => { setInputVal(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              aria-label="Ask Rovo anything"
            />

            {/* Bottom toolbar */}
            <div className="rovo-panel__input-toolbar">
              <button type="button" className="rovo-panel__tool-btn" aria-label="Add">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v12M2 8h12"/>
                </svg>
              </button>
              <button type="button" className="rovo-panel__tool-btn" aria-label="Voice input">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="1" width="6" height="9" rx="3"/>
                  <path d="M3 7a5 5 0 0010 0M8 14v2M5 16h6"/>
                </svg>
              </button>
              <button type="button" className="rovo-panel__tool-btn rovo-panel__tool-btn--loom" aria-label="Loom">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
              </button>

              {/* Send — dark charcoal circle (Rovo Material) */}
              <button
                type="submit"
                className={`rovo-panel__send${inputVal.trim() ? ' rovo-panel__send--active' : ''}`}
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 3.5L2.5 9l1.06 1.06L8 5.62l4.44 4.44L13.5 9 8 3.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
