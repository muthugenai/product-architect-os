import React, { useState } from 'react';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import './Dashboard.css';

interface DashboardProps {
  omniBox: OmniBoxContext;
}

const KPI_CARDS = [
  {
    id: 'kpi-1',
    label: 'Tickets Deflected Today',
    value: '1,247',
    delta: '+18%',
    deltaDir: 'up' as const,
    sub: 'via AI self-service',
    color: 'var(--ads-blue-700)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3 5L7 10 5 8l1-1 1 1 3-3 1 1z"/>
      </svg>
    ),
  },
  {
    id: 'kpi-2',
    label: 'Avg. Resolution Time',
    value: '47m',
    delta: '+49%',
    deltaDir: 'down' as const,
    sub: 'vs. 35m last week',
    color: 'var(--ads-red-600)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M8 5v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'kpi-3',
    label: 'Open Tickets',
    value: '3,842',
    delta: '+93%',
    deltaDir: 'down' as const,
    sub: 'Billing EMEA surge',
    color: 'var(--ads-yellow-600)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2h12v12H2V2zm2 4v6h8V6H4z"/>
      </svg>
    ),
  },
  {
    id: 'kpi-4',
    label: 'SLA Breach Risk',
    value: '8.2%',
    delta: '+3.2pp',
    deltaDir: 'down' as const,
    sub: 'target: 5% • NA Chat',
    color: 'var(--ads-red-700)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1l6 12H2L8 1zm0 3L4 12h8L8 4zm-1 3h2v2H7V7zm0 3h2v1H7v-1z"/>
      </svg>
    ),
  },
  {
    id: 'kpi-5',
    label: 'Cost Avoidance',
    value: '$62,350',
    delta: '+12%',
    deltaDir: 'up' as const,
    sub: 'this month',
    color: 'var(--ads-green-700)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 10H7V9H5l3-4 3 4H9v2z"/>
      </svg>
    ),
  },
  {
    id: 'kpi-6',
    label: 'CSAT Score',
    value: '4.2',
    delta: '+0.3',
    deltaDir: 'up' as const,
    sub: 'out of 5.0 this week',
    color: 'var(--ads-purple-500)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
      </svg>
    ),
  },
];

const TREND_DATA = [30, 35, 28, 40, 38, 45, 52, 47, 55, 50, 58, 52, 49, 47];

type AlertLevel = 'error' | 'warning' | 'info' | 'success';
interface DashboardAlert {
  id: string;
  level: AlertLevel;
  title: string;
  body: React.ReactNode;
  action?: { label: string; query: string };
}

const ALERTS: DashboardAlert[] = [
  {
    id: 'a1',
    level: 'error',
    title: 'Critical incident — P1',
    body: <>EMEA Billing queue — <strong>93% ticket surge</strong> over 24 h. P1/P2 breach risk elevated. Primary drivers: login issues (43%), billing discrepancies (28%).</>,
    action: { label: 'Ask Rovo to investigate', query: 'Why is the EMEA billing queue surging?' },
  },
  {
    id: 'a2',
    level: 'warning',
    title: 'SLA breach risk',
    body: <>12 tickets in the <strong>APAC Technical</strong> queue are within 15 min of breaching their P2 SLA.</>,
    action: { label: 'Show at-risk tickets', query: 'Which APAC tickets are close to SLA breach?' },
  },
  {
    id: 'a3',
    level: 'info',
    title: 'Scheduled maintenance',
    body: <>JSM planned maintenance: <strong>Sat 22 Feb, 02:00–04:00 UTC</strong>. Some features may be unavailable.</>,
    action: { label: 'Learn more', query: 'Tell me about the upcoming JSM maintenance window' },
  },
  {
    id: 'a4',
    level: 'success',
    title: 'Incident resolved',
    body: <>EU-West authentication outage <strong>(JSM-5790)</strong> fully resolved. All systems operational.</>,
    action: { label: 'View post-mortem', query: 'Show EU-West auth outage post-mortem' },
  },
];

const ALERT_META: Record<AlertLevel, { bg: string; accent: string; iconColor: string; icon: React.ReactNode }> = {
  error:   { bg: '#FFEBE6', accent: '#FF5630', iconColor: '#DE350B',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v5h-1.5v-5zm0 6.5h1.5V12.5h-1.5V11z"/></svg> },
  warning: { bg: '#FFFAE6', accent: '#FF991F', iconColor: '#FF8B00',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.5.5 0 01.437.257l6 11A.5.5 0 0114 13H2a.5.5 0 01-.437-.743l6-11A.5.5 0 018 1zm0 2.17L3.07 12h9.86L8 3.17zM7 7h2v3H7V7zm0 4h2v1.5H7V11z"/></svg> },
  info:    { bg: '#DEEBFF', accent: '#0065FF', iconColor: '#0052CC',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.5h1.5V7h-1.5V5.5zm0 3h1.5v4h-1.5v-4z"/></svg> },
  success: { bg: '#E3FCEF', accent: '#00875A', iconColor: '#006644',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.28 5.28l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 111.06-1.06L6.75 8.69l3.47-3.47a.75.75 0 111.06 1.06z"/></svg> },
};

const APP_ERROR_MESSAGE = {
  title: 'Support Insights 360',
  body: 'Some metrics are temporarily unavailable. Data may be delayed or cached. We\'re working to restore full service.',
  actionLabel: 'Ask Rovo to investigate',
  actionQuery: 'Some Support Insights 360 metrics are temporarily unavailable. Investigate what might be causing data delays, identify affected dashboards, and suggest workarounds.',
};

export const Dashboard: React.FC<DashboardProps> = ({ omniBox }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [appErrorDismissed, setAppErrorDismissed] = useState(false);
  const visible = ALERTS.filter(a => !dismissed.has(a.id));

  return (
  <div className="dashboard">
    {/* Application-level error / service message */}
    {!appErrorDismissed && (
      <div className="dashboard__app-error" role="alert" aria-live="polite">
        <div className="dashboard__app-error-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v5h-1.5v-5zm0 6.5h1.5V12.5h-1.5V11z"/>
          </svg>
        </div>
        <div className="dashboard__app-error-content">
          <strong className="dashboard__app-error-title">{APP_ERROR_MESSAGE.title}</strong>
          <span className="dashboard__app-error-body">{APP_ERROR_MESSAGE.body}</span>
        </div>
        <button
          type="button"
          className="dashboard__app-error-action"
          onClick={() => omniBox.openChatPanel(APP_ERROR_MESSAGE.actionQuery)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
          </svg>
          {APP_ERROR_MESSAGE.actionLabel}
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </button>
        <button
          type="button"
          className="dashboard__app-error-dismiss"
          aria-label="Dismiss message"
          onClick={() => setAppErrorDismissed(true)}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
      </div>
    )}

    {/* Page title */}
    <div className="dashboard__page-header">
      <div>
        <h1 className="dashboard__title">Support Insights 360</h1>
        <p className="dashboard__subtitle">Real-time operations overview · Wed, Feb 18, 2026</p>
      </div>
      <div className="dashboard__header-actions">
        <button className="btn btn-subtle btn-sm">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2l-4 4v4H6V9L2 5V3z"/></svg>
          Filter
        </button>
        <button className="btn btn-subtle btn-sm">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 8a5 5 0 1010 0A5 5 0 003 8zm4.5-1h1v3h-1V7zm0-2h1v1h-1V5z"/></svg>
          All Regions
        </button>
      </div>
    </div>

    {/* Alert stack — ADS flag/banner anatomy */}
    {visible.length > 0 && (
      <div className="dashboard__alerts">
        {visible.map(alert => {
          const meta = ALERT_META[alert.level];
          return (
            <div
              key={alert.id}
              className="dashboard__alert"
              role="alert"
              aria-live="polite"
              style={{ background: meta.bg, borderLeftColor: meta.accent }}
            >
              <div className="dashboard__alert-icon" style={{ color: meta.iconColor }} aria-hidden="true">
                {meta.icon}
              </div>
              <div className="dashboard__alert-content">
                <span className="dashboard__alert-title">{alert.title}</span>
                <span className="dashboard__alert-body">{alert.body}</span>
              </div>
              {alert.action && (
                <button
                  className="dashboard__alert-action"
                  style={{ color: meta.accent, borderColor: meta.accent }}
                  onClick={() => omniBox.openChatPanel(alert.action!.query)}
                >
                  {alert.action.label}
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>
              )}
              <button
                className="dashboard__alert-dismiss"
                aria-label="Dismiss alert"
                onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    )}

    {/* KPI Grid */}
    <div className="dashboard__kpi-grid">
      {KPI_CARDS.map(kpi => (
        <div key={kpi.id} className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">{kpi.label}</span>
            <span className="kpi-card__icon" style={{ color: kpi.color }}>{kpi.icon}</span>
          </div>
          <div className="kpi-card__value" style={{ color: kpi.color }}>{kpi.value}</div>
          <div className="kpi-card__footer">
            <span className={`kpi-card__delta kpi-card__delta--${kpi.deltaDir}`}>
              {kpi.deltaDir === 'up' ? '↑' : '↓'} {kpi.delta}
            </span>
            <span className="kpi-card__sub">{kpi.sub}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Two-column section */}
    <div className="dashboard__cols">
      {/* Resolution time trend chart */}
      <div className="dashboard__card">
        <div className="dashboard__card-header">
          <h2 className="dashboard__card-title">Resolution Time Trend</h2>
          <span className="lozenge lozenge-danger">At Risk</span>
        </div>
        <div className="mini-chart">
          {TREND_DATA.map((v, i) => (
            <div
              key={i}
              className="mini-chart__bar"
              style={{ height: `${(v / 60) * 100}%`, background: v >= 50 ? 'var(--ads-red-600)' : 'var(--ads-blue-700)' }}
              title={`${v}m`}
            />
          ))}
        </div>
        <div className="dashboard__chart-legend">
          <span>14 days</span>
          <span>Avg: 47m &nbsp;|&nbsp; Target: &lt;40m</span>
        </div>
      </div>

      {/* Today's Summary (Flow O) */}
      <div className="dashboard__card today-summary">
        <div className="dashboard__card-header">
          <div className="today-summary__title-wrap">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--color-rovo)' }}>
              <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
            </svg>
            <h2 className="dashboard__card-title">Today&rsquo;s Summary</h2>
          </div>
          <span className="lozenge lozenge-purple">AI Generated</span>
        </div>

        <p className="today-summary__text">
          Your support operations are under <strong>elevated pressure</strong> today. The EMEA Billing queue
          has surged by 93% driven by a login issues spike following last night's auth service deployment.
          NA Chat is at risk of breaching the 5% SLA target. On the positive side, ticket deflection is up
          18% and CSAT improved to 4.2.
        </p>

        <div className="today-summary__highlights">
          <div className="today-summary__highlight today-summary__highlight--warn">
            <strong>⚠️ Watch:</strong> EMEA Billing – 3 agents handling 47 P1 tickets
          </div>
          <div className="today-summary__highlight today-summary__highlight--ok">
            <strong>✅ Win:</strong> AI deflected 1,247 tickets saving ~$62K today
          </div>
        </div>

        <div className="today-summary__prompts">
          <div className="today-summary__prompts-label">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
            </svg>
            EXPLORE WITH ROVO
          </div>
          {[
            'What caused the resolution time spike?',
            'Show cost saving opportunities from ticket deflection',
            'Summarize support health across all regions',
          ].map(p => (
            <button
              key={p}
              className="today-summary__prompt-chip"
              onClick={() => omniBox.openChatPanel(p)}
            >
              {p} →
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Queue health table */}
    <div className="dashboard__card dashboard__card--table">
      <div className="dashboard__card-header">
        <h2 className="dashboard__card-title">Queue Health by Channel</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => omniBox.openChatPanel('Show me all open P1 tickets')}>Ask Rovo →</button>
      </div>
      <table className="queue-table">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Region</th>
            <th>Open</th>
            <th>Avg Wait</th>
            <th>SLA</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { channel: 'Billing', region: 'EMEA', open: 147, wait: '52m', sla: '8.2%', status: 'critical' },
            { channel: 'Chat',    region: 'NA',   open: 312, wait: '18m', sla: '6.1%', status: 'warning' },
            { channel: 'Email',   region: 'APAC', open: 89,  wait: '2.1h', sla: '3.2%', status: 'ok' },
            { channel: 'Phone',   region: 'NA',   open: 28,  wait: '7m',  sla: '1.8%', status: 'ok' },
            { channel: 'Admin',   region: 'NA',   open: 194, wait: '35m', sla: '4.9%', status: 'warning' },
          ].map(row => (
            <tr key={`${row.channel}-${row.region}`}>
              <td>{row.channel}</td>
              <td><span className="lozenge lozenge-neutral">{row.region}</span></td>
              <td><strong>{row.open}</strong></td>
              <td>{row.wait}</td>
              <td>{row.sla}</td>
              <td>
                <span className={`lozenge lozenge-${row.status === 'critical' ? 'danger' : row.status === 'warning' ? 'warning' : 'success'}`}>
                  {row.status === 'critical' ? 'Critical' : row.status === 'warning' ? 'At Risk' : 'Healthy'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};
