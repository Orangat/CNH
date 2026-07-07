import React, { useEffect, useRef, useState } from 'react';

/**
 * Small "?" trigger that reveals an explanatory bubble.
 * Accessible: focusable, opens on hover/focus/click, closes on Escape,
 * blur, or an outside click (the last is important on touch, where there
 * is no hover).
 */
export const Tooltip: React.FC<{ text: React.ReactNode; label?: string }> = ({ text, label }) => {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <span
      className="tip"
      ref={wrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="q"
        aria-label={label ?? 'More info'}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      >
        ?
      </button>
      <span className="bub" role="tooltip" hidden={!open}>{text}</span>
    </span>
  );
};

export default Tooltip;
