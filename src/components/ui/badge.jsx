import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
        secondary: 'bg-white/8 text-white/60 border border-white/10',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
        destructive: 'bg-red-500/15 text-red-400 border border-red-500/20',
        blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
