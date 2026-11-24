'use client';

import type { ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  items: readonly TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
}

export function Tabs<T extends string = string>({
  items,
  activeKey,
  onChange,
  ariaLabel = 'Navigasi tab',
}: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={['tabs__item', isActive ? 'tabs__item--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
            {typeof item.count === 'number' ? <span>({item.count})</span> : null}
          </button>
        );
      })}
    </div>
  );
}
