import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold', {
  variants: {
    variant: {
      default: 'bg-primary/15 text-primary',
      accent: 'bg-accent/25 text-accent-foreground',
      secondary: 'bg-secondary/50 text-secondary-foreground',
      destructive: 'bg-destructive/15 text-destructive',
      muted: 'bg-muted text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { badgeVariants };
