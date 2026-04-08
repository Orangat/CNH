import React, { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  invert?: boolean;
}

/**
 * Standard section heading with brand typography:
 *  - eyebrow: tan, all caps, wide tracking
 *  - title:   creo bold, large, dark navy (or white if invert)
 *  - script accent inside title via <span className="font-script italic">
 */
const SectionHeading: React.FC<Props> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  invert = false,
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const titleColor = invert ? 'text-white' : 'text-navy-900';
  const descColor = invert ? 'text-white/80' : 'text-navy-700/80';
  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {eyebrow && (
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-tan-500">
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display text-3xl md:text-5xl font-bold leading-tight ${titleColor}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-6 text-base md:text-lg leading-relaxed ${descColor}`}>{description}</p>
      )}
    </div>
  );
};

export default SectionHeading;
