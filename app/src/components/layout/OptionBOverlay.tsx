import React from 'react';
import { RovoIcon } from '../icons/RovoIcon';
import { OmniBoxPopup } from '../omnibox/OmniBoxPopup';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import type { UseProactiveAlertsReturn } from '../../hooks/useProactiveAlerts';
import type { RecentQuestion } from '../../data/mockRecentQuestions';
import './OptionBOverlay.css';

interface OptionBOverlayProps {
  omniBox: OmniBoxContext;
  recentQuestions: RecentQuestion[];
  onQuerySubmit: (q: string) => void;
  proactiveAlerts?: UseProactiveAlertsReturn;
}

/**
 * Option B: overlay when user clicks the header search field.
 * Expanded bar + popup content (no header/X) overlay the page; content is not pushed down.
 */
export const OptionBOverlay: React.FC<OptionBOverlayProps> = ({
  omniBox,
  recentQuestions,
  onQuerySubmit,
  proactiveAlerts,
}) => {
  return (
    <div
      className="option-b-overlay"
      onClick={() => omniBox.close()}
      role="presentation"
      aria-hidden="true"
    >
      {/* Bar row: same padding, layout and position as header so expanded bar aligns with header search field */}
      <div className="option-b-overlay__bar-row" onClick={e => e.stopPropagation()} role="presentation">
        <div className="option-b-overlay__bar-wrap">
          <div className="omnibox-bar omnibox-bar--active omnibox-bar--expanded option-b-overlay__expanded-bar" aria-hidden="true">
            <RovoIcon size={20} />
            <span className="omnibox-bar__placeholder">
              Ask Rovo for Help
            </span>
          </div>
        </div>
        {/* Spacer matching header actions width so bar position matches header exactly */}
        <div className="option-b-overlay__bar-row-spacer" aria-hidden="true" />
      </div>
      <div
        className="option-b-overlay__content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Ask Rovo for Help"
      >
        <div className="option-b-overlay__body">
          <OmniBoxPopup
            omniBox={omniBox}
            recentQuestions={recentQuestions}
            onQuerySubmit={onQuerySubmit}
            proactiveAlerts={proactiveAlerts}
            inline
            hideHeader
          />
        </div>
      </div>
    </div>
  );
};
