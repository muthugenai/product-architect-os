import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { AppHeader } from './components/layout/AppHeader';
import { OmniBox } from './components/omnibox/OmniBox';
import { RovoSidePanel } from './components/chat/RovoSidePanel';
import { LiveChat } from './components/chat/LiveChat';
import { Dashboard } from './components/dashboard/Dashboard';
import { ArticlePage } from './pages/ArticlePage';
import { InsightPage } from './pages/InsightPage';
import { ConfluencePage } from './pages/ConfluencePage';
import { JsmPage } from './pages/JsmPage';
import { SpacesPage } from './pages/SpacesPage';
import { AgendaPage } from './pages/AgendaPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { SupportInsightsIconDemo } from './components/icons/SupportInsightsIcons';
import { useOmniBox } from './hooks/useOmniBox';
import { useRecentlyAsked } from './hooks/useRecentlyAsked';
import { useProactiveAlerts } from './hooks/useProactiveAlerts';
import './styles/global.css';
import './App.css';

export type PopupExperience = 'optionA' | 'optionB';

export type RovoMode = 'reactive' | 'proactive' | 'predictive' | 'god';

/** Inner app — must live inside BrowserRouter so useProactiveAlerts (useLocation) works */
const AppInner: React.FC = () => {
  const omniBox = useOmniBox();
  const proactiveAlerts = useProactiveAlerts();
  const { questions, addQuestion } = useRecentlyAsked();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [popupExperience, setPopupExperience] = useState<PopupExperience>('optionB');
  const [rovoMode, setRovoMode] = useState<RovoMode>('reactive');

  const handleQuerySubmit = (query: string) => {
    addQuestion(query);
    omniBox.submitQuery(query);
  };

  const rovoPanelOpen = omniBox.state === 'chat_panel';
  const liveChatOpen  = omniBox.state === 'live_chat';
  const barAnchorRef = useRef<HTMLDivElement>(null);
  const appLocation = useLocation();
  const isAgendaPage = appLocation.pathname === '/agenda';

  /* Keyboard shortcut to focus header search (Option A/B): Press R */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'r' && e.key !== 'R') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      if (omniBox.state !== 'closed') return;
      e.preventDefault();
      omniBox.open();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [omniBox]);

  return (
    <div className="app-shell" style={{ '--sidebar-w': sidebarCollapsed ? '52px' : '240px' } as React.CSSProperties}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        popupExperience={popupExperience}
        onPopupExperienceChange={setPopupExperience}
        rovoMode={rovoMode}
        onRovoModeChange={setRovoMode}
        onAppSwitch={() => omniBox.close()}
      />
      <div className={`app-main${rovoPanelOpen || liveChatOpen ? ' app-main--panel-open' : ''}${isAgendaPage ? ' app-main--agenda' : ''}`}>
        <AppHeader omniBox={omniBox} proactiveAlerts={proactiveAlerts} popupExperience={popupExperience} barAnchorRef={barAnchorRef} />
        <main className={`app-content${isAgendaPage ? ' app-content--agenda' : ''}`} onClick={() => { if (omniBox.state !== 'closed') {/* don't close on main click */} }}>
          {omniBox.searchQuery ? (
            <SearchResultsPage omniBox={omniBox} />
          ) : (
            <Routes>
              <Route path="/" element={<JsmPage omniBox={omniBox} rovoMode={rovoMode} />} />
              <Route path="/insights" element={<Dashboard omniBox={omniBox} />} />
              <Route path="/confluence" element={<ConfluencePage omniBox={omniBox} rovoMode={rovoMode} />} />
              <Route path="/spaces" element={<SpacesPage omniBox={omniBox} rovoMode={rovoMode} />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/insight/:id" element={<InsightPage omniBox={omniBox} />} />
              <Route path="/support-insights-icon-options" element={<SupportInsightsIconDemo />} />
            </Routes>
          )}
          {/* When recording is ready, popover shows "Loom Recording is ready" (no full-page RecordingReadyPage) */}
        </main>
      </div>

      <div className={`rovo-panel-slot${rovoPanelOpen ? ' rovo-panel-slot--open' : ''}`}>
        {rovoPanelOpen && <RovoSidePanel omniBox={omniBox} />}
      </div>

      <div className={`rovo-panel-slot${liveChatOpen ? ' rovo-panel-slot--open' : ''}`}>
        {liveChatOpen && <LiveChat omniBox={omniBox} />}
      </div>

      <OmniBox
        omniBox={omniBox}
        recentQuestions={questions}
        onQuerySubmit={handleQuerySubmit}
        proactiveAlerts={proactiveAlerts}
        popupExperience={popupExperience}
        rovoMode={rovoMode}
        barAnchorRef={barAnchorRef}
      />
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
);

export default App;

