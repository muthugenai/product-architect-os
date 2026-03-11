import React, { useState, useEffect, useCallback } from 'react';
import './AgendaPage.css';

const SECTIONS = [
  {
    id: 'title',
    heading: 'Agenda',
    body: null,
    bullets: [
      { text: 'The Problem', highlight: 'Fragmented help and support touchpoints for Admins.' },
      { text: 'The Solution / Hypothesis', highlight: 'The Unified Ask Rovo Omni Bar.' },
      { text: 'The Demo', highlight: 'Shifting from reactive clicks to proactive AI.' },
      { text: 'The Outcome', highlight: 'Maximum ticket deflection and a seamless admin support experience.' },
    ],
  },
  {
    id: 'pain',
    heading: 'The Pain Point: A Fragmented UI',
    body: "Today, when an Admin needs help, they have to navigate four disconnected touchpoints:",
    bullets: [
      { text: 'Header Search', highlight: 'Geared toward general queries.', variant: 'search' as const },
      { text: 'Help Icon', highlight: 'Opens a redundant menu containing yet another search bar.', variant: 'help' as const },
      { text: 'Ask Rovo Button', highlight: 'A reactive sidekick isolated in the corner.', variant: 'askrovo' as const },
      { text: 'Loom Icon', highlight: 'A floating button in the bottom-left specifically for recording issues.', variant: 'loom' as const },
    ],
  },
  {
    id: 'shift',
    heading: 'The Shift: AI-Native & Proactive Support',
    body: null,
    paragraphs: [
      { label: 'Our Hypothesis', text: 'We can unify Search, Help, Ask Rovo, and Support into a single, seamless omnichannel experience.' },
      { label: null, text: 'By pulling Rovo out of the corner and making it front and center with the Unified Ask Rovo Omni Bar, we transform it from a passive tool into a proactive, predictive assistant. Instead of waiting for the user to ask, we let Rovo initiate the solution.' },
    ],
  },
  {
    id: 'demo',
    heading: 'The Demo: Driving Maximum Deflection',
    body: 'Imagine an Admin encounters an error message in Jira, JSM, or Confluence.',
    bullets: [
      { text: 'Proactive Intercept', highlight: 'The Omni Bar instantly detects the error, drops down, and offers a tailored solution: "Permissions error detected. Here is a quick fix."' },
      { text: 'Seamless Escalation', highlight: "Rovo's primary goal is to resolve the issue on the spot. If AI deflection isn't enough, the Omni Bar lets the user smoothly record a Loom video and escalate to a live agent or support ticket — without ever breaking their workflow." },
    ],
  },
  {
    id: 'conclusion',
    heading: 'The Conclusion',
    body: null,
    paragraphs: [
      { label: null, text: 'By consolidating these fragmented touchpoints, we are shifting from a confusing, reactive interface to an AI-first, predictive support experience.' },
      { label: 'The Result', text: 'Faster resolutions for our Admins and a significant reduction in basic support tickets.' },
    ],
  },
  {
    id: 'feedback',
    heading: 'Questions & Feedback',
    body: "I'd love to hear your thoughts on this direction. Please drop any questions, comments, or feedback below!",
  },
] as const;

export const AgendaPage: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const total = SECTIONS.length;

  const goNext = useCallback(() => setActiveIdx(i => Math.min(i + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setActiveIdx(i => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const section = SECTIONS[activeIdx];

  return (
    <div className="agenda-page" onClick={goNext}>
      <div className="agenda-page__page-header">
        <h1 className="agenda-page__page-title">Unified AI-Native Help and Support Experience</h1>
        <ul className="agenda-page__page-summary-list">
          <li className="agenda-page__page-summary-bullet">
            Admins face fragmented help and support across{' '}
            <span className="agenda-page__summary-tag agenda-page__summary-tag--search">Search</span>,{' '}
            <span className="agenda-page__summary-tag agenda-page__summary-tag--help">Help</span>,{' '}
            <span className="agenda-page__summary-tag agenda-page__summary-tag--askrovo">Ask Rovo</span>, and{' '}
            <span className="agenda-page__summary-tag agenda-page__summary-tag--loom">Loom</span>*.
          </li>
          <li className="agenda-page__page-summary-bullet">
            We unify them into a single, proactive AI-first Omni Bar.
          </li>
          <li className="agenda-page__page-summary-bullet">
            Driving maximum ticket deflection and a seamless support experience.
          </li>
        </ul>
      </div>
      <div className="agenda-page__progress">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`agenda-page__dot${i === activeIdx ? ' agenda-page__dot--active' : ''}${i < activeIdx ? ' agenda-page__dot--done' : ''}`}
            onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="agenda-page__slide" key={section.id}>
        <h1 className="agenda-page__heading">{section.heading}</h1>

        {'body' in section && section.body && (
          <p className="agenda-page__body">{section.body}</p>
        )}

        {'paragraphs' in section && (section as any).paragraphs && (
          <div className="agenda-page__paragraphs">
            {(section as any).paragraphs.map((p: { label: string | null; text: string }, pi: number) => (
              <p key={pi} className="agenda-page__paragraph">
                {p.label && <strong className="agenda-page__kw">{p.label}: </strong>}
                {p.text}
              </p>
            ))}
          </div>
        )}

        {'bullets' in section && (section as any).bullets && (
          <ul className="agenda-page__bullets">
            {(section as any).bullets.map((b: { text: string; highlight: string; variant?: string }, bi: number) => (
              <li
                key={bi}
                className={`agenda-page__bullet${b.variant ? ` agenda-page__bullet--${b.variant}` : ''}`}
                style={{ animationDelay: `${bi * 120}ms` }}
              >
                <strong className="agenda-page__kw">{b.text}:</strong>{' '}
                <span className="agenda-page__hl">{b.highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="agenda-page__nav" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="agenda-page__nav-btn"
          onClick={goPrev}
          disabled={activeIdx === 0}
          aria-label="Previous"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span className="agenda-page__nav-count">{activeIdx + 1} / {total}</span>
        <button
          type="button"
          className="agenda-page__nav-btn"
          onClick={goNext}
          disabled={activeIdx === total - 1}
          aria-label="Next"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
        </button>
      </div>

      <p className="agenda-page__hint">Use arrow keys, spacebar, or click to navigate</p>
    </div>
  );
};
