import React from 'react';

interface Props {
  className?: string;
  /** Stroke color (defaults to subtle tan over navy backgrounds). */
  color?: string;
  /** Stroke opacity 0..1 */
  opacity?: number;
}

/**
 * Decorative topographic-line pattern inspired by the Church of New Hope
 * brand book. Renders as an absolutely-positioned SVG layer — wrap in a
 * `relative` parent and let the pattern fill behind content.
 *
 * Uses concentric, organically curved paths reminiscent of contour lines.
 * Pure SVG: no images, no requests, scales infinitely.
 */
const BrandPattern: React.FC<Props> = ({
  className = '',
  color = '#B59E81',
  opacity = 0.18,
}) => (
  <svg
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
  >
    <g stroke={color} strokeWidth="1" strokeOpacity={opacity}>
      {/* Generated curves — concentric organic lines, like contour map */}
      <path d="M -100 760 Q 200 700 500 740 T 1100 720 T 1700 760" />
      <path d="M -100 720 Q 200 660 500 700 T 1100 680 T 1700 720" />
      <path d="M -100 680 Q 200 620 500 660 T 1100 640 T 1700 680" />
      <path d="M -100 640 Q 200 580 500 620 T 1100 600 T 1700 640" />
      <path d="M -100 600 Q 200 540 500 580 T 1100 560 T 1700 600" />
      <path d="M -100 560 Q 200 500 500 540 T 1100 520 T 1700 560" />
      <path d="M -100 520 Q 200 460 500 500 T 1100 480 T 1700 520" />
      <path d="M -100 480 Q 200 420 500 460 T 1100 440 T 1700 480" />
      <path d="M -100 440 Q 200 380 500 420 T 1100 400 T 1700 440" />
      <path d="M -100 400 Q 200 340 500 380 T 1100 360 T 1700 400" />
      <path d="M -100 360 Q 200 300 500 340 T 1100 320 T 1700 360" />
      <path d="M -100 320 Q 200 260 500 300 T 1100 280 T 1700 320" />
      <path d="M -100 280 Q 200 220 500 260 T 1100 240 T 1700 280" />
      <path d="M -100 240 Q 200 180 500 220 T 1100 200 T 1700 240" />
      <path d="M -100 200 Q 200 140 500 180 T 1100 160 T 1700 200" />
      <path d="M -100 160 Q 200 100 500 140 T 1100 120 T 1700 160" />
      <path d="M -100 120 Q 200  60 500 100 T 1100  80 T 1700 120" />
      <path d="M -100  80 Q 200  20 500  60 T 1100  40 T 1700  80" />
    </g>
  </svg>
);

export default BrandPattern;
