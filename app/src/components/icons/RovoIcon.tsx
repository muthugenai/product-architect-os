import React from 'react';
import rovoIconPng from '../../assets/rovo-icon.png';

interface RovoIconProps {
  size?: number;
  className?: string;
}

/**
 * Official Atlassian Rovo icon — PNG mark from Atlassian brand assets.
 */
export const RovoIcon: React.FC<RovoIconProps> = ({ size = 24, className }) => (
  <img
    src={rovoIconPng}
    width={size}
    height={size}
    alt="Rovo"
    className={className}
    aria-hidden="true"
    style={{ display: 'inline-block', objectFit: 'contain', flexShrink: 0 }}
  />
);

/** Full Rovo wordmark — icon + "Rovo" text, as shown in the product header */
export const RovoWordmark: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <RovoIcon size={size} />
    <span style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: size * 0.75,
      fontWeight: 700,
      color: '#1B1B29',
      letterSpacing: '-0.01em',
    }}>
      Rovo
    </span>
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{ marginLeft: -2 }}>
      <path d="M2 4l4 4 4-4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export const AtlassianIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 15.1c-.3-.3-.7-.2-.9.1L4 27.7c-.2.4 0 .8.4.8h8.7c.2 0 .4-.1.5-.3 2-3.8 1-10.4-1.1-13.1z" fill="url(#atl-blue)"/>
    <path d="M15.8 3.5c-3.3 5-3.2 11.5-.5 16.7l4.3 7.9c.1.2.3.3.5.3H28c.4 0 .6-.5.4-.8C28.4 27.6 16.8 4.4 16.4 3.5c-.2-.4-.4-.4-.6 0z" fill="url(#atl-purple)"/>
    <defs>
      <linearGradient id="atl-blue" x1="14.4" y1="18.5" x2="7.8" y2="27.9" gradientUnits="userSpaceOnUse">
        <stop offset="18%" stopColor="#0052CC"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
      <linearGradient id="atl-purple" x1="28.3" y1="9.2" x2="16.1" y2="24.8" gradientUnits="userSpaceOnUse">
        <stop offset="18%" stopColor="#6554C0"/>
        <stop offset="100%" stopColor="#2684FF"/>
      </linearGradient>
    </defs>
  </svg>
);
