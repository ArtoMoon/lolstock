import Link from 'next/link';

/**
 * Masaüstü İstemci Başlık ve Navigasyon Çubuğu (Desktop Titlebar & Navbar).
 *
 * Windows pencere kontrolleri ile entegre, sürüklenebilir (drag-region)
 * ve masaüstü istemci standartlarına uygun başlık alanı sağlar.
 */
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#050e18]/95 backdrop-blur-md border-b border-yellow-600/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)] drag-region select-none">
      {/* Windows pencere kontrol butonları için sağda (pr-36) boşluk bırakılmıştır */}
      <div className="w-full px-5 h-12 flex items-center justify-between">
        
        {/* Sol Alan: Uygulama Logosu, Başlığı ve Masaüstü Rozeti */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 no-drag-region"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/40 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(234,179,8,0.2)]">
              ⚔️
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black tracking-wider text-white">
                MY<span className="text-yellow-500">LOL</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                Desktop Client
              </span>
            </div>
          </Link>
        </div>

        {/* Orta & Sağ Alan: Navigasyon ve Sistem Bilgisi */}
        <div className="flex items-center gap-5 no-drag-region pr-36">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors relative group py-1 flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Dashboard</span>
            <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-200 group-hover:w-full" />
          </Link>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-mono border-l border-white/10 pl-4">
            <span>Riot v14.x</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400/80">Local DB Active</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
