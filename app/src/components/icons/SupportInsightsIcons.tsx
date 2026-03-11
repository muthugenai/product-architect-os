import React from 'react';

/**
 * Three icon options for "Support AI Insights".
 * Use SupportInsightsIconOption1 | 2 | 3, or the demo page at /support-insights-icon-options.
 */

/** Option 1: Lightbulb — ideas, insights, “aha” */
export const SupportInsightsIconOption1: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M8 2a4 4 0 0 0-3.2 6.4L6 10h4l1.2-1.6A4 4 0 0 0 8 2z" />
    <path d="M6.5 10v1.5a1.5 1.5 0 0 0 3 0V10" />
    <path d="M5 13.5h6" />
  </svg>
);

/** Option 2: Sparkles — AI, discovery, smart insights */
export const SupportInsightsIconOption2: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M8 1v1.5M8 13.5v1.5M1.5 8H3M13 8h1.5M3.2 3.2l1.06 1.06M11.74 11.74l1.06 1.06M3.2 12.8l1.06-1.06M11.74 4.26l1.06-1.06" />
    <path d="M8 5a3 3 0 0 1 2.4 4.8L8 12l-2.4-2.2A3 3 0 0 1 8 5z" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** Option 3: Chart trending up — analytics, metrics, KPIs */
export const SupportInsightsIconOption3: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2 12V8M5 12V5M8 12V7M11 12V4M14 12V6" />
    <path d="M2 8l3-3 3 2 3-4 3 2" />
    <circle cx="14" cy="6" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

const OPTIONS = [
  { id: 1, name: 'Option 1: Lightbulb', Icon: SupportInsightsIconOption1, desc: 'Ideas, insights, “aha”' },
  { id: 2, name: 'Option 2: Sparkles', Icon: SupportInsightsIconOption2, desc: 'AI, discovery, smart insights' },
  { id: 3, name: 'Option 3: Chart trending up', Icon: SupportInsightsIconOption3, desc: 'Analytics, metrics, KPIs' },
] as const;

/** Demo page: render all 3 options with labels for comparison */
export const SupportInsightsIconDemo: React.FC = () => (
  <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 560 }}>
    <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Support AI Insights — 3 icon options</h1>
    <p style={{ fontSize: 13, color: '#6b778c', marginBottom: 24 }}>Pick one for menus, panels, and headers.</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {OPTIONS.map(({ id, name, Icon, desc }) => (
        <div
          key={id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '12px 16px',
            background: '#f4f5f7',
            borderRadius: 8,
            border: '1px solid #dfe1e6',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: '#fff', borderRadius: 8, color: '#6554c0' }}>
            <Icon size={24} />
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#6b778c' }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
