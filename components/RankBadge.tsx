import Image from 'next/image';

interface RankBadgeProps {
  /** Formatlanmış rank string'i, ör: "PLATINUM III 55 LP" veya "UNRANKED" */
  rank: string;
  /** Resim boyutu (px), varsayılan: 48 */
  size?: number;
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
export default function RankBadge({ rank, size = 48 }: RankBadgeProps) {
  const tier = getTierFromRank(rank);

  if (!tier) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-slate-800/50 border-2 border-slate-700/50 flex items-center justify-center shadow-inner relative shrink-0"
      >
        <span className="text-xs font-bold text-slate-500 opacity-50">?</span>
      </div>
    );
  }

  return (
    <span className="relative inline-flex items-center cursor-default shrink-0">
      <Image
        src={`/ranks/${tier}.png`}
        alt={rank}
        width={size}
        height={size}
        className="block object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-105"
        unoptimized
      />
    </span>
  );
}
