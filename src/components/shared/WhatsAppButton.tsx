import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import type { ButtonSize, ButtonVariant } from '@/components/ui/Button';

export interface WhatsAppButtonProps {
  message: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  phoneOverride?: string;
  className?: string;
}

export function WhatsAppButton({
  message,
  label = 'Pesan via WhatsApp',
  variant = 'wa',
  size = 'md',
  block = false,
  phoneOverride,
  className = '',
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(message, phoneOverride);
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      <MessageCircle size={17} aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
