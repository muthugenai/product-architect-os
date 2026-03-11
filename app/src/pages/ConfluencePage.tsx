import React, { useState, useEffect } from 'react';
import type { OmniBoxContext } from '../hooks/useOmniBox';
import type { RovoMode } from '../App';
import { RovoIcon } from '../components/icons/RovoIcon';
import './ConfluencePage.css';

interface ConfluencePageProps {
  omniBox?: OmniBoxContext;
  rovoMode?: RovoMode;
}

const PAGE_ERROR = {
  title: 'Macro failed to render',
  message: 'The "Status" macro could not be displayed. This can happen when the macro has been removed, the app is unavailable, or the macro has invalid configuration.',
  actionLabel: 'Ask Rovo',
};

const RECOMMENDED_ACTION = {
  title: 'Recommended action',
  body: 'Reinstall or update the Status macro from the Marketplace, or replace it with a supported macro. Check space permissions if the macro is app-based. You can also remove the macro placeholder and save the page to restore rendering.',
};

const PREDICTIVE_WARNING = {
  title: 'Broken macro risk on this page',
  message: 'The "Status" macro on this page may fail after the upcoming Confluence upgrade. It uses a deprecated API that will be removed in the next release.',
  preventLabel: 'Preempt failure',
};

const GOD_MODE_MESSAGE = 'Macro fixed and page rendered successfully!';

const RELATED_PAGES = [
  { title: 'Getting started with Confluence', space: 'Product', href: '#', updated: '2 days ago' },
  { title: 'Creating and editing pages', space: 'Documentation', href: '#', updated: '1 week ago' },
  { title: 'Using the new editor', space: 'Product', href: '#', updated: '3 days ago' },
  { title: 'Confluence and Jira integration', space: 'Integrations', href: '#', updated: '5 days ago' },
  { title: 'Page templates and blueprints', space: 'Documentation', href: '#', updated: '1 week ago' },
];

export const ConfluencePage: React.FC<ConfluencePageProps> = ({ omniBox, rovoMode = 'reactive' }) => {
  const [godMessageVisible, setGodMessageVisible] = useState(true);
  const [fixApplied, setFixApplied] = useState(false);

  useEffect(() => {
    setFixApplied(false);
    if (rovoMode !== 'god') {
      setGodMessageVisible(true);
      return;
    }
    const t = setTimeout(() => setGodMessageVisible(false), 4400);
    return () => clearTimeout(t);
  }, [rovoMode]);

  const handleAskRovo = () => {
    if (!omniBox) return;
    const query = `${PAGE_ERROR.title}: ${PAGE_ERROR.message}`;
    omniBox.setQuery(query);
    omniBox.setArticleContext({
      title: PAGE_ERROR.title,
      category: 'Confluence · Error',
      updated: '',
      views: '',
      thumbsUp: 0,
      href: '#',
    });
    omniBox.openChatPanel('__article__');
  };

  const handleFollowUp = () => {
    if (!omniBox) return;
    omniBox.setQuery('How do I fix a failed macro and prevent it from breaking again?');
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'Confluence · Error', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handlePreventFix = () => {
    if (!omniBox) return;
    omniBox.setQuery('Preempt failure: replace or update the Status macro before the Confluence upgrade');
    omniBox.setArticleContext({ title: PREDICTIVE_WARNING.title, category: 'Confluence · At Risk', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handleApplyRecommendedFix = () => {
    if (!omniBox) return;
    omniBox.setQuery('Apply the recommended fix for the failed Status macro');
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'Confluence · Error', updated: '', views: '', thumbsUp: 0, href: '#', action: 'apply_fix' });
    omniBox.openChatPanel('__article__');
  };

  useEffect(() => {
    if (omniBox?.fixConfirmed) setFixApplied(true);
  }, [omniBox?.fixConfirmed]);

  return (
    <div className="confluence-page">
      {/* ── Rovo Mode Alerts ─────────────────────────────────── */}
      {rovoMode === 'reactive' && (
        <div className="confluence-page__error" role="alert">
          <span className="confluence-page__error-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </span>
          <div className="confluence-page__error-content">
            <button type="button" className="confluence-page__error-title confluence-page__error-title--link" onClick={handleAskRovo} disabled={!omniBox}>{PAGE_ERROR.title}</button>
            <p className="confluence-page__error-message">{PAGE_ERROR.message}</p>
          </div>
          <button
            type="button"
            className="confluence-page__error-action"
            onClick={handleAskRovo}
            disabled={!omniBox}
          >
            <RovoIcon size={16} />{PAGE_ERROR.actionLabel}
          </button>
        </div>
      )}

      {rovoMode === 'proactive' && !fixApplied && (
        <div className="confluence-page__alert-block">
          <div className="confluence-page__error confluence-page__error--no-action" role="alert">
            <span className="confluence-page__error-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </span>
            <div className="confluence-page__error-content">
              <button type="button" className="confluence-page__error-title confluence-page__error-title--link" onClick={handleAskRovo} disabled={!omniBox}>{PAGE_ERROR.title}</button>
              <p className="confluence-page__error-message">{PAGE_ERROR.message}</p>
            </div>
          </div>
          {omniBox?.ticketCreatedByAgent ? (
            <div className="confluence-page__recommended confluence-page__recommended--ticket-created" role="status">
              <strong className="confluence-page__recommended-title">Ticket created</strong>
              <p className="confluence-page__recommended-body">The live agent has created a support ticket for this issue. <a href="#" className="confluence-page__ticket-created-link">WPT-1042</a> is open and assigned to the queue manager.</p>
            </div>
          ) : (
            <div className="confluence-page__recommended">
              <strong className="confluence-page__recommended-title">{RECOMMENDED_ACTION.title}</strong>
              <p className="confluence-page__recommended-body">{RECOMMENDED_ACTION.body}</p>
              <div className="confluence-page__recommended-actions">
                <button type="button" className="confluence-page__error-action" onClick={handleApplyRecommendedFix} disabled={!omniBox}><RovoIcon size={16} />Apply recommended fix</button>
                <button type="button" className="confluence-page__error-action" onClick={handleFollowUp} disabled={!omniBox}><RovoIcon size={16} />Ask a follow up question</button>
              </div>
            </div>
          )}
        </div>
      )}

      {rovoMode === 'predictive' && (
        <div className="confluence-page__warning" role="alert">
          <span className="confluence-page__warning-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
          </span>
          <div className="confluence-page__warning-content">
            <strong className="confluence-page__warning-title">{PREDICTIVE_WARNING.title}</strong>
            <p className="confluence-page__warning-message">{PREDICTIVE_WARNING.message}</p>
          </div>
          <button type="button" className="confluence-page__error-action" onClick={handlePreventFix} disabled={!omniBox} title="Preempt failure">
            <RovoIcon size={16} />{PREDICTIVE_WARNING.preventLabel}
          </button>
        </div>
      )}

      {rovoMode === 'god' && godMessageVisible && (
        <div className="confluence-page__god-message" role="status" aria-live="polite">
          <RovoIcon size={18} /><span>{GOD_MODE_MESSAGE}</span>
        </div>
      )}

      <div className="confluence-page__layout">
        <main className="confluence-page__main">
          <nav className="confluence-page__breadcrumb" aria-label="Breadcrumb">
            <ol className="confluence-page__breadcrumb-list">
              <li><a href="/confluence" className="confluence-page__breadcrumb-link">Home</a></li>
              <li><span className="confluence-page__breadcrumb-sep" aria-hidden="true">/</span></li>
              <li><a href="/confluence" className="confluence-page__breadcrumb-link">Williams Racing</a></li>
              <li><span className="confluence-page__breadcrumb-sep" aria-hidden="true">/</span></li>
              <li><span className="confluence-page__breadcrumb-current">Knowledge base</span></li>
            </ol>
          </nav>

          <header className="confluence-page__header">
            <h1 className="confluence-page__title">Confluence Home</h1>
            <div className="confluence-page__meta">
              <span className="confluence-page__meta-item">Last updated: Feb 18, 2026</span>
              <span className="confluence-page__meta-dot">·</span>
              <span className="confluence-page__meta-item">By Support Team</span>
            </div>
          </header>

          <div className="confluence-page__body">
            <p className="confluence-page__lead">
              Welcome to your team&rsquo;s Confluence space. Use this home page to find documentation,
              runbooks, and project updates.
            </p>
            <h2 className="confluence-page__h2">Quick links</h2>
            <ul className="confluence-page__list">
              <li><a href="#" className="confluence-page__link">Product documentation</a></li>
              <li><a href="#" className="confluence-page__link">Support runbooks</a></li>
              <li><a href="#" className="confluence-page__link">Release notes</a></li>
              <li><a href="#" className="confluence-page__link">Team meeting notes</a></li>
            </ul>
            <h2 className="confluence-page__h2">About this space</h2>
            <p className="confluence-page__p">
              This space is used for internal knowledge sharing and support operations. Pages here
              are linked from Jira and Support Insights 360 where relevant.
            </p>
          </div>
        </main>

        <aside className="confluence-page__related" aria-label="Related content">
          <h3 className="confluence-page__related-title">Related pages</h3>
          <ul className="confluence-page__related-list">
            {RELATED_PAGES.map((page, i) => (
              <li key={i} className="confluence-page__related-item">
                <a href={page.href} className="confluence-page__related-link">
                  <span className="confluence-page__related-link-title">{page.title}</span>
                  <span className="confluence-page__related-link-meta">{page.space} · {page.updated}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
