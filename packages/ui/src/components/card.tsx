import * as React from 'react';
import { cn } from '../lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'border-border bg-card text-card-foreground shadow-card rounded-lg border p-5',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
