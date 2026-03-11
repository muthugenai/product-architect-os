import React from 'react';
import { RovoIcon } from '../components/icons/RovoIcon';
import type { OmniBoxContext } from '../hooks/useOmniBox';
import './RecordingReadyPage.css';

interface RecordingReadyPageProps {
  omniBox: OmniBoxContext;
}

export const RecordingReadyPage: React.FC<RecordingReadyPageProps> = ({ omniBox }) => {
  const handleBack = () => {
    omniBox.clearLoomReady();
  };

  const handleGetSupport = () => {
    omniBox.setQuery('I need help with an issue — see my screen recording.');
    omniBox.setArticleContext({
      title: 'Support with Loom recording',
      category: 'Loom · Get support',
      updated: '',
      views: '',
      thumbsUp: 0,
      href: omniBox.loomAttachment?.sharedUrl ?? '#',
      description: 'Screen recording attached for context.',
    });
    omniBox.openChatPanel('__loom_support__');
  };

  return (
    <div className="recording-ready-page">
      <div className="recording-ready-page__card">
        <div className="recording-ready-page__icon-wrap">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="recording-ready-page__check">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 className="recording-ready-page__title">Recording ready</h1>
        <p className="recording-ready-page__sub">
          Your recording has been saved. Open in Rovo and we&rsquo;ll use it for context.
        </p>
        <div className="recording-ready-page__actions">
          <button type="button" className="recording-ready-page__btn recording-ready-page__btn--primary" onClick={handleGetSupport}>
            <RovoIcon size={18} />
            Open in Rovo
          </button>
          <button type="button" className="recording-ready-page__btn recording-ready-page__btn--secondary" onClick={handleBack}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5"/>
            </svg>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
