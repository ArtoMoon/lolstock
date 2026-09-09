import React from 'react';

export function FlagTR({ className = 'w-3.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 800" className={`${className} shrink-0 rounded-[2px] shadow-sm`} xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="420" cy="400" r="200" fill="#FFFFFF" />
      <circle cx="470" cy="400" r="160" fill="#E30A17" />
      <path
        d="M575,400 L644.1,377.5 L644.1,304.9 L686.8,363.7 L755.9,341.2 L713.2,400 L755.9,458.8 L686.8,436.3 L644.1,495.1 L644.1,422.5 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function FlagEU({ className = 'w-3.5 h-2.5' }: { className?: string }) {
  const stars = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const cx = 405 + 155 * Math.sin(rad);
    const cy = 270 - 155 * Math.cos(rad);
    return <circle key={deg} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="18" fill="#FFCC00" />;
  });

  return (
    <svg viewBox="0 0 810 540" className={`${className} shrink-0 rounded-[2px] shadow-sm`} xmlns="http://www.w3.org/2000/svg">
      <rect width="810" height="540" fill="#003399" />
      {stars}
    </svg>
  );
}

export function FlagUS({ className = 'w-3.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 741 390" className={`${className} shrink-0 rounded-[2px] shadow-sm`} xmlns="http://www.w3.org/2000/svg">
      <rect width="741" height="390" fill="#B22234" />
      <path d="M0,45 H741 M0,105 H741 M0,165 H741 M0,225 H741 M0,285 H741 M0,345 H741" stroke="#FFFFFF" strokeWidth="30" />
      <rect width="296" height="210" fill="#3C3B6E" />
      <circle cx="80" cy="65" r="14" fill="#FFFFFF" />
      <circle cx="150" cy="65" r="14" fill="#FFFFFF" />
      <circle cx="220" cy="65" r="14" fill="#FFFFFF" />
      <circle cx="115" cy="115" r="14" fill="#FFFFFF" />
      <circle cx="185" cy="115" r="14" fill="#FFFFFF" />
      <circle cx="80" cy="165" r="14" fill="#FFFFFF" />
      <circle cx="150" cy="165" r="14" fill="#FFFFFF" />
      <circle cx="220" cy="165" r="14" fill="#FFFFFF" />
    </svg>
  );
}

export function FlagKR({ className = 'w-3.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={`${className} shrink-0 rounded-[2px] shadow-sm`} xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#F4F4F4" />
      <circle cx="450" cy="300" r="150" fill="#CD2E3A" />
      <path d="M 300,300 A 75,75 0 0,0 450,300 A 75,75 0 0,1 600,300 A 150,150 0 0,1 300,300 Z" fill="#0047A0" />
      <circle cx="375" cy="300" r="75" fill="#CD2E3A" />
      <circle cx="525" cy="300" r="75" fill="#0047A0" />
    </svg>
  );
}

export function FlagBR({ className = 'w-3.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 720 504" className={`${className} shrink-0 rounded-[2px] shadow-sm`} xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#009739" />
      <polygon points="360,40 660,252 360,464 60,252" fill="#FEDD00" />
      <circle cx="360" cy="252" r="110" fill="#012169" />
      <path d="M260,260 Q360,230 460,270" stroke="#FFFFFF" strokeWidth="14" fill="none" />
    </svg>
  );
}

export function FlagGlobe({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 text-slate-400`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export interface PlatformInfo {
  code: string;
  name: string;
  shortLabel: string;
  badgeClass: string;
  Flag: React.ComponentType<{ className?: string }>;
}

export const PLATFORM_MAP: Record<string, PlatformInfo> = {
  TR1: {
    code: 'TR',
    name: 'Türkiye',
    shortLabel: 'TR',
    badgeClass: 'bg-rose-500/15 border-rose-500/40 text-rose-200 hover:bg-rose-500/25',
    Flag: FlagTR,
  },
  EUW1: {
    code: 'EUW',
    name: 'Batı Avrupa (West)',
    shortLabel: 'EUW',
    badgeClass: 'bg-sky-500/15 border-sky-500/40 text-sky-200 hover:bg-sky-500/25',
    Flag: FlagEU,
  },
  EUN1: {
    code: 'EUNE',
    name: 'Kuzey & Doğu Avrupa',
    shortLabel: 'EUNE',
    badgeClass: 'bg-teal-500/15 border-teal-500/40 text-teal-200 hover:bg-teal-500/25',
    Flag: FlagEU,
  },
  NA1: {
    code: 'NA',
    name: 'Kuzey Amerika',
    shortLabel: 'NA',
    badgeClass: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/25',
    Flag: FlagUS,
  },
  KR: {
    code: 'KR',
    name: 'Kore',
    shortLabel: 'KR',
    badgeClass: 'bg-purple-500/15 border-purple-500/40 text-purple-200 hover:bg-purple-500/25',
    Flag: FlagKR,
  },
  BR1: {
    code: 'BR',
    name: 'Brezilya',
    shortLabel: 'BR',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25',
    Flag: FlagBR,
  },
  RU: {
    code: 'RU',
    name: 'Rusya',
    shortLabel: 'RU',
    badgeClass: 'bg-slate-500/15 border-slate-500/40 text-slate-200 hover:bg-slate-500/25',
    Flag: FlagGlobe,
  },
};

export function getPlatformInfo(platform?: string): PlatformInfo {
  const key = (platform || 'TR1').toUpperCase();
  return (
    PLATFORM_MAP[key] || {
      code: key,
      name: key,
      shortLabel: key,
      badgeClass: 'bg-blue-500/15 border-blue-500/40 text-blue-200 hover:bg-blue-500/25',
      Flag: FlagGlobe,
    }
  );
}

interface PlatformBadgeProps {
  platform?: string;
  showFullName?: boolean;
  className?: string;
}

export default function PlatformBadge({
  platform,
  showFullName = false,
  className = '',
}: PlatformBadgeProps) {
  const info = getPlatformInfo(platform);
  const FlagIcon = info.Flag;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider border backdrop-blur-xs select-none shadow-xs transition-all shrink-0 ${info.badgeClass} ${className}`}
      title={`${info.code} — ${info.name}`}
    >
      <FlagIcon className="w-3.5 h-2.5" />
      <span className="leading-none">{showFullName ? `${info.code} (${info.name})` : info.shortLabel}</span>
    </span>
  );
}
