import * as React from 'react';
import { cn } from '../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'border-input bg-card flex h-12 w-full rounded-2xl border-2 px-4 py-2 text-base transition-all',
        'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:outline-none focus-visible:ring-4',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
