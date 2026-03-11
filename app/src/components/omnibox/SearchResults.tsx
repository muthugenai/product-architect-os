import React, { useState, useEffect } from 'react';
import { RovoIcon } from '../icons/RovoIcon';
import { ContextChip } from './ContextChip';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import type { RecentQuestion } from '../../data/mockRecentQuestions';
import { getSearchResults } from '../../data/mockSearchResults';
import { getAiSummary, getRelevantPrompts } from '../../data/mockAiSummaries';
import './SearchResults.css';

interface SearchResultsProps {
  omniBox: OmniBoxContext;
  recentQuestions: RecentQuestion[];
  onQuerySubmit: (q: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ omniBox, recentQuestions, onQuerySubmit }) => {
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(omniBox.query);

  const results = getSearchResults(omniBox.query);
  const aiSummary = getAiSummary(omniBox.query);
  const relevantPrompts = getRelevantPrompts(localQuery);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [omniBox.query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) onQuerySubmit(localQuery.trim());
  };

  return (
    <div className="omnibox-popup" role="dialog" aria-label="Search Results" aria-modal="true">
      {/* Header */}
      <div className="omnibox-popup__header">
        <RovoIcon size={22} />
        <span className="omnibox-popup__title">Ask Rovo for Help</span>
        <button className="omnibox-popup__close-btn" onClick={omniBox.close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Input — Rovo Material textarea style */}
      <div className="omnibox-popup__input-wrap">
        <form onSubmit={handleSubmit} className="omnibox-popup__form">
          <input
            className="omnibox-popup__textarea"
            type="text"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            aria-label="Search query"
            autoComplete="off"
          />
          <div className="omnibox-popup__toolbar">
            <div className="omnibox-popup__toolbar-left">
              <button type="button" className="omnibox-popup__tool-btn" aria-label="Add">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v12M2 8h12"/>
                </svg>
              </button>
              <button type="button" className="omnibox-popup__tool-btn" aria-label="Voice">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="1" width="6" height="9" rx="3"/>
                  <path d="M3 7a5 5 0 0010 0M8 14v2M5 16h6"/>
                </svg>
              </button>
            </div>
            <div className="omnibox-popup__toolbar-right">
              <button type="button" className="omnibox-popup__tool-btn" onClick={omniBox.openCaseTracker} aria-label="View history">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6.5"/><path d="M8 5v3.5l2 1.5"/>
                </svg>
              </button>
              <button type="submit" className="omnibox-popup__send omnibox-popup__send--active" aria-label="Send">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 1l13 7-13 7V10l8-2-8-2V1z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      <ContextChip url={omniBox.contextUrl} dismissed={omniBox.contextDismissed} onDismiss={omniBox.dismissContext} onNavigate={omniBox.close} />
      <div className="omnibox-popup__divider" />

      {/* Content */}
      <div className="search-results__body">
        {loading ? (
          <div className="search-results__loading">
            <div className="search-results__spinner" />
            <span>Rovo is thinking…</span>
          </div>
        ) : (
          <>
            {/* AI Summary */}
            <div className="ai-summary">
              <div className="ai-summary__header">
                <RovoIcon size={20} />
                <span className="ai-summary__label">AI SUMMARY</span>
              </div>
              <p className="ai-summary__text">{aiSummary.summary}</p>
            </div>

            {/* Relevant prompts — updates as user types */}
            {relevantPrompts.length > 0 && (
              <div className="search-results__relevant-prompts">
                <div className="search-results__relevant-prompts__label">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/>
                  </svg>
                  Suggested prompts
                </div>
                <div className="search-results__relevant-prompts__list">
                  {relevantPrompts.map(p => (
                    <button
                      key={p}
                      className="search-results__relevant-prompt"
                      onClick={() => { setLocalQuery(p); onQuerySubmit(p); }}
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

            {/* Results */}
            <div className="search-results__list-section">
              <div className="search-results__list-title">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.5 1a5.5 5.5 0 014.383 8.823L15 14l-1 1-4.177-4.117A5.5 5.5 0 116.5 1zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"/>
                </svg>
                RELEVANT SEARCH RESULTS
              </div>
              <ul className="search-results__list">
                {results.map(r => (
                  <li key={r.id}>
                    <a href={r.url} className="search-result-item" onClick={e => { e.preventDefault(); window.location.href = r.url; }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="search-result-item__icon">
                        <path d="M2 1h9l3 3v11H2V1zm8 0v3h3"/>
                      </svg>
                      <div className="search-result-item__content">
                        <div className="search-result-item__title">{r.title}</div>
                        <div className="search-result-item__category">{r.category}</div>
                      </div>
                      <div className="search-result-item__actions">
                        <button
                          type="button"
                          className="search-result-item__action-btn"
                          title="Open in Rovo"
                          aria-label="Open in Rovo sidebar"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); omniBox.openChatPanel(r.title); }}
                        >
                          <RovoIcon size={13} />
                        </button>
                        <button
                          type="button"
                          className="search-result-item__action-btn"
                          title="Open in new window"
                          aria-label="Open in new window"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(r.url, '_blank'); }}
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11 1h4v4h-2V3.41L6.41 10 5 8.59 11.59 2H9V0h4V1zM1 3h6v2H3v8h8V9h2v5H1V3z"/>
                          </svg>
                        </button>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow-ups */}
            {aiSummary.followUps.length > 0 && (
              <div className="search-results__followups">
                <div className="search-results__list-title">FOLLOW-UP QUESTIONS</div>
                <div className="search-results__followup-chips">
                  {aiSummary.followUps.map(f => (
                    <button key={f} className="btn btn-subtle search-results__chip" onClick={() => onQuerySubmit(f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="omnibox-popup__footer">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/></svg>
        Uses AI. Verify results.
      </div>
    </div>
  );
};
