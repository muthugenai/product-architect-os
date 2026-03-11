import React, { useEffect, useRef } from 'react';
import { OmniBoxPopup } from './OmniBoxPopup';
import { SearchResults } from './SearchResults';
import { SupportTicketForm } from '../ticket/SupportTicketForm';
import { CaseTracker } from './CaseTracker';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import type { RecentQuestion } from '../../data/mockRecentQuestions';
import type { UseProactiveAlertsReturn } from '../../hooks/useProactiveAlerts';
import type { PopupExperience, RovoMode } from '../../App';
import './OmniBox.css';

interface OmniBoxProps {
  omniBox: OmniBoxContext;
  recentQuestions: RecentQuestion[];
  onQuerySubmit: (q: string) => void;
  proactiveAlerts?: UseProactiveAlertsReturn;
  popupExperience?: PopupExperience;
  rovoMode?: RovoMode;
  barAnchorRef?: React.RefObject<HTMLDivElement>;
}

export const OmniBox: React.FC<OmniBoxProps> = ({ omniBox, recentQuestions, onQuerySubmit, proactiveAlerts, popupExperience = 'optionA', rovoMode = 'reactive', barAnchorRef }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Click outside overlay to close (but not for side panels)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) omniBox.close();
  };

  const isModal = omniBox.state === 'default' || omniBox.state === 'results' || omniBox.state === 'ticket_form' || omniBox.state === 'case_tracker';
  const showOverlay = isModal;
  const showDefaultPopup = omniBox.state === 'default';

  if (omniBox.state === 'closed' || omniBox.state === 'chat_panel' || omniBox.state === 'live_chat') return null;

  return (
    <>
      {showOverlay && (
        <div
          className="omnibox-overlay"
          ref={overlayRef}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {showDefaultPopup && (
        <OmniBoxPopup
          omniBox={omniBox}
          recentQuestions={recentQuestions}
          onQuerySubmit={onQuerySubmit}
          proactiveAlerts={proactiveAlerts}
          variant={popupExperience}
          rovoMode={rovoMode}
          barAnchorRef={barAnchorRef}
        />
      )}

      {omniBox.state === 'results' && (
        <SearchResults
          omniBox={omniBox}
          recentQuestions={recentQuestions}
          onQuerySubmit={onQuerySubmit}
        />
      )}

      {omniBox.state === 'ticket_form' && (
        <SupportTicketForm omniBox={omniBox} />
      )}

      {omniBox.state === 'case_tracker' && (
        <CaseTracker omniBox={omniBox} />
      )}
    </>
  );
};
