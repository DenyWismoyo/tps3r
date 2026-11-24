import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionSlot?: ReactNode;
}

export function EmptyState({ icon, title, description, actionSlot }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3>{title}</h3>
      {description ? <p className="text-muted text-sm">{description}</p> : null}
      {actionSlot ? <div>{actionSlot}</div> : null}
    </div>
  );
}
