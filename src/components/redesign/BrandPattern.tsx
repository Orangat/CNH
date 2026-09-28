import React from 'react';

interface Props {
  className?: string;
  /** Line color (defaults to brand tan over navy backgrounds). */
  color?: string;
  /** Line opacity 0..1 */
  opacity?: number;
}

// Topographic contour lines taken from the brand book
// ("Church of New Hope_Typography_Color Palette.pdf", Brand Pattern).
const PATTERN_URL = '/images/brand-pattern.svg';

/**
 * Brand pattern layer. Renders absolutely-positioned — wrap in a `relative`
 * parent and let the pattern fill behind content.
 *
 * The SVG is used as a CSS mask over a solid color, so `color` and `opacity`
 * stay adjustable while the artwork itself lives in a cached static file.
 */
const BrandPattern: React.FC<Props> = ({
  className = '',
  color = '#B59E81',
  opacity = 0.3,
}) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundColor: color,
      opacity,
      WebkitMaskImage: `url(${PATTERN_URL})`,
      maskImage: `url(${PATTERN_URL})`,
      WebkitMaskSize: 'cover',
      maskSize: 'cover',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  />
);

export default BrandPattern;
