import type { ReactNode } from 'react';

export type BadgeTone =
  | 'available'
  | 'preorder'
  | 'soldout'
  | 'organic'
  | 'soil'
  | 'info'
  | 'neutral';

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'organic', className = '', children }: BadgeProps) {
  const classes = ['badge', `badge--${tone}`, className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}
