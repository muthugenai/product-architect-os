import React, { RefObject, useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RovoIcon } from '../icons/RovoIcon';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import type { UseProactiveAlertsReturn } from '../../hooks/useProactiveAlerts';
import type { PopupExperience } from '../../App';
import './AppHeader.css';

/** 2–3 insight chips shown in the header bar after Loom (id, label, icon type) */
const HEADER_INSIGHTS = [
  { id: 'i1', label: 'P1/P2 Tickets Surge', icon: 'chart' as const },
  { id: 'i2', label: 'Resolution Time Spike', icon: 'clock' as const },
  { id: 'i3', label: 'SLA Breach Risk', icon: 'alert' as const },
];

/** Colored Loom icon for header — shows in color on hover; same as Option A popup */
const LoomIconColored: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="#625DF5"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
    <circle cx="16" cy="16" r="3" fill="#625DF5"/>
    <rect x="15" y="1" width="2" height="8" rx="1" fill="white"/>
    <rect x="15" y="23" width="2" height="8" rx="1" fill="white"/>
    <rect x="1" y="15" width="8" height="2" rx="1" fill="white"/>
    <rect x="23" y="15" width="8" height="2" rx="1" fill="white"/>
    <rect x="4.22" y="4.22" width="8" height="2" rx="1" transform="rotate(45 4.22 4.22)" fill="white"/>
    <rect x="19.66" y="19.66" width="8" height="2" rx="1" transform="rotate(45 19.66 19.66)" fill="white"/>
    <rect x="25.78" y="4.22" width="2" height="8" rx="1" transform="rotate(45 25.78 4.22)" fill="white"/>
    <rect x="10.34" y="19.66" width="2" height="8" rx="1" transform="rotate(45 10.34 19.66)" fill="white"/>
  </svg>
);

interface AppHeaderProps {
  omniBox: OmniBoxContext;
  proactiveAlerts?: UseProactiveAlertsReturn;
  popupExperience?: PopupExperience;
  barAnchorRef?: RefObject<HTMLDivElement>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ omniBox, proactiveAlerts, popupExperience = 'optionA', barAnchorRef }) => {
  const location = useLocation();
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const [loomMenuOpen, setLoomMenuOpen] = useState(false);
  const loomMenuRef = useRef<HTMLDivElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const syncInputWidth = (value: string) => {
    if (mirrorRef.current) {
      mirrorRef.current.textContent = value || '';
      setInputWidth(value ? mirrorRef.current.scrollWidth + 4 : undefined);
    }
  };

  /* Close help dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) setHelpMenuOpen(false);
    };
    if (helpMenuOpen) {
      document.addEventListener('click', handler, true);
      return () => document.removeEventListener('click', handler, true);
    }
  }, [helpMenuOpen]);

  /* Close Loom dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (loomMenuRef.current && !loomMenuRef.current.contains(e.target as Node)) setLoomMenuOpen(false);
    };
    if (loomMenuOpen) {
      document.addEventListener('click', handler, true);
      return () => document.removeEventListener('click', handler, true);
    }
  }, [loomMenuOpen]);

  const startLoomRecording = () => {
    setLoomMenuOpen(false);
    omniBox.setState('closed');
    omniBox.startLoomRecording();
  };

  const handleBarClick = () => {
    if (omniBox.state === 'closed' && !omniBox.searchQuery) omniBox.open();
  };
  const hasAlert = proactiveAlerts?.hasActiveAlert ?? false;
  const hasSearch = !!omniBox.searchQuery;
  const insightId = location.pathname.match(/^\/insight\/([^/]+)/)?.[1] ?? null;
  /* Option B: expanded state is shown as overlay from App, not in header — bar stays normal */
  const isActive = omniBox.state !== 'closed';
  const isOptionB = popupExperience === 'optionB';

  /* Auto-focus the header input when Option B popover opens */
  useEffect(() => {
    if (isOptionB && isActive) {
      const t = setTimeout(() => headerInputRef.current?.focus({ preventScroll: false }), 120);
      return () => clearTimeout(t);
    }
  }, [isOptionB, isActive]);

  const hasMenuOpen = helpMenuOpen || loomMenuOpen;

  return (
    <header className={`app-header${hasMenuOpen ? ' app-header--menu-open' : ''}`}>
      <div className="app-header__row">
        <div className="app-header__bar-wrap">
          <div
            ref={barAnchorRef}
            className={`omnibox-bar${isActive ? ' omnibox-bar--active' : ''}${hasAlert ? ' omnibox-bar--alert' : ''}${hasSearch ? ' omnibox-bar--searching' : ''}`}
            onClick={handleBarClick}
            role="button"
            tabIndex={0}
            aria-label="Ask Rovo for Help"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBarClick(); }}
          >
        <RovoIcon size={20} />
        {omniBox.loomRecordingInProgress ? (
          <span className="omnibox-bar__placeholder omnibox-bar__recording">
            <span className="omnibox-bar__recording-spinner" aria-hidden="true" />
            Recording…
          </span>
        ) : hasSearch ? (
          <span className="omnibox-bar__search-query">
            {omniBox.searchQuery}
          </span>
        ) : isOptionB && isActive ? (
          <span className="omnibox-bar__input-wrap">
            <span ref={mirrorRef} className="omnibox-bar__input-mirror" aria-hidden="true" />
            <input
              ref={headerInputRef}
              type="text"
              className="omnibox-bar__input"
              placeholder="Ask Rovo for Help"
              value={omniBox.query}
              style={inputWidth ? { width: inputWidth } : { flex: 1 }}
              onChange={e => { omniBox.setQuery(e.target.value); syncInputWidth(e.target.value); }}
              onKeyDown={e => { if (e.key === 'Enter' && omniBox.query.trim()) { e.preventDefault(); omniBox.submitSearch(omniBox.query.trim()); } }}
              onClick={e => e.stopPropagation()}
              aria-label="Ask Rovo for Help"
              autoComplete="off"
            />
          </span>
        ) : (
          <span className="omnibox-bar__placeholder">
            {(!isOptionB || isActive) && <span className="omnibox-bar__cursor" aria-hidden="true">|</span>}
            Ask Rovo for Help
            {isOptionB && !isActive && <span className="omnibox-bar__shortcut-hint" aria-hidden="true"> Press <span className="omnibox-bar__shortcut-key">R</span></span>}
          </span>
        )}
        {isActive && (hasSearch || !!omniBox.query.trim()) && (
          <div className="omnibox-bar__close-and-divider">
            <button
              type="button"
              className="omnibox-bar__input-clear"
              aria-label={hasSearch ? 'Clear search' : 'Clear text'}
              onClick={e => {
                e.stopPropagation();
                if (hasSearch) omniBox.clearSearch();
                else { omniBox.setQuery(''); syncInputWidth(''); omniBox.setInitialMainTab('help'); headerInputRef.current?.focus(); }
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
            <span className="omnibox-bar__divider" aria-hidden="true" />
          </div>
        )}
        <div className="omnibox-bar__actions">
          <button className="btn btn-icon omnibox-bar__action" aria-label="Add" onClick={e => { e.stopPropagation(); handleBarClick(); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 2v12M2 8h12"/>
            </svg>
          </button>
          <button className="btn btn-icon omnibox-bar__action" aria-label="Voice input" onClick={e => { e.stopPropagation(); omniBox.openWithAction('voice'); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3zm-1 3a1 1 0 012 0v4a1 1 0 01-2 0V4zM4 7a4 4 0 008 0h2a6 6 0 01-12 0h2zM7 14h2v2H7v-2z"/>
            </svg>
          </button>
          <div className={`omnibox-bar__dropdown-wrap omnibox-bar__dropdown-wrap--loom${loomMenuOpen ? ' omnibox-bar__dropdown-wrap--open' : ''}`} ref={loomMenuRef}>
            <button
              type="button"
              className="btn btn-icon omnibox-bar__action omnibox-bar__action--loom"
              aria-label="Record with Loom"
              aria-haspopup="true"
              aria-expanded={loomMenuOpen}
              onClick={e => { e.stopPropagation(); setHelpMenuOpen(false); setLoomMenuOpen(v => !v); }}
            >
              <LoomIconColored size={14} />
            </button>
            {loomMenuOpen && (
              <div className="omnibox-bar__dropdown omnibox-bar__dropdown--open" role="menu">
                <button type="button" role="menuitem" className="omnibox-bar__dropdown-item" onClick={startLoomRecording}>
                  <span className="omnibox-bar__dropdown-item-icon">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="14" height="10" rx="2"/><path d="M5 14h6M8 12v2"/><circle cx="12" cy="5" r="2.5" fill="currentColor" stroke="currentColor"/></svg>
                  </span>
                  <span><strong>Record a Loom</strong><em>Screen &amp; camera</em></span>
                </button>
                <button type="button" role="menuitem" className="omnibox-bar__dropdown-item" onClick={startLoomRecording}>
                  <span className="omnibox-bar__dropdown-item-icon">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="14" height="10" rx="2"/><path d="M5 14h6M8 12v2"/></svg>
                  </span>
                  <span><strong>Record screen only</strong><em>No camera</em></span>
                </button>
                <button type="button" role="menuitem" className="omnibox-bar__dropdown-item" onClick={startLoomRecording}>
                  <span className="omnibox-bar__dropdown-item-icon">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4h9v8H1zM10 6l5-2v8l-5-2V6z"/></svg>
                  </span>
                  <span><strong>Record camera only</strong><em>No screen share</em></span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className={`btn btn-icon omnibox-bar__action omnibox-bar__action--insight${!(omniBox.query.trim() || omniBox.searchQuery) ? ' omnibox-bar__action--insight-disabled' : ''}`}
            aria-label="Support Agent Insights"
            title={omniBox.query.trim() || omniBox.searchQuery ? 'Support Agent Insights' : 'Start typing to enable'}
            aria-disabled={!(omniBox.query.trim() || omniBox.searchQuery)}
            disabled={!(omniBox.query.trim() || omniBox.searchQuery)}
            onClick={e => {
              if (!(omniBox.query.trim() || omniBox.searchQuery)) return;
              e.stopPropagation();
              omniBox.openWithAction('insights');
            }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="omnibox-bar__sai-icon">
              <path d="M1 11V9a9 9 0 0118 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 016 11v2.5A2.5 2.5 0 013.5 16h0A2.5 2.5 0 011 13.5V11zM14 11a2.5 2.5 0 012.5-2.5h0A2.5 2.5 0 0119 11v2.5a2.5 2.5 0 01-2.5 2.5h0A2.5 2.5 0 0114 13.5V11z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 13.5v1.5a2.5 2.5 0 01-2.5 2.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 8.8l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4.4-1z" fill="#6554C0"/>
              <circle cx="11.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>
              <path d="M14.5 2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5L12.4 4.1l1.5-.6z" fill="#6554C0"/>
              <path d="M17 5.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="#6554C0"/>
            </svg>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="omnibox-bar__sai-arrow" aria-hidden="true">
              <path d="M2 10l6-6 6 6"/>
            </svg>
          </button>
          {/* Option B: send lives in popover and is shown only when user types; clicking header opens popover to type */}
        </div>
        </div>
        </div>
      <div className="app-header__actions">
        <button className="btn btn-icon app-header__notification-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2a5 5 0 00-5 5c0 4-2 5-2 5h14s-2-1-2-5a5 5 0 00-5-5z"/>
            <path d="M8.5 17a1.5 1.5 0 003 0"/>
          </svg>
          <span className="app-header__notification-badge">4</span>
        </button>
        <button className="btn btn-icon" aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="3"/>
            <path d="M19.4 12.58a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H1a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H7a1.65 1.65 0 001-1.51V1a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V7c.26.604.852.997 1.51 1H19a2 2 0 010 4h-.09c-.658.003-1.25.396-1.51 1z"/>
          </svg>
        </button>
        <div className="app-header__avatar" aria-label="User menu">JD</div>
      </div>
      </div>
    </header>
  );
};
