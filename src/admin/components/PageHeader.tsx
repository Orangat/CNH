import React from 'react';

/** Page intro: eyebrow + title + one-line subtitle, with an optional action (e.g. an Add button). */
export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, action }) => (
  <div className="page-head">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
