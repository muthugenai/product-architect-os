import React, { useState, useEffect } from 'react';
import type { OmniBoxContext } from '../hooks/useOmniBox';
import type { RovoMode } from '../App';
import { RovoIcon } from '../components/icons/RovoIcon';
import './JsmPage.css';

interface JsmPageProps {
  omniBox?: OmniBoxContext;
  rovoMode?: RovoMode;
}

const PAGE_ERROR = {
  title: 'SLA breach on 3 open tickets',
  message: 'Tickets SEC-001, IT-003, and IT-001 have exceeded their "Time to first response" SLA. Customers have been waiting longer than the agreed response window and no agent has replied yet.',
  actionLabel: 'Ask Rovo',
};

const RECOMMENDED_ACTION = {
  title: 'Recommended action',
  body: 'Assign an available agent to the breached tickets immediately and send an acknowledgement to the affected customers. Review queue workload to prevent further SLA violations.',
};

const PREDICTIVE_WARNING = {
  title: 'SLA breach risk detected',
  message: 'Tickets VPN-003 and TECH-001 are projected to breach their "Time to resolution" SLA within the next 2 hours based on current agent capacity.',
  preventLabel: 'Preempt breach',
};

const GOD_MODE_MESSAGE = 'Auto-assigned breached tickets and sent acknowledgements!';

/* ── Ticket table data ────────────────────────────────────────── */
type TicketType = 'bug' | 'task' | 'request';

interface Ticket {
  key: string;
  type: TicketType;
  summary: string;
  reporter: string;
  assignee: string;
  status: string;
  created: string;
}

const TICKETS: Ticket[] = [
  { key: 'SEC-001', type: 'bug',     summary: "My ship's navigation system has a bug and keeps pointing to Pluto", reporter: 'Crystal Wu',       assignee: 'Michael Chu', status: 'OPEN', created: '2022-11-21' },
  { key: 'VPN-003', type: 'bug',     summary: 'Martian habitat servers need security updates',                     reporter: 'Stefanie Auer',    assignee: 'Michael Chu', status: 'OPEN', created: '2020-01-03' },
  { key: 'TECH-001',type: 'task',    summary: "I'm locked out of the Beyond Gravity VPN",                          reporter: 'Fran Perez',        assignee: 'Michael Chu', status: 'OPEN', created: '2022-01-06' },
  { key: 'IT-003',  type: 'request', summary: 'Internet has disappeared from my desktop',                          reporter: 'Abdullah Ibrahim', assignee: 'Michael Chu', status: 'OPEN', created: '2018-01-16' },
  { key: 'IT-001',  type: 'bug',     summary: "I've received a phishing email",                                    reporter: 'Donald Stephens',  assignee: 'Michael Chu', status: 'OPEN', created: '2015-08-24' },
  { key: 'NEW-001', type: 'request', summary: 'Lunar solar panel procurement help',                                reporter: 'Molly Clark',       assignee: 'Michael Chu', status: 'OPEN', created: '2019-10-24' },
  { key: 'HW-001',  type: 'task',    summary: 'New person starting',                                               reporter: 'Hassana Ajayi',     assignee: 'Michael Chu', status: 'OPEN', created: '2022-11-21' },
  { key: 'EML-003', type: 'bug',     summary: 'Yubikey melted from rocket test',                                   reporter: 'Samuel Hall',       assignee: 'Michael Chu', status: 'OPEN', created: '2020-01-03' },
  { key: 'VPN-001', type: 'request', summary: "Outlook isn't loading new emails",                                  reporter: 'Jie Yan Song',      assignee: 'Michael Chu', status: 'OPEN', created: '2022-01-06' },
  { key: 'NEW-002', type: 'task',    summary: 'The button to the bathroom is sticky.',                              reporter: 'Jane Rotanson',     assignee: 'Michael Chu', status: 'OPEN', created: '2018-01-16' },
];

const TYPE_COLORS: Record<TicketType, string> = {
  bug: '#de350b',
  task: '#36b37e',
  request: '#0065ff',
};

/* Assignee avatar URLs (circle-cropped in CSS). Replace with your own image paths as needed. */
const ASSIGNEE_AVATARS: Record<string, string> = {
  'Michael Chu': 'https://i.pravatar.cc/150?u=michael-chu',
};

export const JsmPage: React.FC<JsmPageProps> = ({ omniBox, rovoMode = 'reactive' }) => {
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
    omniBox.setQuery(`${PAGE_ERROR.title}: ${PAGE_ERROR.message}`);
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'JSM · SLA Breach', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handleFollowUp = () => {
    if (!omniBox) return;
    omniBox.setQuery('How can I resolve these SLA breaches and prevent future ones?');
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'JSM · SLA Breach', updated: '', views: '', thumbsUp: 0, href: '#' });
    omniBox.openChatPanel('__article__');
  };

  const handlePreventFix = () => {
    if (!omniBox) return;
    omniBox.setQuery('Preempt SLA breach: reassign tickets at risk of missing resolution target');
    omniBox.setArticleContext({ title: PREDICTIVE_WARNING.title, category: 'JSM · At Risk', updated: '', views: '', thumbsUp: 0, href: '#', action: 'apply_fix' });
    omniBox.openChatPanel('__article__');
  };

  const handleApplyRecommendedFix = () => {
    if (!omniBox) return;
    omniBox.setQuery('Auto-assign breached tickets and notify customers');
    omniBox.setArticleContext({ title: PAGE_ERROR.title, category: 'JSM · SLA Breach', updated: '', views: '', thumbsUp: 0, href: '#', action: 'apply_fix' });
    omniBox.openChatPanel('__article__');
  };

  useEffect(() => {
    if (omniBox?.fixConfirmed) setFixApplied(true);
  }, [omniBox?.fixConfirmed]);

  return (
    <div className="jsm-page">
      {/* ── Rovo Mode Alerts ─────────────────────────────────── */}
      {rovoMode === 'reactive' && (
        <div className="jsm-page__error" role="alert">
          <span className="jsm-page__error-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </span>
          <div className="jsm-page__error-content">
            <button type="button" className="jsm-page__error-title jsm-page__error-title--link" onClick={handleAskRovo} disabled={!omniBox}>{PAGE_ERROR.title}</button>
            <p className="jsm-page__error-message">{PAGE_ERROR.message}</p>
          </div>
          <button type="button" className="jsm-page__error-action" onClick={handleAskRovo} disabled={!omniBox}>
            <RovoIcon size={16} />{PAGE_ERROR.actionLabel}
          </button>
        </div>
      )}

      {rovoMode === 'proactive' && !fixApplied && (
        <div className="jsm-page__alert-block">
          <div className="jsm-page__error jsm-page__error--no-action" role="alert">
            <span className="jsm-page__error-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </span>
            <div className="jsm-page__error-content">
              <strong className="jsm-page__error-title">{PAGE_ERROR.title}</strong>
              <p className="jsm-page__error-message">{PAGE_ERROR.message}</p>
            </div>
          </div>
          {omniBox?.ticketCreatedByAgent ? (
            <div className="jsm-page__recommended jsm-page__recommended--ticket-created" role="status">
              <strong className="jsm-page__recommended-title">Ticket created</strong>
              <p className="jsm-page__recommended-body">The live agent has created a support ticket for this issue. <a href="#" className="jsm-page__ticket-created-link">WPT-1042</a> is open and assigned to the queue manager.</p>
            </div>
          ) : (
            <div className="jsm-page__recommended">
              <strong className="jsm-page__recommended-title">{RECOMMENDED_ACTION.title}</strong>
              <p className="jsm-page__recommended-body">{RECOMMENDED_ACTION.body}</p>
              <div className="jsm-page__recommended-actions">
                <button type="button" className="jsm-page__error-action" onClick={handleApplyRecommendedFix} disabled={!omniBox}><RovoIcon size={16} />Apply recommended fix</button>
                <button type="button" className="jsm-page__error-action" onClick={handleAskRovo} disabled={!omniBox}><RovoIcon size={16} />{PAGE_ERROR.title}</button>
                <button type="button" className="jsm-page__error-action" onClick={handleFollowUp} disabled={!omniBox}><RovoIcon size={16} />Ask a follow up question</button>
              </div>
            </div>
          )}
        </div>
      )}

      {rovoMode === 'predictive' && (
        <div className="jsm-page__warning" role="alert">
          <span className="jsm-page__warning-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
          </span>
          <div className="jsm-page__warning-content">
            <strong className="jsm-page__warning-title">{PREDICTIVE_WARNING.title}</strong>
            <p className="jsm-page__warning-message">{PREDICTIVE_WARNING.message}</p>
          </div>
          <button type="button" className="jsm-page__error-action" onClick={handlePreventFix} disabled={!omniBox} title="Preempt error"><RovoIcon size={16} />{PREDICTIVE_WARNING.preventLabel}</button>
        </div>
      )}

      {rovoMode === 'god' && godMessageVisible && (
        <div className="jsm-page__god-message" role="status" aria-live="polite"><RovoIcon size={18} /><span>{GOD_MODE_MESSAGE}</span></div>
      )}

      {/* ── Ticket list content ─────────────────────────────── */}
      <div className={`jsm-page__content${rovoMode === 'god' && !godMessageVisible ? ' jsm-page__content--god-after-message' : ''}`}>
        <div className="jsm-page__breadcrumb">
          <a href="#">Projects</a> / <a href="#">Besties</a> / <span>All tickets</span>
        </div>

        <div className="jsm-page__content-header">
          <h1 className="jsm-page__title">All open tickets</h1>
          <div className="jsm-page__content-actions">
            <button type="button" className="jsm-page__icon-btn" title="Open external">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1h4v4"/><path d="M15 1L8 8"/><path d="M13 9v5a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1h5"/></svg>
            </button>
            <button type="button" className="jsm-page__icon-btn" title="Star">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"/></svg>
            </button>
            <button type="button" className="jsm-page__icon-btn" title="More">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
            </button>
          </div>
        </div>

        <input className="jsm-page__filter-input" type="text" placeholder="Placeholder" />

        <div className="jsm-page__table-wrap">
          <table className="jsm-page__ticket-table">
            <thead>
              <tr>
                <th className="jsm-page__th-check"><input type="checkbox" /></th>
                <th className="jsm-page__th-type">T</th>
                <th>Key</th>
                <th>Summary</th>
                <th>Reporter</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {TICKETS.map(t => (
                <tr key={t.key}>
                  <td className="jsm-page__td-check"><input type="checkbox" /></td>
                  <td className="jsm-page__td-type">
                    <span className="jsm-page__type-dot" style={{ background: TYPE_COLORS[t.type] }} title={t.type} />
                  </td>
                  <td className="jsm-page__td-key">{t.key}</td>
                  <td className="jsm-page__td-summary"><a href="#">{t.summary}</a></td>
                  <td>{t.reporter}</td>
                  <td><span className="jsm-page__assignee">{ASSIGNEE_AVATARS[t.assignee] ? <img src={ASSIGNEE_AVATARS[t.assignee]} alt="" className="jsm-page__avatar jsm-page__avatar--img" /> : <span className="jsm-page__avatar" />}{t.assignee}</span></td>
                  <td className="jsm-page__td-status"><span className="jsm-page__status-badge">{t.status}</span></td>
                  <td className="jsm-page__td-date">{t.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
