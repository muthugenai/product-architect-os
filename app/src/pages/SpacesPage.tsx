import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { OmniBoxContext } from '../hooks/useOmniBox';
import type { RovoMode } from '../App';
import { RovoIcon } from '../components/icons/RovoIcon';
import './SpacesPage.css';

type SpaceType = 'team-managed software' | 'team-managed business' | 'company-managed business';

interface Space {
  id: string;
  name: string;
  key: string;
  type: SpaceType;
  lead: { name: string; avatar?: string };
  category?: string;
  spaceUrl?: string;
  iconLetter: string;
  iconColor: string;
}

const MOCK_SPACES: Space[] = [
  { id: '1', name: 'Engineering Whiteboard for Platform Foundation', key: 'LWPFH', type: 'team-managed software', lead: { name: 'Ashish Dobhal' }, iconLetter: 'E', iconColor: '#36b37e' },
  { id: '2', name: 'Test Guild', key: 'TG', type: 'team-managed business', lead: { name: 'Sascha Wiswede' }, iconLetter: 'T', iconColor: '#6554c0' },
  { id: '3', name: 'ADO SPO', key: 'ADOSP', type: 'team-managed software', lead: { name: 'Luanne Andrew' }, iconLetter: 'A', iconColor: '#0065ff' },
  { id: '4', name: 'AWS Transformation', key: 'AWSTXNM', type: 'company-managed business', lead: { name: 'Andrew Goyaji' }, iconLetter: 'A', iconColor: '#ff8b00' },
  { id: '5', name: 'Central AI - Vespers', key: 'VESPERS', type: 'team-managed software', lead: { name: 'Mark Lasseter' }, iconLetter: 'C', iconColor: '#00875a' },
  { id: '6', name: 'Compensation Planning', key: 'COMPPLAN', type: 'team-managed business', lead: { name: 'Anand Sreeer' }, iconLetter: 'C', iconColor: '#de350b' },
  { id: '7', name: 'Data Mobility Support Team', key: 'DMST', type: 'company-managed business', lead: { name: 'Charles Mendels' }, iconLetter: 'D', iconColor: '#00c7e6' },
  { id: '8', name: 'Decisions', key: 'DECISION', type: 'team-managed software', lead: { name: 'Byron Walker' }, category: 'Yak Shaving', iconLetter: 'D', iconColor: '#6554c0' },
  { id: '9', name: 'DevTools Visualization', key: 'SBDMDMZ', type: 'team-managed software', lead: { name: 'Jason Birch' }, iconLetter: 'D', iconColor: '#ff8b00' },
  { id: '10', name: 'Engagement and Friction Insights', key: 'EFI', type: 'team-managed business', lead: { name: 'Samir Katel' }, iconLetter: 'E', iconColor: '#36b37e' },
];

const FILTER_OPTIONS = [
  { id: 'software', label: 'Jira - software spaces' },
  { id: 'business', label: 'Jira - business spaces' },
];

const PAGE_ERROR = {
  title: 'Space indexing failure on 4 projects',
  message: 'Projects LWPFH, ADOSP, VESPERS, and DMST failed to index during the last sync. Space search results may be incomplete or stale until re-indexing completes.',
  actionLabel: 'Ask Rovo',
};

const RECOMMENDED_ACTION = {
  title: 'Recommended action',
  body: 'Trigger a manual re-index for the affected projects from Admin > Indexing. If the issue persists, check the Jira system log for heap memory errors and consider increasing the indexing thread pool size.',
};

const PREDICTIVE_WARNING = {
  title: 'Index storage nearing capacity',
  message: 'The Jira space index is at 89% capacity. At the current growth rate, indexing will start failing within 5 days, causing spaces to disappear from search results.',
  preventLabel: 'Preempt failure',
};

const GOD_MODE_MESSAGE = 'Re-indexed all affected spaces and expanded storage automatically!';

interface SpacesPageProps {
  omniBox?: OmniBoxContext;
  rovoMode?: RovoMode;
}

type PageState = 'loading' | 'loaded' | 'error' | 'empty';

export const SpacesPage: React.FC<SpacesPageProps> = ({ omniBox, rovoMode = 'reactive' }) => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['software', 'business']);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loaded');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [sortAsc, setSortAsc] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [godMessageVisible, setGodMessageVisible] = useState(true);
  const [fixApplied, setFixApplied] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === '1') setPageState('error');
  }, [searchParams]);

  useEffect(() => {
    setFixApplied(false);
    if (rovoMode !== 'god') { setGodMessageVisible(true); return; }
    const t = setTimeout(() => setGodMessageVisible(false), 4400);
    return () => clearTimeout(t);
  }, [rovoMode]);

  const handleAskRovo = () => {
    if (!omniBox) return;
    omniBox.setQuery(`${PAGE_ERROR.title}: ${PAGE_ERROR.message}`);
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'Jira · Indexing', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handleFollowUp = () => {
    if (!omniBox) return;
    omniBox.setQuery('How can I fix space indexing failures and prevent them in the future?');
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'Jira · Indexing', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handlePreventFix = () => {
    if (!omniBox) return;
    omniBox.setQuery('Preempt index failure: expand storage and optimise indexing before capacity is reached');
    omniBox.setArticleContext({ title: PREDICTIVE_WARNING.title, category: 'Jira · At Risk', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handleApplyRecommendedFix = () => {
    if (!omniBox) return;
    omniBox.setQuery('Re-index affected projects and resolve sync failures');
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'Jira · Indexing', updated: '', views: '', thumbsUp: 0, href: '#', action: 'apply_fix' });
    omniBox.openChatPanel('__article__');
  };

  useEffect(() => {
    if (omniBox?.fixConfirmed) setFixApplied(true);
  }, [omniBox?.fixConfirmed]);

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [categoryDropdownOpen]);

  const removeFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== id));
  };

  const filteredSpaces = useMemo(() => {
    let list = MOCK_SPACES.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSoftware = !activeFilters.includes('software') || s.type.includes('software');
      const matchesBusiness = !activeFilters.includes('business') || s.type.includes('business');
      return matchesSearch && (matchesSoftware || matchesBusiness);
    });
    list = [...list].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [searchQuery, activeFilters, sortAsc]);

  const forceEmpty = searchParams.get('empty') === '1';
  const showEmptyState = pageState === 'loaded' && (MOCK_SPACES.length === 0 || forceEmpty);
  const showNoResults = pageState === 'loaded' && !forceEmpty && MOCK_SPACES.length > 0 && filteredSpaces.length === 0;
  const showError = pageState === 'error';
  const showTable = pageState === 'loaded' && !showEmptyState && filteredSpaces.length > 0;

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="spaces-page">
      {/* ── Rovo Mode Alerts ─────────────────────────────────── */}
      {rovoMode === 'reactive' && (
        <div className="spaces-page__rovo-error" role="alert">
          <span className="spaces-page__rovo-error-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </span>
          <div className="spaces-page__rovo-error-content">
            <button type="button" className="spaces-page__rovo-error-title spaces-page__rovo-error-title--link" onClick={handleAskRovo} disabled={!omniBox}>{PAGE_ERROR.title}</button>
            <p className="spaces-page__rovo-error-message">{PAGE_ERROR.message}</p>
          </div>
          <button type="button" className="spaces-page__rovo-error-action" onClick={handleAskRovo} disabled={!omniBox}>
            <RovoIcon size={16} />{PAGE_ERROR.actionLabel}
          </button>
        </div>
      )}

      {rovoMode === 'proactive' && !fixApplied && (
        <div className="spaces-page__rovo-alert-block">
          <div className="spaces-page__rovo-error spaces-page__rovo-error--no-action" role="alert">
            <span className="spaces-page__rovo-error-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </span>
            <div className="spaces-page__rovo-error-content">
              <button type="button" className="spaces-page__rovo-error-title spaces-page__rovo-error-title--link" onClick={handleAskRovo} disabled={!omniBox}>{PAGE_ERROR.title}</button>
              <p className="spaces-page__rovo-error-message">{PAGE_ERROR.message}</p>
            </div>
          </div>
          {omniBox?.ticketCreatedByAgent ? (
            <div className="spaces-page__rovo-recommended spaces-page__rovo-recommended--ticket-created" role="status">
              <strong className="spaces-page__rovo-recommended-title">Ticket created</strong>
              <p className="spaces-page__rovo-recommended-body">The live agent has created a support ticket for this issue. <a href="#" className="spaces-page__ticket-created-link">WPT-1042</a> is open and assigned to the queue manager.</p>
            </div>
          ) : (
            <div className="spaces-page__rovo-recommended">
              <strong className="spaces-page__rovo-recommended-title">{RECOMMENDED_ACTION.title}</strong>
              <p className="spaces-page__rovo-recommended-body">{RECOMMENDED_ACTION.body}</p>
              <div className="spaces-page__rovo-recommended-actions">
                <button type="button" className="spaces-page__rovo-error-action" onClick={handleApplyRecommendedFix} disabled={!omniBox}><RovoIcon size={16} />Apply recommended fix</button>
                <button type="button" className="spaces-page__rovo-error-action" onClick={handleFollowUp} disabled={!omniBox}><RovoIcon size={16} />Ask a follow up question</button>
              </div>
            </div>
          )}
        </div>
      )}

      {rovoMode === 'predictive' && (
        <div className="spaces-page__rovo-warning" role="alert">
          <span className="spaces-page__rovo-warning-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
          </span>
          <div className="spaces-page__rovo-warning-content">
            <strong className="spaces-page__rovo-warning-title">{PREDICTIVE_WARNING.title}</strong>
            <p className="spaces-page__rovo-warning-message">{PREDICTIVE_WARNING.message}</p>
          </div>
          <button type="button" className="spaces-page__rovo-error-action" onClick={handlePreventFix} disabled={!omniBox} title="Preempt error"><RovoIcon size={16} />{PREDICTIVE_WARNING.preventLabel}</button>
        </div>
      )}

      {rovoMode === 'god' && godMessageVisible && (
        <div className="spaces-page__rovo-god-message" role="status" aria-live="polite"><RovoIcon size={18} /><span>{GOD_MODE_MESSAGE}</span></div>
      )}

      <div className={`spaces-page__content${rovoMode === 'god' && !godMessageVisible ? ' spaces-page__content--god-after-message' : ''}`}>
        <h1 className="spaces-page__title">Spaces</h1>

        <div className="spaces-page__toolbar">
          <div className="spaces-page__search-wrap">
            <svg className="spaces-page__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5"/>
              <path d="M11 11l3 3"/>
            </svg>
            <input
              type="text"
              className="spaces-page__search"
              placeholder="Search spaces"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search spaces"
            />
          </div>
          <div className="spaces-page__filters">
            {activeFilters.map((id) => {
              const opt = FILTER_OPTIONS.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <span key={id} className="spaces-page__filter-tag">
                  {opt.label}
                  <button type="button" className="spaces-page__filter-tag-remove" onClick={() => removeFilter(id)} aria-label={`Remove ${opt.label}`}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4L4 12M4 4l8 8"/></svg>
                  </button>
                </span>
              );
            })}
            <div className="spaces-page__category-wrap" ref={categoryRef}>
              <button
                type="button"
                className="spaces-page__category-btn"
                onClick={() => setCategoryDropdownOpen((o) => !o)}
                aria-expanded={categoryDropdownOpen}
                aria-haspopup="listbox"
              >
                All categories
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: categoryDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              </button>
              {categoryDropdownOpen && (
                <ul className="spaces-page__category-menu" role="listbox">
                  <li><button type="button" className="spaces-page__category-item">Software</button></li>
                  <li><button type="button" className="spaces-page__category-item">Business</button></li>
                  <li><button type="button" className="spaces-page__category-item">Company-managed</button></li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Error: Failed to load */}
        {showError && (
          <div className="spaces-page__error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spaces-page__error-icon" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <div className="spaces-page__error-content">
              <strong className="spaces-page__error-title">Failed to load spaces</strong>
              <p className="spaces-page__error-message">We couldn’t load the spaces list. Check your connection and try again.</p>
            </div>
            <button type="button" className="spaces-page__error-retry" onClick={() => setPageState('loaded')}>
              Try again
            </button>
          </div>
        )}

        {/* Empty state: No spaces at all */}
        {showEmptyState && (
          <div className="spaces-page__empty">
            <div className="spaces-page__empty-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2V2zm2 2v8h8V4H4z"/></svg>
            </div>
            <h2 className="spaces-page__empty-title">No spaces yet</h2>
            <p className="spaces-page__empty-desc">Create a space to get started and collaborate with your team.</p>
            <button type="button" className="spaces-page__empty-cta">Create space</button>
          </div>
        )}

        {/* No search/filter results */}
        {showNoResults && (
          <div className="spaces-page__no-results" role="status">
            <p className="spaces-page__no-results-text">No spaces match your search or filters. Try different keywords or remove a filter.</p>
          </div>
        )}

        {/* Table */}
        {showTable && (
          <div className="spaces-page__table-wrap">
            <table className="spaces-page__table" role="grid">
              <thead>
                <tr>
                  <th className="spaces-page__th spaces-page__th--name">
                    <button type="button" className="spaces-page__sort-btn" onClick={() => setSortAsc((a) => !a)} aria-sort={sortAsc ? 'ascending' : 'descending'}>
                      Name
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="spaces-page__sort-icon">
                        <path d="M4 6l4 4 4-4"/>
                      </svg>
                    </button>
                  </th>
                  <th className="spaces-page__th">Key</th>
                  <th className="spaces-page__th">Type</th>
                  <th className="spaces-page__th">Lead</th>
                  <th className="spaces-page__th">Category</th>
                  <th className="spaces-page__th">Space URL</th>
                  <th className="spaces-page__th spaces-page__th--actions" aria-label="Actions"/>
                </tr>
              </thead>
              <tbody>
                {filteredSpaces.map((space) => (
                  <tr
                    key={space.id}
                    className="spaces-page__row"
                    onMouseEnter={() => setHoveredRowId(space.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <td className="spaces-page__td spaces-page__td--name">
                      <button type="button" className="spaces-page__star" onClick={() => toggleStar(space.id)} aria-label={starredIds.has(space.id) ? 'Unstar' : 'Star'}>
                        {starredIds.has(space.id) ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/></svg>
                        )}
                      </button>
                      <span className="spaces-page__space-icon" style={{ background: space.iconColor }}>{space.iconLetter}</span>
                      <span className="spaces-page__space-name">{space.name}</span>
                    </td>
                    <td className="spaces-page__td">{space.key}</td>
                    <td className="spaces-page__td">{space.type}</td>
                    <td className="spaces-page__td">
                      <span className="spaces-page__lead">
                        {space.lead.avatar ? (
                          <img src={space.lead.avatar} alt="" className="spaces-page__lead-avatar" />
                        ) : (
                          <span className="spaces-page__lead-avatar spaces-page__lead-avatar--fallback">{space.lead.name.charAt(0)}</span>
                        )}
                        {space.lead.name}
                      </span>
                    </td>
                    <td className="spaces-page__td">{space.category || '—'}</td>
                    <td className="spaces-page__td">{space.spaceUrl || '—'}</td>
                    <td className="spaces-page__td spaces-page__td--actions">
                      {hoveredRowId === space.id && (
                        <button type="button" className="spaces-page__more" aria-label="More actions" title="More actions">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="3" r="1.5"/>
                            <circle cx="8" cy="8" r="1.5"/>
                            <circle cx="8" cy="13" r="1.5"/>
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Simulate error: visit /spaces?error=1 to see failed load state */}
      </div>
    </div>
  );
};
