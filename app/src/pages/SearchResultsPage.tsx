import React, { useState, useEffect } from 'react';
import { RovoIcon } from '../components/icons/RovoIcon';
import type { OmniBoxContext } from '../hooks/useOmniBox';
import { getSearchResults } from '../data/mockSearchResults';
import { getAiSummary, getRelevantPrompts, getSuggestedFix } from '../data/mockAiSummaries';
import './SearchResultsPage.css';

type ResultTab = 'all' | 'help' | 'community' | 'videos';

interface SearchResultsPageProps {
  omniBox: OmniBoxContext;
}

/* Mock community and video results for sub-tabs (Atlassian-style) */
const MOCK_COMMUNITY = [
  { id: 'c1', title: 'How to auto-escalate tickets based on priority in JSM', author: 'Sarah K.', replies: 14, solved: true, href: 'https://community.atlassian.com/t5/Jira-Service-Management/auto-escalate/qaq-p/1234' },
  { id: 'c2', title: 'Best practice for setting up SLA breach alerts', author: 'Marcus T.', replies: 9, solved: true, href: 'https://community.atlassian.com/t5/Jira-Service-Management/sla-alerts/qaq-p/1235' },
  { id: 'c3', title: 'Automation rule not firing on subtask creation', author: 'James L.', replies: 6, solved: false, href: 'https://community.atlassian.com/t5/Jira-Service-Management/automation/qaq-p/1236' },
];
const MOCK_VIDEOS = [
  { id: 'v1', title: 'Getting started with Jira Service Management', channel: 'Atlassian', duration: '4:32', href: 'https://www.youtube.com/watch?v=example1' },
  { id: 'v2', title: 'How to configure SLA policies in JSM', channel: 'Atlassian', duration: '7:15', href: 'https://www.youtube.com/watch?v=example2' },
  { id: 'v3', title: 'Automation rules deep dive', channel: 'Atlassian University', duration: '12:04', href: 'https://www.youtube.com/watch?v=example3' },
];

const TABS: { id: ResultTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'help', label: 'Help Pages' },
  { id: 'community', label: 'Community' },
  { id: 'videos', label: 'Videos' },
];

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ omniBox }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ResultTab>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent'>('relevance');
  const query = omniBox.searchQuery;
  const results = getSearchResults(query);
  const aiSummary = getAiSummary(query);
  const prompts = getRelevantPrompts(query);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [query]);

  const showHelp = activeTab === 'all' || activeTab === 'help';
  const showCommunity = activeTab === 'all' || activeTab === 'community';
  const showVideos = activeTab === 'all' || activeTab === 'videos';

  const openFollowUp = () => {
    omniBox.setQuery(query);
    omniBox.setArticleContext({
      title: query,
      category: 'Search',
      updated: '',
      views: '',
      thumbsUp: 0,
      href: '#',
    });
    omniBox.openChatPanel('__followup__');
  };

  return (
    <div className="srp">
      <div className="srp__back-bar">
        <button
          type="button"
          className="srp__back-link"
          onClick={() => omniBox.clearSearch()}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          Back
        </button>
        <span className="srp__query-label">
          Results for &ldquo;{query}&rdquo;
        </span>
      </div>

      {loading ? (
        <div className="srp__loading">
          <div className="srp__spinner" />
          <span>Rovo is thinking&hellip;</span>
        </div>
      ) : (
        <div className="srp__content">
          {/* Sub-tabs (Reddit-style) — Atlassian ADS */}
          <div className="srp__tabs-wrap">
            <div className="srp__tabs" role="tablist" aria-label="Result type">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`srp__tab${activeTab === tab.id ? ' srp__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="srp__filters">
              <select
                className="srp__filter-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'relevance' | 'recent')}
                aria-label="Sort by"
              >
                <option value="relevance">Relevance</option>
                <option value="recent">Recent</option>
              </select>
              <span className="srp__filter-meta">All time</span>
            </div>
          </div>

          {/* AI Summary — Answers style (Reddit) + Atlassian card */}
          <div className="srp__ai-summary">
            <div className="srp__ai-header">
              <RovoIcon size={20} />
              <span className="srp__ai-label">Answers</span>
              <span className="srp__ai-sources">Sources: Help docs, Community +2 more</span>
            </div>
            <p className="srp__ai-text">{aiSummary.summary}</p>
            <div className="srp__ai-actions">
              <div className="srp__suggested-fix">
                <span className="srp__suggested-fix-label">Suggested fix</span>
                <p className="srp__suggested-fix-text">{getSuggestedFix(query)}</p>
                <button type="button" className="srp__apply-fix-btn" onClick={openFollowUp} title="Apply fix with Rovo">
                  <RovoIcon size={16} />
                  Apply Fix
                </button>
              </div>
              <button type="button" className="srp__follow-up-btn" onClick={openFollowUp}>
                <RovoIcon size={14} />
                Ask a follow-up question
              </button>
              {aiSummary.followUps.length > 0 && (
                <div className="srp__followups">
                  {aiSummary.followUps.map(f => (
                    <button
                      key={f}
                      className="srp__followup-chip"
                      onClick={() => omniBox.submitSearch(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="srp__columns">
            <div className="srp__main">
              {/* Suggested prompts */}
              {prompts.length > 0 && (
                <div className="srp__section">
                  <div className="srp__section-title">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/>
                    </svg>
                    Suggested Prompts
                  </div>
                  <div className="srp__prompt-list">
                    {prompts.map(p => (
                      <button
                        key={p}
                        className="srp__prompt-btn"
                        onClick={() => omniBox.submitSearch(p)}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="6.5" cy="6.5" r="5"/>
                          <path d="M10.5 10.5L14 14"/>
                        </svg>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Pages results */}
              {showHelp && (
                <div className="srp__section">
                  <div className="srp__section-title">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 2h9l3 3v9H2V2zm2 2v8h8V6H9V4H4zm2 3h4v1H6V7zm0 2h4v1H6V9z"/>
                    </svg>
                    Help Pages
                  </div>
                  <ul className="srp__results">
                    {results.map(r => (
                      <li key={r.id} className="srp__result">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="srp__result-icon">
                          <path d="M2 1h9l3 3v11H2V1zm8 0v3h3"/>
                        </svg>
                        <div className="srp__result-body">
                          <a href={r.url} className="srp__result-title" target="_blank" rel="noopener noreferrer">
                            {r.title}
                          </a>
                          <span className="srp__result-cat">{r.category}</span>
                        </div>
                        <div className="srp__result-actions">
                          <button type="button" className="srp__result-action" title="Ask Rovo about this" onClick={() => { omniBox.setQuery(r.title); omniBox.setArticleContext({ title: r.title, category: r.category, updated: '', views: '', thumbsUp: 0, href: r.url }); omniBox.openChatPanel('__article__'); }}>
                            <RovoIcon size={13} />
                          </button>
                          <button type="button" className="srp__result-action" title="Open in new tab" onClick={() => window.open(r.url, '_blank')}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/></svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Community results */}
              {showCommunity && (
                <div className="srp__section">
                  <div className="srp__section-title">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h9v7H7l-3 3V8H1V1zm10 3h4v7h-2v3l-3-3h-1V8h1V4h1z"/></svg>
                    Community
                  </div>
                  <ul className="srp__results srp__results--community">
                    {MOCK_COMMUNITY.map(c => (
                      <li key={c.id} className="srp__result">
                        <div className="srp__result-body">
                          <a href={c.href} className="srp__result-title" target="_blank" rel="noopener noreferrer">{c.title}</a>
                          <span className="srp__result-cat">by {c.author} · {c.replies} replies{c.solved ? ' · Solved' : ''}</span>
                        </div>
                        <button type="button" className="srp__result-action" title="Ask Rovo" onClick={() => { omniBox.setQuery(c.title); omniBox.setArticleContext({ title: c.title, category: `Community · ${c.author}`, updated: '', views: '', thumbsUp: 0, href: c.href }); omniBox.openChatPanel('__article__'); }}>
                          <RovoIcon size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Videos results */}
              {showVideos && (
                <div className="srp__section">
                  <div className="srp__section-title">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h10v10H1V3zm11 2l4-2v10l-4-2V5z"/></svg>
                    Videos
                  </div>
                  <ul className="srp__results srp__results--videos">
                    {MOCK_VIDEOS.map(v => (
                      <li key={v.id} className="srp__result">
                        <span className="srp__video-thumb">🎬</span>
                        <div className="srp__result-body">
                          <a href={v.href} className="srp__result-title" target="_blank" rel="noopener noreferrer">{v.title}</a>
                          <span className="srp__result-cat">{v.channel} · {v.duration}</span>
                        </div>
                        <button type="button" className="srp__result-action" title="Ask Rovo" onClick={() => { omniBox.setQuery(v.title); omniBox.setArticleContext({ title: v.title, category: `${v.channel} · ${v.duration}`, updated: '', views: '', thumbsUp: 0, href: v.href }); omniBox.openChatPanel('__article__'); }}>
                          <RovoIcon size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab !== 'all' && showHelp && results.length === 0 && activeTab === 'help' && (
                <div className="srp__empty">No help pages match this search.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
