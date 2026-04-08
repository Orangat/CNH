import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Background variant */
  variant?: 'cream' | 'navy' | 'white' | 'gradient';
  /** Vertical padding scale */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  id?: string;
}

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  cream: 'bg-cream text-navy-900',
  navy: 'bg-navy-900 text-white',
  white: 'bg-white text-navy-900',
  gradient: 'bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 text-white',
};

const paddingClasses: Record<NonNullable<Props['padding']>, string> = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
  xl: 'py-24 md:py-40',
};

const Section: React.FC<Props> = ({
  children,
  variant = 'white',
  padding = 'md',
  className = '',
  id,
}) => (
  <section
    id={id}
    className={`relative overflow-hidden ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
  >
    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">{children}</div>
  </section>
);

export default Section;
