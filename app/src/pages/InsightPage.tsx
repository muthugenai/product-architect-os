import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { OmniBoxContext } from '../hooks/useOmniBox';
import { getInsightById } from '../data/mockInsights';
import './InsightPage.css';

interface InsightPageProps {
  omniBox: OmniBoxContext;
}

/* ── trend line chart ──────────────────────────────────────────── */
function TrendChart({ data, baseline }: { data: number[]; baseline: number }) {
  const W   = 620;
  const H   = 200;
  const PAD = { top: 20, right: 28, bottom: 44, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top  - PAD.bottom;

  const min = Math.min(...data, baseline) * 0.88;
  const max = Math.max(...data, baseline) * 1.08;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - ((v - min) / (max - min)) * innerH;

  /* smooth bezier path */
  const smoothPath = (pts: number[]) => {
    const coords = pts.map((v, i) => ({ x: xScale(i), y: yScale(v) }));
    return coords.reduce((acc, pt, i) => {
      if (i === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      const prev = coords[i - 1];
      const cpx  = (prev.x + pt.x) / 2;
      return `${acc} C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }, '');
  };

  const linePath = smoothPath(data);

  /* area fill path (close below x-axis) */
  const areaPath =
    `${linePath} L${xScale(data.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left},${(PAD.top + innerH).toFixed(1)} Z`;

  const baselineY = yScale(baseline);

  /* x-axis labels */
  const today = new Date(2026, 1, 18);
  const labels = Array.from({ length: data.length }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (data.length - 1 - i));
    if (i === data.length - 1) return 'Today';
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  });

  /* y-axis ticks */
  const TICKS = 4;
  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) =>
    min + ((max - min) / TICKS) * i
  ).reverse();

  const BLUE    = '#0065FF';
  const BLUE_LT = '#4C9AFF';
  const GRID    = '#E4E7EC';
  const SUBTLE  = '#626F86';
  const ORANGE  = '#FF8B00';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="insight-chart"
      aria-label="Metric trend chart"
      role="img"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* area gradient */}
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={BLUE}    stopOpacity="0.18" />
          <stop offset="100%" stopColor={BLUE}    stopOpacity="0.01" />
        </linearGradient>
        {/* glow filter for last dot */}
        <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* y-axis grid lines + labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left} x2={W - PAD.right}
            y1={yScale(v)} y2={yScale(v)}
            stroke={GRID} strokeWidth="1"
          />
          <text
            x={PAD.left - 8} y={yScale(v) + 4}
            fontSize="11" fill={SUBTLE} textAnchor="end" fontFamily="inherit"
          >
            {Number.isInteger(v) ? Math.round(v) : v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* x-axis baseline */}
      <line
        x1={PAD.left} x2={W - PAD.right}
        y1={PAD.top + innerH} y2={PAD.top + innerH}
        stroke={GRID} strokeWidth="1"
      />

      {/* area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* baseline reference line */}
      <line
        x1={PAD.left} x2={W - PAD.right}
        y1={baselineY} y2={baselineY}
        stroke={ORANGE} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.85"
      />
      <text
        x={W - PAD.right + 4} y={baselineY + 4}
        fontSize="10" fill={ORANGE} fontFamily="inherit"
      >
        Target
      </text>

      {/* main trend line */}
      <path
        d={linePath}
        fill="none"
        stroke={BLUE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* dots — all small, last one highlighted */}
      {data.map((v, i) => {
        const isLast = i === data.length - 1;
        return (
          <circle
            key={i}
            cx={xScale(i)} cy={yScale(v)}
            r={isLast ? 6 : 3.5}
            fill={isLast ? BLUE : '#fff'}
            stroke={isLast ? '#fff' : BLUE_LT}
            strokeWidth={isLast ? 2 : 1.5}
            filter={isLast ? 'url(#dotGlow)' : undefined}
          />
        );
      })}

      {/* last value label */}
      <text
        x={xScale(data.length - 1)} y={yScale(data[data.length - 1]) - 12}
        fontSize="12" fontWeight="600" fill={BLUE} textAnchor="middle" fontFamily="inherit"
      >
        {Number.isInteger(data[data.length - 1])
          ? data[data.length - 1]
          : data[data.length - 1].toFixed(1)}
      </text>

      {/* x-axis labels — every other + last */}
      {labels.map((l, i) =>
        i % 2 === 0 || i === labels.length - 1 ? (
          <text
            key={i}
            x={xScale(i)} y={H - 10}
            fontSize="11" fill={SUBTLE} textAnchor="middle" fontFamily="inherit"
          >
            {l}
          </text>
        ) : null
      )}

      {/* legend */}
      <g transform={`translate(${PAD.left}, ${H - 2})`}>
        <line x1="0" x2="18" y1="-6" y2="-6" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="9" cy="-6" r="3" fill={BLUE} />
        <text x="24" y="-2" fontSize="11" fill={SUBTLE} fontFamily="inherit">Trend</text>
        <line x1="72" x2="90" y1="-6" y2="-6" stroke={ORANGE} strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="96" y="-2" fontSize="11" fill={SUBTLE} fontFamily="inherit">Target / Baseline</text>
      </g>
    </svg>
  );
}

/* ── main page ─────────────────────────────────────────────────── */
export const InsightPage: React.FC<InsightPageProps> = ({ omniBox }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const insight = getInsightById(id ?? '');
  const [expandedCause, setExpandedCause] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!insight) {
    return (
      <div className="insight-page insight-page--not-found">
        <button className="insight-back-btn" onClick={() => navigate('/insights')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        <p>Insight not found.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityLabel: Record<string, string> = {
    high: 'high severity',
    medium: 'medium severity',
    low: 'low severity',
  };

  const confidenceClass: Record<string, string> = {
    'High confidence': 'insight-cause__confidence--high',
    'Medium confidence': 'insight-cause__confidence--medium',
    'Low confidence': 'insight-cause__confidence--low',
  };

  const changeIsNegative = !insight.changePercent.startsWith('+') || parseFloat(insight.changePercent) < 0;

  return (
    <div className="insight-page">
      {/* breadcrumb */}
      <nav className="insight-breadcrumb" aria-label="Breadcrumb">
        <Link to="/insights" className="insight-breadcrumb__link">Dashboard</Link>
        <span className="insight-breadcrumb__sep">›</span>
        <span className="insight-breadcrumb__current">Insights</span>
      </nav>

      {/* page title row */}
      <div className="insight-title-row">
        <div className="insight-title-left">
          <button
            className="insight-back-btn"
            onClick={() => navigate('/insights')}
            aria-label="Back to Dashboard"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5"/>
            </svg>
          </button>
          <h1 className="insight-title">{insight.title}</h1>
        </div>
        <button className="insight-copy-btn" onClick={handleCopy} aria-label="Copy link">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v8h7V4H5zM3 12H2V3h8v1H3v8z"/>
          </svg>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      {/* tags */}
      <div className="insight-tags">
        <span className={`insight-tag insight-tag--severity insight-tag--${insight.severity}`}>
          {severityLabel[insight.severity]}
        </span>
        {insight.tags.map(t => (
          <span key={t} className="insight-tag">{t}</span>
        ))}
      </div>

      {/* two-column layout */}
      <div className="insight-layout">
        {/* ── left main column ── */}
        <div className="insight-main">

          {/* What Happened */}
          <section className="insight-card" aria-labelledby="what-happened-heading">
            <h2 className="insight-section-heading" id="what-happened-heading">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 11a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/>
              </svg>
              What Happened
            </h2>
            <p className="insight-body-text">{insight.whatHappened}</p>

            {/* trend chart */}
            <div className="insight-chart-wrap">
              <p className="insight-chart-title">Metric Trend (7-day)</p>
              <TrendChart data={insight.trendData} baseline={insight.trendBaseline} />
            </div>

            {/* KPI stats */}
            <div className="insight-stats">
              <div className="insight-stat">
                <span className={`insight-stat__value insight-stat__value--${insight.severity === 'high' ? 'bad' : 'neutral'}`}>
                  {insight.current}
                </span>
                <span className="insight-stat__label">Current</span>
              </div>
              <div className="insight-stat">
                <span className="insight-stat__value">{insight.baseline}</span>
                <span className="insight-stat__label">Baseline</span>
              </div>
              <div className="insight-stat">
                <span className={`insight-stat__value ${changeIsNegative ? 'insight-stat__value--bad' : 'insight-stat__value--bad'}`}>
                  {insight.changePercent}
                </span>
                <span className="insight-stat__label">Change</span>
              </div>
            </div>

            {/* Rovo suggestions */}
            <div className="insight-rovo-suggestions">
              <div className="insight-rovo-suggestions__header">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--ads-purple-500)" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1z"/>
                  <path d="M6 6.5C6 5.1 6.9 4 8 4s2 1.1 2 2.5c0 1-.5 1.8-1.2 2.2L8.5 10h-1l-.3-1.3C6.5 8.3 6 7.5 6 6.5z" fill="#fff"/>
                  <circle cx="8" cy="11.5" r=".75" fill="#fff"/>
                </svg>
                <span>Rovo suggestions</span>
              </div>
              <div className="insight-rovo-suggestions__chips">
                {insight.roveSuggestions.map(s => (
                  <button
                    key={s}
                    className="insight-suggestion-chip"
                    onClick={() => omniBox.openChatPanel(s)}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M2 8h8M7 5l3 3-3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div className="insight-impact" role="note">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="insight-impact__icon">
                <path d="M8 1l6 12H2L8 1zm0 3L4 12h8L8 4zm-1 3h2v2H7V7zm0 3h2v1H7v-1z"/>
              </svg>
              <div>
                <p className="insight-impact__title">Impact</p>
                <p className="insight-impact__body">{insight.impact}</p>
              </div>
            </div>
          </section>

          {/* Why It Likely Happened */}
          <section className="insight-card" aria-labelledby="why-happened-heading">
            <h2 className="insight-section-heading" id="why-happened-heading">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a5 5 0 100 10A5 5 0 008 1zm0 8.5a1 1 0 110-2 1 1 0 010 2zm.75-3.25h-1.5V4h1.5v2.25z"/>
                <path d="M13 11l2 2-2 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              Why It Likely Happened
            </h2>

            <div className="insight-why-summary">
              {insight.whyLikelySummary}
            </div>

            <div className="insight-causes">
              {insight.causes.map((cause, i) => (
                <div
                  key={i}
                  className={`insight-cause${expandedCause === i ? ' insight-cause--expanded' : ''}`}
                >
                  <button
                    className="insight-cause__header"
                    onClick={() => setExpandedCause(expandedCause === i ? null : i)}
                    aria-expanded={expandedCause === i}
                  >
                    <span className="insight-cause__title">{cause.title}</span>
                    <span className={`insight-cause__confidence ${confidenceClass[cause.confidence]}`}>
                      {cause.confidence}
                    </span>
                    <svg
                      className="insight-cause__chevron"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={expandedCause === i ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'} />
                    </svg>
                  </button>
                  {expandedCause === i && (
                    <p className="insight-cause__detail">{cause.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* How to Fix */}
          <section className="insight-card insight-card--fix" aria-labelledby="how-to-fix-heading">
            <h2 className="insight-section-heading insight-section-heading--fix" id="how-to-fix-heading">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M12.5 2a.5.5 0 01.5.5v1a3 3 0 01-3 3h-1v1.086l2.707 2.707-1.414 1.414L8 9.414l-2.293 2.293-1.414-1.414L7 7.586V6.5H6a3 3 0 01-3-3v-1a.5.5 0 011 0v1a2 2 0 002 2h4a2 2 0 002-2v-1a.5.5 0 01.5-.5z"/>
              </svg>
              How to Fix
            </h2>
            <p className="insight-body-text">{insight.howToFix}</p>

            <table className="insight-fix-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {insight.fixes.map((f, i) => (
                  <tr key={i}>
                    <td>{f.action}</td>
                    <td>
                      <span className="insight-fix-owner">{f.owner}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="insight-fix-actions">
              <button
                className="insight-ask-rovo-btn"
                onClick={() => omniBox.openChatPanel(`Help me fix: ${insight.title}`)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1z"/>
                  <path d="M6 6.5C6 5.1 6.9 4 8 4s2 1.1 2 2.5c0 1-.5 1.8-1.2 2.2L8.5 10h-1l-.3-1.3C6.5 8.3 6 7.5 6 6.5z" fill="#fff"/>
                  <circle cx="8" cy="11.5" r=".75" fill="#fff"/>
                </svg>
                Ask Rovo to investigate
              </button>
              <button
                className="insight-action-btn"
                onClick={() => navigate('/insights')}
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        </div>

        {/* ── right sidebar ── */}
        <aside className="insight-sidebar" aria-label="Data sources">
          <div className="insight-sidebar-card">
            <h3 className="insight-sidebar-heading">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1C4.7 1 2 2.3 2 4v8c0 1.7 2.7 3 6 3s6-1.3 6-3V4c0-1.7-2.7-3-6-3zm0 2c2.8 0 4 .9 4 1s-1.2 1-4 1-4-.9-4-1 1.2-1 4-1zm4 8c0 .1-1.2 1-4 1s-4-.9-4-1v-1.3c.9.5 2.3.8 4 .8s3.1-.3 4-.8V11zm0-3c0 .1-1.2 1-4 1s-4-.9-4-1V6.7c.9.5 2.3.8 4 .8s3.1-.3 4-.8V8z"/>
              </svg>
              Data Sources
            </h3>
            <ul className="insight-datasource-list">
              {insight.dataSources.map(ds => (
                <li key={ds} className="insight-datasource-item">
                  <span className="insight-datasource-name">{ds}</span>
                  <span className="insight-datasource-status" title="Connected">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--ads-green-600)">
                      <circle cx="8" cy="8" r="7"/>
                      <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </li>
              ))}
            </ul>
            <p className="insight-datasource-refresh">Last refreshed: {insight.lastRefreshed}</p>
            <button
              className="insight-view-table-btn"
              onClick={() => omniBox.openChatPanel(`Show me the base table for ${insight.title}`)}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 3h14v2H1V3zm0 4h14v2H1V7zm0 4h14v2H1v-2z"/>
              </svg>
              View base table
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
