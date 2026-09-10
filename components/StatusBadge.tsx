import type { AccountStatus } from '@/models/Account';

interface StatusBadgeProps {
  status: AccountStatus;
  onClick?: (status: AccountStatus) => void;
  className?: string;
}

/** Status label ve renk eşleşmesi */
const STATUS_CONFIG: Record<
  AccountStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string; borderClass: string }
> = {
  available: {
    label: 'Mevcut',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    dotClass: 'bg-green-500',
    borderClass: 'border-green-500/20',
  },
  archived: {
    label: 'Arşivlendi',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    dotClass: 'bg-red-500',
    borderClass: 'border-red-500/20',
  },
  active: {
    label: 'Aktif',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    borderClass: 'border-blue-500/30',
  },
  level: {
    label: 'Level',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    dotClass: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    borderClass: 'border-purple-500/30',
  },
  error_checking: {
    label: 'Ban',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    borderClass: 'border-rose-500/30',
  },
};

/**
 * Hesap durumunu renkli badge olarak gösterir.
 *
 * @param {AccountStatus} status - Hesabın mevcut durumu
 */
export default function StatusBadge({ status, onClick, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.error_checking;

  return (
    <span
      onClick={
        onClick
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(status);
            }
          : undefined
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold tracking-wider uppercase whitespace-nowrap border select-none transition-all ${
        config.bgClass
      } ${config.textClass} ${config.borderClass} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 hover:brightness-125' : ''
      } ${className}`}
      title={onClick ? `"${config.label}" durumuna göre filtrele` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

