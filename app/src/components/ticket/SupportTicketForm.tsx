import React, { useState, useCallback, useEffect } from 'react';
import { LoomRecorder } from './LoomRecorder';
import { ContextChip } from '../omnibox/ContextChip';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import './SupportTicketForm.css';

interface SupportTicketFormProps {
  omniBox: OmniBoxContext;
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ omniBox }) => {
  const [subject, setSubject] = useState(omniBox.query || '');
  const [description, setDescription] = useState(omniBox.query ? `Issue context: ${omniBox.query}` : '');
  const [priority, setPriority] = useState('medium');
  const [loomUrl, setLoomUrl] = useState('');
  const [loomThumb, setLoomThumb] = useState('');
  const [submitted, setSubmitted] = useState(false);

  /* Pre-fill Loom from Get Support flow (e.g. Record screen only → Get support → Create ticket) */
  useEffect(() => {
    if (omniBox.loomAttachment) {
      setLoomUrl(omniBox.loomAttachment.sharedUrl);
      setLoomThumb(omniBox.loomAttachment.thumbnailUrl);
      omniBox.setLoomAttachment(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoomComplete = useCallback((url: string, thumb: string) => {
    setLoomUrl(url);
    setLoomThumb(thumb);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="ticket-form" role="dialog" aria-label="Support Ticket Submitted" aria-modal="true">
        <div className="ticket-form__header">
          <span className="ticket-form__title">Support Ticket</span>
          <button className="btn btn-icon" onClick={omniBox.close} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="ticket-form__success">
          <div className="ticket-form__success-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="var(--ads-green-100)"/>
              <path d="M9 17l5 5 9-10" stroke="var(--ads-green-700)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="ticket-form__success-title">Ticket Submitted!</h3>
          <p className="ticket-form__success-sub">
            Your ticket <strong>#JSM-5821</strong> has been created. We&rsquo;ll reply within 4 hours.
          </p>
          {loomUrl && (
            <div className="ticket-form__success-loom">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1l1.8 3.6L14 5.7l-3 2.9.7 4.1L8 10.7l-3.7 1.9.7-4.1-3-2.9 4.2-.6L8 1z"/>
              </svg>
              Screen recording attached
            </div>
          )}
          <button className="btn btn-primary" onClick={omniBox.close} style={{ marginTop: 16 }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-form" role="dialog" aria-label="Create Support Ticket" aria-modal="true">
      <div className="ticket-form__header">
        <button className="ticket-form__back" onClick={omniBox.open} aria-label="Back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          Back
        </button>
        <span className="ticket-form__title">Create a Support Ticket</span>
        <div className="ticket-form__header-actions">
          <a
            className="ticket-form__new-tab-link"
            href="https://support.atlassian.com/contact/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open support portal in a new tab"
          >
            Open in new tab
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M9 1h6v6l-2-2-5 5-1-1 5-5L9 1zM2 3h5v1H3v9h9V9h1v5H2V3z"/>
            </svg>
          </a>
          <button className="btn btn-icon" onClick={omniBox.close} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M13 1L1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <form className="ticket-form__body" onSubmit={handleSubmit}>
        {/* Subject */}
        <div className="ticket-form__field">
          <label className="ticket-form__label" htmlFor="tf-subject">
            Subject <span className="ticket-form__required">*</span>
          </label>
          <input
            id="tf-subject"
            className="ticket-form__input"
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
            required
            autoFocus
          />
        </div>

        {/* Priority */}
        <div className="ticket-form__field">
          <label className="ticket-form__label" htmlFor="tf-priority">Priority</label>
          <select
            id="tf-priority"
            className="ticket-form__select"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="critical">P1 – Critical (Site down)</option>
            <option value="high">P2 – High (Major impairment)</option>
            <option value="medium">P3 – Medium (Partial impairment)</option>
            <option value="low">P4 – Low (Minor issue)</option>
          </select>
        </div>

        {/* Description */}
        <div className="ticket-form__field">
          <label className="ticket-form__label" htmlFor="tf-desc">Description</label>
          <textarea
            id="tf-desc"
            className="ticket-form__textarea"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the issue in detail — steps to reproduce, expected vs actual behavior…"
          />
        </div>

        {/* Page context */}
        <ContextChip
          url={omniBox.contextUrl}
          dismissed={omniBox.contextDismissed}
          onDismiss={omniBox.dismissContext}
          showHelp={false}
        />

        {/* Loom */}
        <div className="ticket-form__field">
          <label className="ticket-form__label">Screen Recording</label>
          {loomUrl ? (
            <div className="ticket-form__loom-attached">
              <span className="ticket-form__loom-attached-label">Screen recording attached for review</span>
              <a href={loomUrl} target="_blank" rel="noopener noreferrer" className="ticket-form__loom-attached-link">Watch recording</a>
              <input type="hidden" name="loom-url" value={loomUrl} />
              <button type="button" className="btn btn-icon ticket-form__loom-remove" onClick={() => { setLoomUrl(''); setLoomThumb(''); }} aria-label="Remove recording">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><path d="M13 1L1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          ) : (
            <>
              <p className="ticket-form__hint">
                Record your screen to show the issue. Powered by{' '}
                <a href="https://loom.com" target="_blank" rel="noreferrer" style={{ color: '#FF5733' }}>Loom</a>.
              </p>
              <LoomRecorder onRecordingComplete={handleLoomComplete} />
              <div className="ticket-form__field">
                <label className="ticket-form__label" htmlFor="tf-loom">Or paste a Loom URL</label>
                <input
                  id="tf-loom"
                  className="ticket-form__input"
                  type="url"
                  value={loomUrl}
                  onChange={e => setLoomUrl(e.target.value)}
                  placeholder="https://www.loom.com/share/…"
                />
              </div>
            </>
          )}
        </div>

        <div className="ticket-form__footer">
          <button type="button" className="btn btn-subtle" onClick={omniBox.open}>← Back</button>
          <button type="submit" className="btn btn-primary" disabled={!subject.trim()}>Submit Ticket</button>
        </div>
      </form>
    </div>
  );
};
