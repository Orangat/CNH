import React from 'react';

interface Props {
  className?: string;
  /** Line color (defaults to brand tan over navy backgrounds). */
  color?: string;
  /** Line opacity 0..1 */
  opacity?: number;
}

// Set inline: CRA would try to bundle a root-relative url() written in CSS.
const PATTERN_MASK = 'url(/images/brand-pattern.svg)';

/**
 * Brand pattern layer: the topographic contour lines from the brand book
 * ("Church of New Hope_Typography_Color Palette.pdf", Brand Pattern), stored in
 * public/images/brand-pattern.svg. Renders absolutely-positioned — wrap in a
 * `relative overflow-hidden` parent and let the pattern fill behind content.
 *
 * The SVG is a CSS mask over a solid color, so `color` and `opacity` stay adjustable
 * while the artwork is a cached static file. Mask size/position live in `.brand-pattern`
 * (tailwind.css).
 */
const BrandPattern: React.FC<Props> = ({
  className = '',
  color = '#B59E81',
  opacity = 0.3,
}) => (
  <div
    aria-hidden="true"
    className={`brand-pattern pointer-events-none absolute inset-0 ${className}`}
    style={{ backgroundColor: color, opacity, WebkitMaskImage: PATTERN_MASK, maskImage: PATTERN_MASK }}
  />
);

export default BrandPattern;
