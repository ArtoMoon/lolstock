import Image from 'next/image';

interface RankBadgeProps {
  /** Formatlanmış rank string'i, ör: "PLATINUM III 55 LP" veya "UNRANKED" */
  rank: string;
  /** Resim boyutu (px), varsayılan: 48 */
  size?: number;
  onClick?: (rank: string) => void;
  className?: string;
}

/** Tier string'ini resim dosyası adına dönüştürür */
function getTierFromRank(rank: string): string | null {
  if (!rank || rank === 'UNRANKED') return null;
  const tier = rank.split(' ')[0].toLowerCase();
  const validTiers = [
    'challenger', 'grandmaster', 'master',
    'diamond', 'emerald', 'platinum',
    'gold', 'silver', 'bronze', 'iron',
  ];
  return validTiers.includes(tier) ? tier : null;
}

/**
 * Rank rozeti bileşeni.
 * Rank yoksa veya UNRANKED ise sade yer tutucu simge gösterir.
 * Rank varsa tier ikonunu render eder.
 */
export default function RankBadge({ rank, size = 48, onClick, className = '' }: RankBadgeProps) {
  const tier = getTierFromRank(rank);

  if (!tier) {
    return (
      <div 
        style={{ width: size, height: size }} 
        onClick={
          onClick
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick('UNRANKED');
              }
            : undefined
        }
        className={`rounded-full bg-slate-800/50 border-2 border-slate-700/50 flex items-center justify-center shadow-inner relative shrink-0 transition-all ${
          onClick ? 'cursor-pointer hover:scale-105 active:scale-95 hover:border-slate-500' : ''
        } ${className}`}
        title={onClick ? 'Unranked hesaplara göre filtrele' : undefined}
      >
        <span className="text-xs font-bold text-slate-500 opacity-50">?</span>
      </div>
    );
  }

  return (
    <span 
      onClick={
        onClick
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(tier.toUpperCase());
            }
          : undefined
      }
      className={`relative inline-flex items-center shrink-0 select-none ${
        onClick ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : 'cursor-default'
      } ${className}`}
      title={onClick ? `"${tier.toUpperCase()}" rankına göre filtrele` : undefined}
    >
      <Image
        src={`/ranks/${tier}.png`}
        alt={rank}
        width={size}
        height={size}
        className="block object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-200"
        unoptimized
      />
    </span>
  );
}
