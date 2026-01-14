import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        accent: 'bg-accent-100 text-accent-600',
        success: 'bg-success/10 text-success-dark',
        warning: 'bg-warning/10 text-warning-dark',
        error: 'bg-error/10 text-error',
        outline: 'border border-primary text-primary',
        gold: 'bg-gradient-to-r from-accent-300 to-accent text-white',
        premium: 'bg-gradient-to-r from-primary to-accent text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

