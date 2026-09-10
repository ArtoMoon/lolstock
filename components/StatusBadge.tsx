'use client';

import type { AccountStatus } from '@/models/Account';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TranslationKey } from '@/lib/i18n/translations';

interface StatusBadgeProps {
  status: AccountStatus;
  onClick?: (status: AccountStatus) => void;
  className?: string;
}

interface StatusStyle {
  key: TranslationKey;
  bgClass: string;
  textClass: string;
  dotClass: string;
  borderClass: string;
}

/** Status stil eşleşmesi */
const STATUS_STYLES: Record<AccountStatus, StatusStyle> = {
  available: {
    key: 'status_available',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    dotClass: 'bg-green-500',
    borderClass: 'border-green-500/20',
  },
  archived: {
    key: 'status_archived',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    dotClass: 'bg-red-500',
    borderClass: 'border-red-500/20',
  },
  active: {
    key: 'status_active',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    borderClass: 'border-blue-500/30',
  },
  level: {
    key: 'status_level',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    dotClass: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    borderClass: 'border-purple-500/30',
  },
  error_checking: {
    key: 'status_error_checking',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    borderClass: 'border-rose-500/30',
  },
};

/**
 * Hesap durumunu renkli badge olarak gösterir (i18n destekli).
 */
export default function StatusBadge({ status, onClick, className = '' }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.error_checking;
  const label = t(config.key);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={() => onClick?.(status)}
      title={label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {label}
    </span>
  );
}
