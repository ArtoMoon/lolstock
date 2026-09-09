'use client';

import { useState } from 'react';

interface RiotIdDisplayProps {
  riotId: string;
  className?: string;
  textClassName?: string;
  tagClassName?: string;
}

/**
 * Riot ID görüntüleme ve kopyalama bileşeni.
 *
 * - Varsayılan olarak sadece GameName (oyuncu adı) görünür, #TAG gizlidir.
 * - Üzerine gelindiğinde (hover) #TAG ve kopyalama simgesi belirir.
 * - Tıklandığında tüm Riot ID'yi ("GameName#TAG") panoya kopyalar ve bildirim gösterir.
 */
export default function RiotIdDisplay({
  riotId,
  className = '',
  textClassName = 'text-sm font-bold text-white',
  tagClassName = 'text-xs font-mono text-amber-300/90',
}: RiotIdDisplayProps) {
  const [copied, setCopied] = useState(false);
  const parts = riotId.split('#');
  const gameName = parts[0] || riotId;
  const tagLine = parts[1] ? `#${parts[1]}` : '';

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(riotId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      onClick={handleCopy}
      className={`group/riot relative inline-flex items-center cursor-pointer select-none py-0.5 rounded-lg transition-all ${className}`}
      title={`${riotId} — Kopyalamak için tıkla`}
    >
      {/* Oyuncu Adı */}
      <span className={`hover:text-yellow-400 transition-colors truncate ${textClassName}`}>
        {gameName}
      </span>

      {/* Tag: Sadece üzerine gelindiğinde (hover) göster */}
      {tagLine && (
        <span
          className={`opacity-0 max-w-0 overflow-hidden group-hover/riot:opacity-100 group-hover/riot:max-w-[140px] group-hover/riot:ml-1.5 transition-all duration-200 whitespace-nowrap bg-black/40 border border-white/10 px-1.5 py-0.5 rounded shadow-sm ${tagClassName}`}
        >
          {tagLine}
        </span>
      )}

      {/* Kopyalandı / Kopyalama Simgesi */}
      {copied ? (
        <span className="ml-1.5 text-[0.65rem] font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-in fade-in">
          Kopyalandı! ✅
        </span>
      ) : (
        <span className="opacity-0 group-hover/riot:opacity-100 ml-1 text-xs text-slate-400 hover:text-white transition-opacity shrink-0">
          📋
        </span>
      )}
    </div>
  );
}
