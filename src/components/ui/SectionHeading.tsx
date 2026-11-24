import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  actionSlot?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  actionSlot,
  className = '',
}: SectionHeadingProps) {
  const isRow = Boolean(actionSlot && align === 'left');
  const classes = [
    'section-heading',
    align === 'center' ? 'section-heading--center' : '',
    isRow ? 'section-heading--row' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="stack stack--xs">
        {eyebrow ? <span className="section-heading__eyebrow">{eyebrow}</span> : null}
        <h2 className="section-heading__title">{title}</h2>
        {subtitle ? <p className="section-heading__subtitle">{subtitle}</p> : null}
      </div>
      {actionSlot ? <div>{actionSlot}</div> : null}
    </div>
  );
}
