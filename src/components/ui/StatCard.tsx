import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trendText?: string;
  tone?: 'green' | 'amber' | 'soil';
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trendText,
  tone = 'green',
  compact = false,
}: StatCardProps) {
  const classes = [
    'stat-card',
    `stat-card--${tone}`,
    compact ? 'stat-card--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {icon ? (
          <span className="stat-card__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="stat-card__value-row">
        <span className="stat-card__value">{value}</span>
        {unit ? <span className="stat-card__unit">{unit}</span> : null}
      </div>
      {trendText ? <span className="stat-card__trend">{trendText}</span> : null}
    </div>
  );
}
