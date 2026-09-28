import React from 'react';

interface Props {
  text: string;
  /** Even out the lines within each line of the text (off for big headings). */
  balance?: boolean;
}

/**
 * Renders text with the line breaks it contains ("\n" — Enter in admin → Texts).
 * Each line is its own block, balanced on its own: on a phone narrower than the one the
 * breaks were set on, a line that doesn't fit wraps into even halves instead of leaving
 * a single word behind (text-wrap: balance doesn't work across forced line breaks).
 */
const TextLines: React.FC<Props> = ({ text, balance = true }) => (
  <>
    {text.split('\n').map((line, i) => (
      <span key={i} className={balance ? 'block text-balance' : 'block'}>
        {line}
      </span>
    ))}
  </>
);

export default TextLines;
