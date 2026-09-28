import React from 'react';

/**
 * Renders text with the line breaks it contains ("\n" — Enter in admin → Texts).
 * Each line is its own block, balanced on its own: on a phone narrower than the one the
 * breaks were set on, a line that doesn't fit wraps into even halves instead of leaving
 * a single word behind (text-wrap: balance doesn't work across forced line breaks).
 */
const TextLines: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split('\n').map((line, i) => (
      <span key={i} className="block text-balance">
        {line}
      </span>
    ))}
  </>
);

export default TextLines;
