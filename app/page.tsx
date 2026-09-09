import type { Metadata } from 'next';
import { getAccounts } from '@/app/actions/accounts';
import AccountTable from '@/components/AccountTable';
import AddAccountForm from '@/components/AddAccountForm';
import StockCheckButton from '@/components/StockCheckButton';

export const metadata: Metadata = {
  title: 'Dashboard – LoLStock',
  description: 'Tüm LoL hesaplarınızı tek panelden takip edin.',
};

export default async function HomePage() {
  const accounts = await getAccounts();

  const total    = accounts.length;
  const inStock  = accounts.filter((a) => a.status === 'in_stock').length;
  const sold     = accounts.filter((a) => a.status === 'sold').length;
  const active   = accounts.filter((a) => a.status === 'active').length;
  const levelCount = accounts.filter((a) => a.status === 'level').length;
  const errored  = accounts.filter((a) => a.status === 'error_checking').length;

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-8 pb-16">

      {/* ── Hero ── */}
      <div className="text-center py-12 px-4 mb-8 bg-[radial-gradient(circle_at_top,rgba(61,155,233,0.1)_0%,transparent_60%)] rounded-3xl border border-blue-400/5">
        <div className="inline-block px-4 py-1.5 bg-yellow-600/10 text-yellow-500 border border-yellow-600/20 rounded-full text-sm font-bold tracking-wider uppercase mb-6">
          ⚔️ League of Legends
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-4">
          Hesap Stok<br />
          <span className="bg-gradient-to-br from-yellow-100 to-yellow-600 bg-clip-text text-transparent">Yönetim Paneli</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Riot API ile gerçek zamanlı level, rank ve aktivite takibi
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-12">
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-slate-800/80">
          <div className="text-3xl flex items-center justify-center w-14 h-14 bg-black/20 rounded-xl">🗂️</div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none text-white">{total}</span>
            <span className="text-sm text-slate-400 uppercase tracking-wider mt-1">Toplam</span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-green-500/30 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-slate-800/80">
          <div className="text-3xl flex items-center justify-center w-14 h-14 bg-black/20 rounded-xl">✅</div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none text-white">{inStock}</span>
            <span className="text-sm text-slate-400 uppercase tracking-wider mt-1">Stokta</span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-red-500/30 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-slate-800/80">
          <div className="text-3xl flex items-center justify-center w-14 h-14 bg-black/20 rounded-xl">💸</div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none text-white">{sold}</span>
            <span className="text-sm text-slate-400 uppercase tracking-wider mt-1">Satıldı</span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-slate-800/80">
          <div className="text-3xl flex items-center justify-center w-14 h-14 bg-black/20 rounded-xl">🎮</div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none text-white">{active}</span>
            <span className="text-sm text-slate-400 uppercase tracking-wider mt-1">Aktif</span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-slate-800/80">
          <div className="text-3xl flex items-center justify-center w-14 h-14 bg-black/20 rounded-xl">⚡</div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none text-white">{levelCount}</span>
            <span className="text-sm text-slate-400 uppercase tracking-wider mt-1">Level</span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-rose-500/30 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-slate-800/80">
          <div className="text-3xl flex items-center justify-center w-14 h-14 bg-black/20 rounded-xl">🚫</div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none text-white">{errored}</span>
            <span className="text-sm text-slate-400 uppercase tracking-wider mt-1">Ban</span>
          </div>
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 bg-black/20 p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col gap-3 flex-1 w-full">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hesap Ekle</p>
          <AddAccountForm />
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Toplu İşlem</p>
          <StockCheckButton />
        </div>
      </div>

      {/* ── Account list ── */}
      <div className="mt-0">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white">Hesaplar</h2>
          <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-slate-300">{total} kayıt</span>
        </div>
        <AccountTable accounts={accounts} />
      </div>

    </div>
  );
}
