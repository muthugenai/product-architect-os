import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { PopupExperience, RovoMode } from '../../App';
import './Sidebar.css';

const INSIGHTS = [
  { id: 'i1', label: 'P1/P2 Tickets Surge', severity: 'high', detail: '93% change in Billing • EMEA' },
  { id: 'i2', label: 'Resolution Time Spike', severity: 'medium', detail: '49% change in Admin • NA' },
  { id: 'i3', label: 'SLA Breach Risk - Chat', severity: 'high', detail: '82% change in All • NA' },
];

const ROVO_MODE_OPTIONS: { id: RovoMode; label: string }[] = [
  { id: 'reactive', label: 'Reactive Rovo' },
  { id: 'proactive', label: 'Proactive Rovo' },
  { id: 'predictive', label: 'Predictive Rovo' },
  { id: 'god', label: 'Rovo GOD mode' },
];

const EXPERIENCE_OPTIONS: { id: PopupExperience; label: string }[] = [
  { id: 'optionB', label: 'Option B V 0.2' },
  { id: 'optionA', label: 'Option A V 0.1' },
];

const APP_OPTIONS = [
  { id: 'agenda', path: '/agenda', label: 'Agenda' },
  { id: 'jsm', path: '/', label: 'JSM page' },
  { id: 'insights', path: '/insights', label: 'Support Insights 360 page' },
  { id: 'confluence', path: '/confluence', label: 'Confluence Home Page' },
  { id: 'spaces', path: '/spaces', label: 'Jira Spaces' },
] as const;

const CONFLUENCE_NAV = [
  { to: '/confluence', label: 'Home', icon: 'home' },
  { to: '/confluence', label: 'Spaces', icon: 'spaces' },
  { to: '/confluence', label: 'Recent', icon: 'recent' },
  { to: '/confluence', label: 'Starred', icon: 'star' },
];

/* ── JSM sidebar: Besties project queues ──────────────────────── */
const STARRED_QUEUES = [
  { label: 'All open tickets', count: 18, active: true },
  { label: 'WPT: IT App Engineeri…', count: 79 },
];

const TEAM_PRIORITY_QUEUES = [
  { label: 'AtlasDesk Level 2', count: 44 },
  { label: 'Networks, Identity and…', count: 90 },
  { label: 'Integrations and Devel…', count: 53 },
  { label: '🔥Missing L2/L3 Team…', count: 18 },
  { label: 'WPT: IT App Engineeri…', count: 44 },
  { label: 'WPT: Collaboration Le…', count: 90 },
  { label: 'WPT: Jira Admin Level 3', count: 53 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  popupExperience: PopupExperience;
  onPopupExperienceChange: (v: PopupExperience) => void;
  rovoMode: RovoMode;
  onRovoModeChange: (v: RovoMode) => void;
  onAppSwitch?: () => void;
}

const ROVO_MODE_LABELS: Record<RovoMode, string> = {
  reactive: 'Reactive Rovo',
  proactive: 'Proactive Rovo',
  predictive: 'Predictive Rovo',
  god: 'Rovo GOD mode',
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, popupExperience, onPopupExperienceChange, rovoMode, onRovoModeChange, onAppSwitch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rovoModeDropdownOpen, setRovoModeDropdownOpen] = useState(false);
  const [experienceDropdownOpen, setExperienceDropdownOpen] = useState(false);
  const [teamPriorityOpen, setTeamPriorityOpen] = useState(true);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const rovoModeDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isConfluence = location.pathname.startsWith('/confluence');
  const isInsights = location.pathname === '/insights' || location.pathname.startsWith('/insight/');
  const isSpaces = location.pathname === '/spaces';
  const isAgenda = location.pathname === '/agenda';
  const isJsm = !isConfluence && !isInsights && !isSpaces && !isAgenda;
  const currentApp = isAgenda ? APP_OPTIONS[0] : isSpaces ? APP_OPTIONS[4] : isConfluence ? APP_OPTIONS[3] : isInsights ? APP_OPTIONS[2] : isJsm ? APP_OPTIONS[1] : APP_OPTIONS[0];

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = (dropdownRef.current && dropdownRef.current.contains(target)) || (dropdownMenuRef.current && dropdownMenuRef.current.contains(target));
      if (!inside) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!rovoModeDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (rovoModeDropdownRef.current && !rovoModeDropdownRef.current.contains(e.target as Node)) setRovoModeDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [rovoModeDropdownOpen]);

  useEffect(() => {
    if (!experienceDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(e.target as Node)) setExperienceDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [experienceDropdownOpen]);

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${isConfluence ? ' sidebar--confluence' : ''}${isSpaces ? ' sidebar--spaces' : ''}${isAgenda ? ' sidebar--agenda' : ''}`}>
      {!isAgenda && (
      <div className="sidebar__brand">
        {!collapsed && (
          <span className="sidebar__brand-name">
            {isSpaces ? 'Jira' : isConfluence ? 'Confluence' : isInsights ? 'Support Insights 360' : 'Jira Service Management'}
          </span>
        )}
        <button className="btn btn-icon sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="3" width="14" height="2" rx="1"/>
            <rect x="1" y="7" width="14" height="2" rx="1"/>
            <rect x="1" y="11" width="14" height="2" rx="1"/>
          </svg>
        </button>
      </div>
      )}

      {isAgenda ? null : isSpaces ? (
        /* Jira Spaces left nav */
        <nav className="sidebar__nav sidebar__nav--confluence">
          <NavLink to="/spaces" className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`} end>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12v12H2V2zm2 2v8h8V4H4z"/>
            </svg>
            {!collapsed && <span>Spaces</span>}
          </NavLink>
          <NavLink to="/spaces" className="sidebar__nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            {!collapsed && <span>Recent</span>}
          </NavLink>
          <NavLink to="/spaces" className="sidebar__nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/>
            </svg>
            {!collapsed && <span>Starred</span>}
          </NavLink>
        </nav>
      ) : isConfluence ? (
        /* Confluence left nav: no Dashboard, no INSIGHTS */
        <nav className="sidebar__nav sidebar__nav--confluence">
          {CONFLUENCE_NAV.map((item, i) => (
            <NavLink
              key={item.label + i}
              to={item.to}
              className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon === 'home' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.5 1.5l-5 4v8h4v-4h2v4h4v-8l-5-4z"/>
                </svg>
              )}
              {item.icon === 'spaces' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2h12v12H2V2zm2 2v8h8V4H4z"/>
                </svg>
              )}
              {item.icon === 'recent' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              )}
              {item.icon === 'star' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z"/>
                </svg>
              )}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      ) : isJsm ? (
        /* JSM left nav: Besties service project queues */
        <div className="sidebar__jsm-nav">
          {!collapsed && (
            <>
              <div className="sidebar__jsm-project">
                <div className="sidebar__jsm-badge">B</div>
                <div>
                  <strong className="sidebar__jsm-project-name">Besties</strong>
                  <span className="sidebar__jsm-project-type">Service Project</span>
                </div>
              </div>
              <button type="button" className="sidebar__jsm-back">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4"/></svg>
                Back to project
              </button>
              <div className="sidebar__jsm-label">All tickets</div>
              <div className="sidebar__jsm-section-label">STARRED</div>
              <ul className="sidebar__jsm-list">
                {STARRED_QUEUES.map(q => (
                  <li key={q.label} className={`sidebar__jsm-item${q.active ? ' sidebar__jsm-item--active' : ''}`}>
                    <span className="sidebar__jsm-item-label">{q.label}</span>
                    <span className="sidebar__jsm-item-count">{q.count}</span>
                  </li>
                ))}
              </ul>
              <div className="sidebar__jsm-section-label">TEAM PRIORITY</div>
              <button type="button" className="sidebar__jsm-group-toggle" onClick={() => setTeamPriorityOpen(o => !o)}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: teamPriorityOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M4 6l4 4 4-4"/></svg>
                <span>WP Technology</span>
                <span className="sidebar__jsm-group-meta">9 queues</span>
              </button>
              {teamPriorityOpen && (
                <ul className="sidebar__jsm-list">
                  {TEAM_PRIORITY_QUEUES.map(q => (
                    <li key={q.label} className="sidebar__jsm-item">
                      <span className="sidebar__jsm-item-label">{q.label}</span>
                      <span className="sidebar__jsm-item-count">{q.count}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="sidebar__jsm-bottom-links">
                <button type="button" className="sidebar__jsm-bottom-btn">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 0l-.5 1.5a5.5 5.5 0 00-1.4.8L3 1.8 1.8 3l.5 1.6a5.5 5.5 0 00-.8 1.4L0 6.5v1l1.5.5c.2.5.5 1 .8 1.4L1.8 11 3 12.2l1.6-.5c.4.3.9.6 1.4.8L6.5 14h1l.5-1.5c.5-.2 1-.5 1.4-.8l1.6.5L12.2 11l-.5-1.6c.3-.4.6-.9.8-1.4L14 7.5v-1l-1.5-.5a5.5 5.5 0 00-.8-1.4l.5-1.6L11 1.8 9.4 2.3A5.5 5.5 0 008 1.5L7.5 0h-1zM7 6a2 2 0 110 4A2 2 0 017 6z"/></svg>
                  Project settings
                </button>
                <button type="button" className="sidebar__jsm-bottom-btn">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4v4m0 2h.01"/></svg>
                  Give feedback
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Support Insights 360: Dashboard + INSIGHTS list */
        <>
          <nav className="sidebar__nav">
            <NavLink to="/insights" className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`} end>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.5 1.5l-5 4v8h4v-4h2v4h4v-8l-5-4z"/>
              </svg>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </nav>

          {!collapsed && (
            <div className="sidebar__insights">
              <div className="sidebar__insights-header">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1l1 5 5 1-5 1-1 5-1-5-5-1 5-1 1-5z"/>
                </svg>
                <span>INSIGHTS</span>
                <span className="sidebar__insights-count">{INSIGHTS.length}</span>
              </div>
              <ul className="sidebar__insight-list">
                {INSIGHTS.map(ins => (
                  <li key={ins.id}>
                    <NavLink
                      to={`/insight/${ins.id}`}
                      className={({ isActive }) =>
                        `sidebar__insight-item${isActive ? ' sidebar__insight-item--active' : ''}`
                      }
                    >
                      <span className={`sidebar__insight-dot severity-${ins.severity}`} />
                      <div>
                        <div className="sidebar__insight-label">{ins.label}</div>
                        <div className="sidebar__insight-detail">{ins.detail}</div>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* App switcher dropdown - direct child of sidebar, before experience-wrap */}
      <button
        type="button"
        className="sidebar__dropdown-trigger"
        ref={dropdownRef}
        onClick={() => setDropdownOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Switch application"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="sidebar__dropdown-icon">
          <path d="M2 2h6v6H2V2zm6 0h6v6H8V2zM2 8h6v6H2V8zm6 0h6v6H8V8z"/>
        </svg>
        {!collapsed && (
          <>
            <span className="sidebar__dropdown-label">{currentApp.label}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`sidebar__dropdown-chevron${dropdownOpen ? ' open' : ''}`}>
              <path d="M2 4l4 4 4-4"/>
            </svg>
          </>
        )}
      </button>
      <div ref={dropdownMenuRef} className="sidebar__dropdown-menu-wrap">
        {dropdownOpen && !collapsed && (
          <ul className="sidebar__dropdown-menu" role="listbox">
            {APP_OPTIONS.map(opt => (
              <li key={opt.id}>
                <button
                  type="button"
                  className={`sidebar__dropdown-item${currentApp.id === opt.id ? ' active' : ''}`}
                  onClick={() => {
                    onAppSwitch?.();
                    navigate(opt.path);
                    setDropdownOpen(false);
                  }}
                  role="option"
                  aria-selected={currentApp.id === opt.id}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Rovo mode dropdown (4 options) */}
      {!collapsed && (
        <div className="sidebar__experience-wrap sidebar__rovo-mode-wrap" ref={rovoModeDropdownRef}>
          <button
            type="button"
            className="sidebar__dropdown-trigger sidebar__experience-trigger"
            onClick={() => setRovoModeDropdownOpen(o => !o)}
            aria-haspopup="listbox"
            aria-expanded={rovoModeDropdownOpen}
            aria-label="Rovo mode"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 11-.001 10.001A5 5 0 018 3z"/>
            </svg>
            <span className="sidebar__dropdown-label">{ROVO_MODE_LABELS[rovoMode]}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`sidebar__dropdown-chevron${rovoModeDropdownOpen ? ' open' : ''}`}>
              <path d="M2 4l4 4 4-4"/>
            </svg>
          </button>
          {rovoModeDropdownOpen && (
            <ul className="sidebar__dropdown-menu sidebar__dropdown-menu--above" role="listbox">
              {ROVO_MODE_OPTIONS.map(opt => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={`sidebar__dropdown-item${rovoMode === opt.id ? ' active' : ''}`}
                    onClick={() => {
                      onRovoModeChange(opt.id);
                      setRovoModeDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={rovoMode === opt.id}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Experience dropdown (Option A / B) */}
      {!collapsed && (
        <div className="sidebar__experience-wrap" ref={experienceDropdownRef}>
          <button
            type="button"
            className="sidebar__dropdown-trigger sidebar__experience-trigger"
            onClick={() => setExperienceDropdownOpen(o => !o)}
            aria-haspopup="listbox"
            aria-expanded={experienceDropdownOpen}
            aria-label="Search experience"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1l1 5 5 1-5 1-1 5-1-5-5-1 5-1 1-5z"/>
            </svg>
            <span className="sidebar__dropdown-label">{popupExperience === 'optionB' ? 'Option B V 0.2' : 'Option A V 0.1'}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`sidebar__dropdown-chevron${experienceDropdownOpen ? ' open' : ''}`}>
              <path d="M2 4l4 4 4-4"/>
            </svg>
          </button>
          {experienceDropdownOpen && (
            <ul className="sidebar__dropdown-menu sidebar__dropdown-menu--above" role="listbox">
              {EXPERIENCE_OPTIONS.map(opt => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={`sidebar__dropdown-item${popupExperience === opt.id ? ' active' : ''}`}
                    onClick={() => {
                      onPopupExperienceChange(opt.id);
                      setExperienceDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={popupExperience === opt.id}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
};
