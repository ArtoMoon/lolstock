'use client';

import { useState } from 'react';
import type { AccountData } from '@/app/actions/accounts';
import type { AccountStatus } from '@/models/Account';
import AccountCard from './AccountCard';
import StatusBadge from './StatusBadge';
import RankBadge from './RankBadge';
import PlatformBadge, { FlagTR, FlagEU, FlagUS } from './PlatformBadge';
import RiotIdDisplay from './RiotIdDisplay';
import Link from 'next/link';

interface AccountTableProps {
  accounts: AccountData[];
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'in_stock', label: 'Stokta' },
  { value: 'sold', label: 'Satıldı' },
  { value: 'active', label: 'Aktif' },
  { value: 'level', label: 'Level' },
  { value: 'error_checking', label: 'Ban' },
];

type ViewMode = 'grid' | 'compact-grid' | 'list' | 'table';

export default function AccountTable({ accounts }: AccountTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | ''>('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const trCount = accounts.filter((a) => (a.platform || 'TR1').toUpperCase() === 'TR1').length;
  const euwCount = accounts.filter((a) => (a.platform || '').toUpperCase() === 'EUW1').length;
  const eunCount = accounts.filter((a) => (a.platform || '').toUpperCase() === 'EUN1').length;
  const naCount = accounts.filter((a) => (a.platform || '').toUpperCase() === 'NA1').length;

  const filtered = accounts.filter((a) => {
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesPlatform =
      !platformFilter || (a.platform || 'TR1').toUpperCase() === platformFilter.toUpperCase();
    const s = search.toLowerCase().trim();
    const matchesSearch =
      !search ||
      a.riotId.toLowerCase().includes(s) ||
      (a.username && a.username.toLowerCase().includes(s)) ||
      (a.summonerName && a.summonerName.toLowerCase().includes(s)) ||
      (a.platform && a.platform.toLowerCase().includes(s)) ||
      (s === 'west' && (a.platform?.toLowerCase() === 'euw1' || a.platform?.toLowerCase() === 'euw')) ||
      (s === 'tr' && (a.platform?.toLowerCase() === 'tr1' || a.platform?.toLowerCase() === 'tr'));
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  return (
    <section>
      {/* Sunucu Hızlı Filtre Butonları (Canlı Sayılarla) */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setPlatformFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            platformFilter === ''
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'bg-[#0e192d]/80 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          <span>Tüm Sunucular</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono">{accounts.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setPlatformFilter(platformFilter === 'TR1' ? '' : 'TR1')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            platformFilter === 'TR1'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'bg-[#0e192d]/80 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          <FlagTR className="w-3.5 h-2.5" />
          <span>TR</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${platformFilter === 'TR1' ? 'bg-rose-500/30 text-rose-200' : 'bg-white/10 text-white'}`}>
            {trCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPlatformFilter(platformFilter === 'EUW1' ? '' : 'EUW1')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            platformFilter === 'EUW1'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'bg-[#0e192d]/80 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
          }`}
        >
          <FlagEU className="w-3.5 h-2.5" />
          <span>West</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${platformFilter === 'EUW1' ? 'bg-sky-500/30 text-sky-200' : 'bg-white/10 text-white'}`}>
            {euwCount}
          </span>
        </button>

        {eunCount > 0 && (
          <button
            type="button"
            onClick={() => setPlatformFilter(platformFilter === 'EUN1' ? '' : 'EUN1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              platformFilter === 'EUN1'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'bg-[#0e192d]/80 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            <FlagEU className="w-3.5 h-2.5" />
            <span>EUNE</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono">{eunCount}</span>
          </button>
        )}

        {naCount > 0 && (
          <button
            type="button"
            onClick={() => setPlatformFilter(platformFilter === 'NA1' ? '' : 'NA1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              platformFilter === 'NA1'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-[#0e192d]/80 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            <FlagUS className="w-3.5 h-2.5" />
            <span>NA</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono">{naCount}</span>
          </button>
        )}
      </div>

      {/* Filtreler ve Görünüm Seçici */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        
        {/* Arama ve Filtre */}
        <div className="flex flex-wrap gap-3 flex-1">
          <input
            id="search-accounts"
            type="text"
            placeholder="🔍 Riot ID, Sunucu veya Kullanıcı Adı ara..."
            className="flex-1 min-w-[200px] bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-lg px-4 py-2 text-[#e8f0fe] font-sans text-sm outline-none transition-colors focus:border-blue-400 placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Durum Filtresi */}
          <select
            id="filter-status"
            className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-lg px-4 py-2 text-[#e8f0fe] font-sans text-sm outline-none cursor-pointer transition-colors focus:border-blue-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountStatus | '')}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0f1923] text-[#e8f0fe]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Görünüm Modu Seçici */}
        <div className="flex items-center bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-lg overflow-hidden shrink-0">
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-[#3d9be9]/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Geniş Grid"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </button>
          <button 
            onClick={() => setViewMode('compact-grid')}
            className={`px-3 py-2 text-sm border-l border-[#3d9be9]/18 transition-colors ${viewMode === 'compact-grid' ? 'bg-[#3d9be9]/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Kompakt Grid"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM4 21a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 21a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"></path></svg>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm border-l border-[#3d9be9]/18 transition-colors ${viewMode === 'list' ? 'bg-[#3d9be9]/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Yatay Liste"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 text-sm border-l border-[#3d9be9]/18 transition-colors ${viewMode === 'table' ? 'bg-[#3d9be9]/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Minimal Tablo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
        </div>

      </div>

      {/* Sonuç sayısı */}
      <p className="text-sm text-slate-400 mb-5">
        {filtered.length} hesap gösteriliyor
        {accounts.length !== filtered.length && ` (toplam ${accounts.length})`}
      </p>

      {/* Hesap Listesi Rendering */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0e192d]/85 rounded-xl border border-[#3d9be9]/18 shadow-xl">
          <span className="text-4xl opacity-50 block mb-4">🎮</span>
          <p className="text-lg font-medium text-[#e8f0fe]">Hesap bulunamadı.</p>
          <p className="text-sm text-slate-400 mt-2">Filtreni değiştir veya yeni hesap ekle.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((account) => (
                <AccountCard key={account._id} account={account} viewMode="grid" />
              ))}
            </div>
          )}

          {viewMode === 'compact-grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((account) => (
                <AccountCard key={account._id} account={account} viewMode="compact-grid" />
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="flex flex-col gap-3">
              {filtered.map((account) => (
                <AccountCard key={account._id} account={account} viewMode="list" />
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="overflow-x-auto bg-[#0e192d]/85 rounded-xl border border-[#3d9be9]/18">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-[#050e18]/80 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Riot ID</th>
                    <th className="px-4 py-3 font-semibold">Sunucu</th>
                    <th className="px-4 py-3 font-semibold">Durum</th>
                    <th className="px-4 py-3 font-semibold text-center">Seviye</th>
                    <th className="px-4 py-3 font-semibold">Rank</th>
                    <th className="px-4 py-3 font-semibold">Son Kontrol</th>
                    <th className="px-4 py-3 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d9be9]/10">
                  {filtered.map((account) => (
                    <tr key={account._id} className="hover:bg-[#14233c]/50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <RiotIdDisplay riotId={account.riotId} />
                          <Link
                            href={`/accounts/${account._id}`}
                            className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                            title="Detaya Git"
                          >
                            ↗
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <PlatformBadge platform={account.platform} />
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge status={account.status} />
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-white">
                        {account.level || '–'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={account.rank || 'UNRANKED'} size={24} />
                          <span className="text-xs">{account.rank || 'UNRANKED'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {account.lastCheckedAt 
                          ? new Date(account.lastCheckedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : 'Hiç'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link href={`/accounts/${account._id}`} className="text-blue-400 hover:text-blue-300 font-medium text-xs bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
