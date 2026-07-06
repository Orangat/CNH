import React from 'react';

/** Small label chip, e.g. the language of a ministry. */
export const Badge: React.FC<{ children: React.ReactNode; tone?: 'lang' | 'neutral' }> = ({ children, tone = 'neutral' }) => (
  <span className={`badge ${tone}`}>{children}</span>
);

export default Badge;
