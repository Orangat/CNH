import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import BrandPattern from './BrandPattern';

interface Props {
  /** Background image URL */
  image?: string;
  /** Optional eyebrow line above the title */
  eyebrow?: string;
  title: ReactNode;
  /** Optional script accent shown above title */
  scriptAccent?: string;
  description?: ReactNode;
  children?: ReactNode;
  /** Hero height. 'full' = 100vh-ish, 'short' = ~70vh */
  height?: 'short' | 'tall' | 'full';
  /** Image overlay strength */
  overlay?: 'light' | 'dark' | 'gradient';
  align?: 'left' | 'center';
}

const heightClasses: Record<NonNullable<Props['height']>, string> = {
  short: 'min-h-[70vh]',
  tall: 'min-h-[85vh]',
  full: 'min-h-screen',
};

const overlayClasses: Record<NonNullable<Props['overlay']>, string> = {
  light: 'bg-navy-900/40',
  dark: 'bg-navy-900/70',
  gradient:
    'bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-navy-900/85',
};

const Hero: React.FC<Props> = ({
  image,
  eyebrow,
  title,
  scriptAccent,
  description,
  children,
  height = 'tall',
  overlay = 'gradient',
  align = 'center',
}) => {
  const alignText = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <section
      className={`relative flex items-center overflow-hidden bg-navy-900 text-white ${heightClasses[height]}`}
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      )}
      <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      <BrandPattern opacity={0.12} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10 py-24 md:py-32">
        <div className={`max-w-4xl ${alignText}`}>
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 text-xs md:text-sm font-semibold uppercase tracking-widest text-tan-500"
            >
              {eyebrow}
            </motion.p>
          )}
          {scriptAccent && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-2 font-script text-3xl md:text-5xl text-tan-500"
            >
              {scriptAccent}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] uppercase tracking-tight"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-6 max-w-2xl text-base md:text-xl leading-relaxed text-white/85"
              style={{ marginInline: align === 'center' ? 'auto' : undefined }}
            >
              {description}
            </motion.p>
          )}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className={`mt-10 flex flex-wrap gap-4 ${align === 'center' ? 'justify-center' : ''}`}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
