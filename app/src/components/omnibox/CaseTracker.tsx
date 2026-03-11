import React from 'react';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import './CaseTracker.css';

const CASES = [
  { id: 'JSM-5801', subject: 'EMEA Billing queue spike investigation', status: 'open', priority: 'P1', updated: '2h ago' },
  { id: 'JSM-5789', subject: 'SLA breach notifications not firing', status: 'in_progress', priority: 'P2', updated: '5h ago' },
  { id: 'JSM-5765', subject: 'Permission scheme not propagating to sub-projects', status: 'resolved', priority: 'P3', updated: '1d ago' },
  { id: 'JSM-5741', subject: 'Automation rule fails on subtask create', status: 'resolved', priority: 'P3', updated: '2d ago' },
];

interface CaseTrackerProps {
  omniBox: OmniBoxContext;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({ omniBox }) => (
  <div className="omnibox-popup case-tracker" role="dialog" aria-label="Open Cases" aria-modal="true">
    <div className="omnibox-popup__header">
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--color-rovo)' }}>
        <path d="M2 2h12v12H2V2zm2 4v6h8V6H4z"/>
      </svg>
      <span className="omnibox-popup__title">Your Support Cases</span>
      <button className="btn btn-icon" onClick={omniBox.close} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>

    <div className="case-tracker__body">
      <div className="case-tracker__actions">
        <button className="btn btn-primary" onClick={() => omniBox.openTicketForm()}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
          Create Support Ticket
        </button>
        <button className="btn btn-subtle">All Cases</button>
        <button className="btn btn-subtle">Open Only</button>
      </div>

      <table className="case-table">
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
            <tr key={c.id} className="case-table__row">
              <td className="case-table__id">{c.id}</td>
              <td>{c.subject}</td>
              <td>
                <span className={`lozenge ${c.priority === 'P1' ? 'lozenge-danger' : c.priority === 'P2' ? 'lozenge-warning' : 'lozenge-neutral'}`}>
                  {c.priority}
                </span>
              </td>
              <td>
                <span className={`lozenge ${c.status === 'open' ? 'lozenge-info' : c.status === 'in_progress' ? 'lozenge-warning' : 'lozenge-success'}`}>
                  {c.status === 'in_progress' ? 'In Progress' : c.status === 'open' ? 'Open' : 'Resolved'}
                </span>
              </td>
              <td className="case-table__updated">{c.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="omnibox-popup__footer">
      <a href="#" style={{ color: 'var(--color-link)', fontSize: 'var(--text-sm)' }}>View all cases in JSM →</a>
    </div>
  </div>
);
