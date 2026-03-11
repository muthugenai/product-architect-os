import React, { useState } from 'react';
import './ContextChip.css';

interface ContextChipProps {
  url: string;
  dismissed?: boolean;
  onDismiss?: () => void;
  /** Show the inline "In Page Help" button (popup / search views only) */
  showHelp?: boolean;
  /** Called when a help link is clicked — use to close the popup before navigating */
  onNavigate?: () => void;
  /** Optional buttons/content rendered on the right side of the context row */
  actions?: React.ReactNode;
  /** Called when "In Page Help" prompt button is clicked — triggers AI search */
  onInPageHelp?: () => void;
  /** Called whenever the context checkbox is toggled — passes new checked state */
  onContextToggle?: (active: boolean) => void;
}

/** Checkbox icon — checked or unchecked */
const CheckboxIcon = ({ checked }: { checked: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    {checked ? (
      <>
        <rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="#6B778C" stroke="#6B778C"/>
        <path d="M3 7l2.8 2.8L11 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="white" stroke="#8993A4" strokeWidth="1.2"/>
    )}
  </svg>
);



export const ContextChip: React.FC<ContextChipProps> = ({ url, dismissed, onDismiss, showHelp = true, onNavigate, actions, onInPageHelp, onContextToggle }) => {
  const [checked, setChecked] = useState(true);
  const rawUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'williamsracing.com';
  const displayUrl = rawUrl;
  const showP1P2Status = /\/insights(\/|$)/.test(rawUrl);

  const handleToggle = () => {
    const next = !checked;
    setChecked(next);
    onContextToggle?.(next);
  };

  return (
    <div className="context-chip-wrap">
      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="context-chip-row">
        <span className="context-label">Context:</span>

        <button
          className={`context-chip${checked ? '' : ' context-chip--inactive'}`}
          onClick={handleToggle}
          aria-checked={checked}
          role="checkbox"
          title={checked ? 'Remove page context' : 'Add page context'}
        >
          <CheckboxIcon checked={checked} />
          <span className="context-chip__url">{displayUrl}{showP1P2Status && <span className="context-chip__url-suffix"> · P1/P2 Ticket status</span>}</span>
        </button>


        {actions && (
          <div className="context-actions">
            {actions}
          </div>
        )}

        {onDismiss && (
          <button
            type="button"
            className="context-chip-close"
            onClick={onDismiss}
            aria-label="Close context"
          >
            <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        )}
      </div>

    </div>
  );
};
