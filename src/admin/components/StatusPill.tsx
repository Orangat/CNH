import React from 'react';

/** Small coloured pill for row state (active / hidden / needs attention). */
export const StatusPill: React.FC<{ kind: 'on' | 'off' | 'warn'; children: React.ReactNode }> = ({ kind, children }) => (
  <span className={`status-pill ${kind}`}>
    <span className="dot" />
    {children}
  </span>
);

export default StatusPill;
