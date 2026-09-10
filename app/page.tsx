import type { Metadata } from 'next';
import { getAccounts } from '@/app/actions/accounts';
import DashboardView from '@/components/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard – MyLoL',
  description: 'Tüm LoL hesaplarınızı tek panelden takip edin.',
};

export default async function HomePage() {
  const accounts = await getAccounts();

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-8 pb-16">
      {/* ── Desktop Client Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 px-6 mb-6 bg-gradient-to-r from-[#0d1b2a]/80 via-[#0a1524]/60 to-transparent rounded-2xl border border-blue-500/15 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold tracking-wider uppercase">
              ⚔️ Riot Client Manager
            </span>
            <span className="text-xs text-slate-500">v0.1.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Kişisel Hesap <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Riot API ile gerçek zamanlı level, rank ve aktivite senkronizasyonu
          </p>
        </div>
      </div>

      {/* ── Dashboard (Interactive Stats Grid + Action Bar + Account Table with Tag Filters) ── */}
      <DashboardView accounts={accounts} />
    </div>
  );
}
