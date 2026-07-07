import React from 'react';

/** Labelled on/off toggle with a title and an optional one-line description. */
export const Switch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
}> = ({ checked, onChange, title, description }) => (
  <div className="switch">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`sw${checked ? '' : ' off'}`}
      onClick={() => onChange(!checked)}
    />
    <div className="tx">
      <div className="t">{title}</div>
      {description && <div className="d">{description}</div>}
    </div>
  </div>
);

export default Switch;
