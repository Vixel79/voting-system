import React from 'react';
import { Loader2Icon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'btn-premium',
  secondary: 'bg-white/[0.05] text-fg border-[1px] border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:bg-white/[0.08] active:scale-[0.98]',
  outline: 'bg-transparent text-brand border-[1px] border-brand/30 hover:bg-brand/10 hover:border-brand active:scale-[0.98]',
  danger: 'bg-red-500/10 text-red-500 border-[1px] border-red-500/30 hover:bg-red-500 hover:text-white active:scale-[0.98]',
  ghost: 'btn-ghost'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm tracking-wide',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg'
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  block,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`relative inline-flex select-none items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 ${variants[variant]} ${sizes[size]} ${block ? 'w-full flex' : ''} ${className}`}
    >
      {loading ? (
        <Loader2Icon className="h-5 w-5 animate-spin text-current" strokeWidth={2.5} />
      ) : (
        icon
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}