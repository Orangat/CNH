import React, { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-tan-500 text-navy-900 hover:bg-tan-600 hover:text-white focus-visible:ring-tan-500',
  secondary:
    'bg-navy-900 text-white hover:bg-navy-800 focus-visible:ring-navy-700',
  ghost:
    'bg-transparent text-white hover:bg-white/10 focus-visible:ring-white',
  outline:
    'bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy-900 focus-visible:ring-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const baseClass =
  'inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-widest rounded-none transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent cursor-pointer';

interface LinkProps extends BaseProps {
  to: string;
  href?: never;
}
interface AnchorProps extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string;
  to?: never;
}
interface ButtonProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  to?: never;
  href?: never;
}

type Props = LinkProps | AnchorProps | ButtonProps;

const Button: React.FC<Props> = (props) => {
  const { children, variant = 'primary', size = 'md', className = '' } = props;
  const cls = `${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ('to' in props && props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as LinkProps;
    return (
      <Link to={to} className={cls} {...(rest as any)}>
        {children}
      </Link>
    );
  }
  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as AnchorProps;
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
};

export default Button;
