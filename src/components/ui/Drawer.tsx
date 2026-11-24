'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DrawerProps {
  open: boolean;
  title: string;
  side?: 'right' | 'left';
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function Drawer({
  open,
  title,
  side = 'right',
  onClose,
  footer,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const backdropClasses = [
    'drawer-backdrop',
    side === 'left' ? 'drawer-backdrop--left' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={backdropClasses}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__header">
          <h3 className="drawer__title">{title}</h3>
          <Button variant="ghost" iconOnly aria-label="Tutup panel" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer ? <div className="drawer__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
