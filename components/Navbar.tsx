import Link from 'next/link';

/**
 * Üst navigasyon çubuğu.
 *
 * Logo, başlık ve ana navigasyon bağlantılarını içerir.
 */
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#050e18]/80 backdrop-blur-md border-b border-yellow-600/25 shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-85">
          <span className="text-2xl">⚔️</span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            LoL<span className="text-yellow-500">Stock</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group py-1">
            Dashboard
            <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-200 group-hover:w-full"></span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
