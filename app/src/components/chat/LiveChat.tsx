import React, { useState, useEffect, useRef } from 'react';
import { RovoIcon } from '../icons/RovoIcon';
import type { OmniBoxContext } from '../../hooks/useOmniBox';
import './LiveChat.css';

interface LiveChatProps {
  omniBox: OmniBoxContext;
}

type ChatPhase = 'connecting' | 'conversation';

interface ConvoMsg {
  id: string;
  role: 'agent' | 'user' | 'system';
  text: string;
  html?: string;
}

function buildContextSummary(omniBox: OmniBoxContext): string {
  const article = omniBox.articleContext;
  if (article?.title) {
    return article.title;
  }
  const q = omniBox.query?.trim();
  if (q) return q;
  return 'an issue on the JSM queue page';
}

const AGENT_NAME = 'Sarah A.';
const AGENT_INITIALS = 'SA';

const TICKET_CREATED = { key: 'WPT-1042', status: 'OPEN', href: '#' };

function buildScript(summary: string): ConvoMsg[] {
  return [
    {
      id: 'a1',
      role: 'agent',
      text: `Hi there! I'm ${AGENT_NAME}, your support specialist. I can see you were looking at "${summary}". Let me pull up the details — one moment.`,
    },
    {
      id: 'a2',
      role: 'agent',
      text: `I can see tickets SEC-001, IT-003 and IT-001 have exceeded the "Time to first response" SLA. No agent has responded yet. I'd recommend we get this tracked and resolved right away.`,
    },
    {
      id: 'u1',
      role: 'user',
      text: 'Yes, please. Can you create a ticket so the team can investigate and reassign?',
    },
    {
      id: 'a3',
      role: 'agent',
      text: "Absolutely \u2014 I'll create a high-priority ticket now with the SLA breach details and assign it to the on-call queue manager.",
    },
    {
      id: 'sys1',
      role: 'system',
      text: '',
      html: `<div class="live-chat__ticket-card">
        <div class="live-chat__ticket-card-header">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#36B37E"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.7 6.3l-4.5 4.5a.5.5 0 01-.7 0L4.3 8.6a.5.5 0 01.7-.7L6.9 9.8l4.1-4.1a.5.5 0 01.7.6z"/></svg>
          <span>Ticket created</span>
        </div>
        <div class="live-chat__ticket-card-body">
          <div class="live-chat__ticket-card-row"><span class="live-chat__ticket-card-label">Key</span><span class="live-chat__ticket-card-value"><a href="#" class="live-chat__ticket-link">WPT-1042</a></span></div>
          <div class="live-chat__ticket-card-row"><span class="live-chat__ticket-card-label">Summary</span><span class="live-chat__ticket-card-value">SLA breach — SEC-001, IT-003, IT-001 require immediate response</span></div>
          <div class="live-chat__ticket-card-row"><span class="live-chat__ticket-card-label">Priority</span><span class="live-chat__ticket-card-value live-chat__ticket-card-value--high">🔴 High</span></div>
          <div class="live-chat__ticket-card-row"><span class="live-chat__ticket-card-label">Assignee</span><span class="live-chat__ticket-card-value">Queue Manager (on-call)</span></div>
          <div class="live-chat__ticket-card-row"><span class="live-chat__ticket-card-label">Status</span><span class="live-chat__ticket-card-value"><span class="live-chat__status-badge">OPEN</span></span></div>
        </div>
      </div>`,
    },
    {
      id: 'a4',
      role: 'agent',
      text: '',
      html: 'Done! Ticket <a href="#" class="live-chat__ticket-link">WPT-1042</a> has been created and assigned. The queue manager will get an alert immediately. Is there anything else I can help with?',
    },
  ];
}

export const LiveChat: React.FC<LiveChatProps> = ({ omniBox }) => {
  const [phase, setPhase] = useState<ChatPhase>('connecting');
  const [visibleMessages, setVisibleMessages] = useState<ConvoMsg[]>([]);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<ConvoMsg[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const summary = buildContextSummary(omniBox);

  useEffect(() => {
    scriptRef.current = buildScript(summary);
  }, [summary]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  useEffect(() => {
    if (phase !== 'connecting') return;
    const t = setTimeout(() => {
      setPhase('conversation');
    }, 2500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'conversation') return;
    if (scriptIdx >= scriptRef.current.length) return;

    const next = scriptRef.current[scriptIdx];
    const delay = next.role === 'user' ? 2200 : next.role === 'system' ? 1400 : 1800;

    timerRef.current = setTimeout(() => {
      setVisibleMessages(prev => [...prev, next]);
      setScriptIdx(i => i + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, scriptIdx]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setVisibleMessages(prev => [
      ...prev,
      { id: `usr-${Date.now()}`, role: 'user', text: val },
    ]);
    setInput('');
    setTimeout(() => {
      setVisibleMessages(prev => [
        ...prev,
        { id: `agt-${Date.now()}`, role: 'agent', text: "I'll look into that for you. Is there anything specific you'd like me to check?" },
      ]);
    }, 1200);
  };

  const allScriptDone = scriptIdx >= scriptRef.current.length && visibleMessages.length >= scriptRef.current.length;

  useEffect(() => {
    if (allScriptDone) omniBox.setTicketCreatedByAgent(true);
  }, [allScriptDone, omniBox]);

  return (
    <div className="live-chat" role="dialog" aria-label="Live Chat" aria-modal="true">
      <div className="live-chat__header">
        <div className="live-chat__header-left">
          <RovoIcon size={26} />
          <span className="live-chat__title">Rovo</span>
          <span className="live-chat__subtitle">/ Live Agent</span>
          <div className="live-chat__header-dot" />
        </div>
        <button className="btn btn-icon" onClick={omniBox.close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {phase === 'connecting' && (
        <div className="live-chat__connecting">
          <div className="live-chat__connecting-dots">
            <div className="live-chat__queue-dot" />
            <div className="live-chat__queue-dot" />
            <div className="live-chat__queue-dot" />
          </div>
          <h3 className="live-chat__connecting-title">Connecting you to an agent…</h3>
          <p className="live-chat__connecting-sub">
            Sharing context: <strong>{summary}</strong>
          </p>
        </div>
      )}

      {phase === 'conversation' && (
        <>
          <div className="live-chat__agent-bar">
            <div className="live-chat__agent-avatar">{AGENT_INITIALS}</div>
            <div>
              <div className="live-chat__agent-name">{AGENT_NAME} — Support Specialist</div>
              <div className="live-chat__agent-status">
                <span className="live-chat__agent-dot" />Active
              </div>
            </div>
          </div>

          <div className="live-chat__messages">
            {visibleMessages.map(msg => (
              <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
                {msg.role === 'agent' && (
                  <div className="chat-msg__avatar chat-msg__avatar--agent">{AGENT_INITIALS}</div>
                )}
                {msg.role === 'system' && msg.html ? (
                  <div className="chat-msg__system" dangerouslySetInnerHTML={{ __html: msg.html }} />
                ) : msg.html ? (
                  <div className="chat-msg__bubble" dangerouslySetInnerHTML={{ __html: msg.html }} />
                ) : (
                  <div className="chat-msg__bubble">{msg.text}</div>
                )}
              </div>
            ))}

            {!allScriptDone && scriptIdx < scriptRef.current.length && (
              <div className="chat-msg chat-msg--agent">
                <div className="chat-msg__avatar chat-msg__avatar--agent">{AGENT_INITIALS}</div>
                <div className="chat-msg__typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {allScriptDone && (
              <div className="live-chat__action-taken" role="status">
                <span className="live-chat__action-taken-label">Action taken: Ticket created</span>
                <a href={TICKET_CREATED.href} className="live-chat__action-taken-link">{TICKET_CREATED.key}</a>
                <span className="live-chat__action-taken-status">Status: {TICKET_CREATED.status}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="live-chat__input-wrap">
            <form className="live-chat__form" onSubmit={handleSend}>
              <input
                className="live-chat__input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message…"
                autoFocus
              />
              <button className={`btn live-chat__send${input.trim() ? ' active' : ''}`} type="submit">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1l13 7-13 7V10l8-2-8-2V1z"/></svg>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
