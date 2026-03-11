import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** I.1 — Incident/Outage (Statuspage) */
export interface IncidentAlert {
  id: 'incident';
  active: boolean;
  dismissed: boolean;
  region: string;
  product: string;
  status: string;
  eta: string;
  statuspageUrl: string;
  subscribed: boolean;
}

/** I.2 — SLA/KPI threshold breach (Support Insights 360) */
export interface SlaBreachAlert {
  id: 'slaBreach';
  active: boolean;
  dismissed: boolean;
  rate: number;
  target: number;
  daysConsecutive: number;
  rovoQuery: string;
}

/** I.3 — Page dwell time (>3 min on dashboard) */
export interface DwellTimeAlert {
  id: 'dwellTime';
  active: boolean;
  dismissed: boolean;
  suggestedQuery: string;
}

/** I.4 — Repeated error pattern (e.g. filter failing 3+ times) */
export interface RepeatedErrorAlert {
  id: 'repeatedError';
  active: boolean;
  dismissed: boolean;
  actionLabel: string;
  guideTitle: string;
  guideHref: string;
}

/** I.5 — AI-predicted churn risk */
export interface ChurnRiskAlert {
  id: 'churnRisk';
  active: boolean;
  dismissed: boolean;
}

export type ProactiveAlert =
  | IncidentAlert
  | SlaBreachAlert
  | DwellTimeAlert
  | RepeatedErrorAlert
  | ChurnRiskAlert;

export interface ProactiveAlertsState {
  incident: IncidentAlert;
  slaBreach: SlaBreachAlert;
  dwellTime: DwellTimeAlert;
  repeatedError: RepeatedErrorAlert;
  churnRisk: ChurnRiskAlert;
}

const DEFAULT_INCIDENT: IncidentAlert = {
  id: 'incident',
  active: true,
  dismissed: false,
  region: 'EMEA',
  product: 'Jira Cloud',
  status: 'Investigating',
  eta: '~30 min',
  statuspageUrl: 'https://status.atlassian.com/incident/123',
  subscribed: false,
};

const DEFAULT_SLA_BREACH: SlaBreachAlert = {
  id: 'slaBreach',
  active: true,
  dismissed: false,
  rate: 8.2,
  target: 5,
  daysConsecutive: 3,
  rovoQuery: 'Analyze root causes for SLA breach rate exceeding 5% target',
};

const DEFAULT_DWELL: DwellTimeAlert = {
  id: 'dwellTime',
  active: false,
  dismissed: false,
  suggestedQuery: "What are the top 3 drivers of ticket volume this week?",
};

const DEFAULT_REPEATED_ERROR: RepeatedErrorAlert = {
  id: 'repeatedError',
  active: true,
  dismissed: false,
  actionLabel: 'filters',
  guideTitle: 'Configuring Data Sources',
  guideHref: 'https://support.atlassian.com/jira-service-management-cloud/docs/configure-data-sources/',
};

const DEFAULT_CHURN_RISK: ChurnRiskAlert = {
  id: 'churnRisk',
  active: true,
  dismissed: false,
};

export interface UseProactiveAlertsReturn extends ProactiveAlertsState {
  hasActiveAlert: boolean;
  visibleAlerts: ProactiveAlert[];
  dismissAlert: (id: ProactiveAlert['id']) => void;
  subscribeToIncident: () => void;
  recordRepeatedAction: (actionKey: string) => void;
}

const DWELL_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
const REPEATED_ACTION_THRESHOLD = 3;

export function useProactiveAlerts(): UseProactiveAlertsReturn {
  const location = useLocation();
  const [incident, setIncident] = useState<IncidentAlert>(DEFAULT_INCIDENT);
  const [slaBreach, setSlaBreach] = useState<SlaBreachAlert>(DEFAULT_SLA_BREACH);
  const [dwellTime, setDwellTime] = useState<DwellTimeAlert>(DEFAULT_DWELL);
  const [repeatedError, setRepeatedError] = useState<RepeatedErrorAlert>(DEFAULT_REPEATED_ERROR);
  const [churnRisk, setChurnRisk] = useState<ChurnRiskAlert>(DEFAULT_CHURN_RISK);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionCountRef = useRef<Record<string, number>>({});

  const isDashboard = location.pathname === '/';

  // I.3 — Dwell time: after 3 min on dashboard without interaction, show alert
  useEffect(() => {
    if (!isDashboard) {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
      return;
    }
    if (dwellTime.dismissed || dwellTime.active) return;
    dwellTimerRef.current = setTimeout(() => {
      setDwellTime(prev => ({ ...prev, active: true }));
      dwellTimerRef.current = null;
    }, DWELL_THRESHOLD_MS);
    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
    };
  }, [isDashboard, dwellTime.dismissed, dwellTime.active]);

  const dismissAlert = useCallback((id: ProactiveAlert['id']) => {
    switch (id) {
      case 'incident':
        setIncident(prev => ({ ...prev, dismissed: true }));
        break;
      case 'slaBreach':
        setSlaBreach(prev => ({ ...prev, dismissed: true }));
        break;
      case 'dwellTime':
        setDwellTime(prev => ({ ...prev, dismissed: true }));
        break;
      case 'repeatedError':
        setRepeatedError(prev => ({ ...prev, dismissed: true }));
        break;
      case 'churnRisk':
        setChurnRisk(prev => ({ ...prev, dismissed: true }));
        break;
    }
  }, []);

  const subscribeToIncident = useCallback(() => {
    setIncident(prev => ({ ...prev, subscribed: true }));
  }, []);

  const recordRepeatedAction = useCallback((actionKey: string) => {
    const count = (actionCountRef.current[actionKey] ?? 0) + 1;
    actionCountRef.current[actionKey] = count;
    if (count >= REPEATED_ACTION_THRESHOLD) {
      setRepeatedError(prev => ({ ...prev, active: true }));
    }
  }, []);

  const visibleAlerts: ProactiveAlert[] = [
    incident.active && !incident.dismissed ? incident : null,
    slaBreach.active && !slaBreach.dismissed ? slaBreach : null,
    dwellTime.active && !dwellTime.dismissed ? dwellTime : null,
    repeatedError.active && !repeatedError.dismissed ? repeatedError : null,
    churnRisk.active && !churnRisk.dismissed ? churnRisk : null,
  ].filter(Boolean) as ProactiveAlert[];

  const hasActiveAlert = visibleAlerts.length > 0;

  return {
    incident,
    slaBreach,
    dwellTime,
    repeatedError,
    churnRisk,
    hasActiveAlert,
    visibleAlerts,
    dismissAlert,
    subscribeToIncident,
    recordRepeatedAction,
  };
}
