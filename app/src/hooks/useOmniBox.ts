import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type OmniBoxState =
  | 'closed'
  | 'default'
  | 'searching'
  | 'results'
  | 'chat_panel'
  | 'live_chat'
  | 'ticket_form'
  | 'case_tracker';

export type PendingAction = 'voice' | 'loom' | 'insights' | 'cases' | null;

export type InitialMainTab = 'help' | 'brief' | 'ai' | null;

export interface LoomAttachment {
  sharedUrl: string;
  thumbnailUrl: string;
}

export interface HelpArticleContext {
  title: string;
  category: string;
  updated: string;
  views: string;
  thumbsUp: number;
  href: string;
  description?: string;
  action?: 'apply_fix';
}

export interface OmniBoxContext {
  state: OmniBoxState;
  query: string;
  searchQuery: string;
  activePrompt: string;
  contextUrl: string;
  contextDismissed: boolean;
  pendingAction: PendingAction;
  loomAttachment: LoomAttachment | null;
  articleContext: HelpArticleContext | null;
  loomRecordingInProgress: boolean;
  setLoomRecordingInProgress: (v: boolean) => void;
  loomRecordingReady: boolean;
  setLoomRecordingReady: (v: boolean) => void;
  clearLoomReady: () => void;
  startLoomRecording: () => void;
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  submitQuery: (q: string) => void;
  submitSearch: (q: string) => void;
  clearSearch: () => void;
  openLiveChat: () => void;
  openTicketForm: () => void;
  openChatPanel: (prompt?: string) => void;
  openCaseTracker: () => void;
  dismissContext: () => void;
  restoreContext: () => void;
  setState: (s: OmniBoxState) => void;
  openWithAction: (action: PendingAction) => void;
  clearPendingAction: () => void;
  setLoomAttachment: (attachment: LoomAttachment | null) => void;
  setArticleContext: (article: HelpArticleContext | null) => void;
  fixConfirmed: boolean;
  setFixConfirmed: (v: boolean) => void;
  ticketCreatedByAgent: boolean;
  setTicketCreatedByAgent: (v: boolean) => void;
  initialMainTab: InitialMainTab;
  setInitialMainTab: (tab: InitialMainTab) => void;
  clearInitialMainTab: () => void;
}

export function useOmniBox(): OmniBoxContext {
  const [state, setState] = useState<OmniBoxState>('closed');
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePrompt, setActivePrompt] = useState('');
  const [contextDismissed, setContextDismissed] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [loomAttachment, setLoomAttachment] = useState<LoomAttachment | null>(null);
  const [articleContext, setArticleContext] = useState<HelpArticleContext | null>(null);
  const [loomRecordingInProgress, setLoomRecordingInProgress] = useState(false);
  const [loomRecordingReady, setLoomRecordingReady] = useState(false);
  const [fixConfirmed, setFixConfirmed] = useState(false);
  const [ticketCreatedByAgent, setTicketCreatedByAgent] = useState(false);
  const [initialMainTab, setInitialMainTabState] = useState<InitialMainTab>(null);
  const clearLoomReady = useCallback(() => {
    setLoomRecordingReady(false);
    setLoomAttachment(null);
  }, []);

  const startLoomRecording = useCallback(() => {
    setLoomRecordingInProgress(true);
  }, []);

  useEffect(() => {
    if (!loomRecordingInProgress) return;
    const t = setTimeout(() => {
      setLoomRecordingInProgress(false);
      setLoomRecordingReady(true);
      setLoomAttachment({
        sharedUrl: 'https://www.loom.com/share/mock-recording-id',
        thumbnailUrl: '',
      });
      setState('default'); /* bring back the popover when recording is done */
    }, 3200);
    return () => clearTimeout(t);
  }, [loomRecordingInProgress]);

  const location = useLocation();
  const base = 'https://williamsracing.com';
  const pathname = location.pathname || '/';
  const search = location.search || '';
  const hash = location.hash || '';
  const contextUrl =
    pathname === '/article' || pathname.startsWith('/article/')
      ? ''
      : pathname === '/' || pathname === ''
        ? `${base}/jsm/projects${search}${hash}`
        : pathname === '/insights'
          ? `${base}/insights${search}${hash}`
          : pathname.startsWith('/insight/')
            ? `${base}${pathname}${search}${hash}`
            : pathname.startsWith('/confluence')
              ? `${base}/confluence/pages${search}${hash}`
              : `${base}/jsm${pathname}${search}${hash}`;
  const popupRef = useRef<HTMLDivElement | null>(null);

  const open = useCallback(() => setState('default'), []);
  const close = useCallback(() => {
    setState('closed');
    setQuery('');
    setSearchQuery('');
    setLoomAttachment(null);
    setArticleContext(null);
    setLoomRecordingInProgress(false);
    setLoomRecordingReady(false);
    setFixConfirmed(false);
    setTicketCreatedByAgent(false);
  }, []);

  const submitQuery = useCallback((q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setState('results');
  }, []);

  const submitSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setSearchQuery(q.trim());
    setQuery(q.trim());
    setState('closed');
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setQuery('');
  }, []);

  const openLiveChat = useCallback(() => setState('live_chat'), []);
  const openTicketForm = useCallback(() => setState('ticket_form'), []);
  const openCaseTracker = useCallback(() => setState('case_tracker'), []);
  const openChatPanel = useCallback((prompt?: string) => {
    if (prompt) setActivePrompt(prompt);
    setState('chat_panel');
  }, []);
  const dismissContext = useCallback(() => setContextDismissed(true), []);
  const restoreContext = useCallback(() => setContextDismissed(false), []);
  const openWithAction = useCallback((action: PendingAction) => {
    setPendingAction(action);
    setState('default');
  }, []);
  const clearPendingAction = useCallback(() => setPendingAction(null), []);
  const setInitialMainTab = useCallback((tab: InitialMainTab) => setInitialMainTabState(tab), []);
  const clearInitialMainTab = useCallback(() => setInitialMainTabState(null), []);
  const setArticleContextWithReset = useCallback((article: HelpArticleContext | null) => {
    setArticleContext(article);
    if (!article) setFixConfirmed(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'closed') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state, close]);

  return {
    state, query, searchQuery, activePrompt, contextUrl, contextDismissed, pendingAction, loomAttachment, articleContext,
    loomRecordingInProgress, setLoomRecordingInProgress,
    loomRecordingReady, setLoomRecordingReady, clearLoomReady, startLoomRecording,
    open, close, setQuery, submitQuery, submitSearch, clearSearch,
    openLiveChat, openTicketForm, openChatPanel, openCaseTracker,
    dismissContext, restoreContext, setState,
    openWithAction, clearPendingAction, setLoomAttachment, setArticleContext: setArticleContextWithReset,
    fixConfirmed, setFixConfirmed,
    ticketCreatedByAgent, setTicketCreatedByAgent,
    initialMainTab, setInitialMainTab, clearInitialMainTab,
  };
}
