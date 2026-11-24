import type { ReactNode } from 'react';

export interface ContainerProps {
  narrow?: boolean;
  className?: string;
  children: ReactNode;
}

export function Container({ narrow = false, className = '', children }: ContainerProps) {
  const classes = ['container', narrow ? 'container--narrow' : '', className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
