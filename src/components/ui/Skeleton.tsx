export interface SkeletonProps {
  variant?: 'line' | 'title' | 'card' | 'stat';
  className?: string;
}

export function Skeleton({ variant = 'line', className = '' }: SkeletonProps) {
  const classes = ['skeleton', `skeleton--${variant}`, className].filter(Boolean).join(' ');
  return <span className={classes} aria-hidden="true" />;
}
