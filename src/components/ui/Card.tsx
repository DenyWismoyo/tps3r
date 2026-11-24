import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  tinted?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({
  elevated = false,
  tinted = false,
  interactive = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const classes = [
    'card',
    elevated ? 'card--elevated' : '',
    tinted ? 'card--tinted' : '',
    interactive ? 'card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={['card__header', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardBody({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={['card__body', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardFooter({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={['card__footer', className].filter(Boolean).join(' ')}>{children}</div>;
}
