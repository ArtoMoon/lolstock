'use client';

import { useState } from 'react';
import type { AccountData } from '@/app/actions/accounts';
import type { AccountStatus } from '@/models/Account';
import AccountTable from '@/components/AccountTable';
import AddAccountForm from '@/components/AddAccountForm';
import AccountSyncButton from '@/components/AccountSyncButton';

interface DashboardViewProps {
  accounts: AccountData[];
}

export default function DashboardView({ accounts }: DashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState<AccountStatus | ''>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');

  const total = accounts.length;
  const available = accounts.filter((a) => a.status === 'available').length;
  const archived = accounts.filter((a) => a.status === 'archived').length;
  const active = accounts.filter((a) => a.status === 'active').length;
  const levelCount = accounts.filter((a) => a.status === 'level').length;
  const errored = accounts.filter((a) => a.status === 'error_checking').length;

  const toggleStatus = (status: AccountStatus | '') => {
    setStatusFilter((prev) => (prev === status ? '' : status));
  };

  return (
    <div>
      {/* ── İSTATİSTİK KARTLARI (Tıklanabilir ve Filtrelenebilir Taglar) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {/* Toplam Kartı */}
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`text-left rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${
            statusFilter === ''
              ? 'bg-slate-800/90 border-2 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.25)] -translate-y-1'
              : 'bg-slate-900/60 border border-slate-700/50 hover:-translate-y-1 hover:bg-slate-800/80 hover:border-slate-600'
          }`}
          title="Tüm durumları göster"
        >
          <div className="text-2xl sm:text-3xl flex items-center justify-center w-12 h-12 bg-black/25 rounded-xl shrink-0">
            🗂️
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-2xl sm:text-3xl font-extrabold leading-none text-white font-mono">
              {total}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold truncate">
              Toplam
            </span>
            {statusFilter === '' && (
              <span className="text-[10px] text-blue-400 font-medium mt-0.5">● Tümü Seçili</span>
            )}
          </div>
        </button>

        {/* Mevcut Kartı */}
        <button
          type="button"
          onClick={() => toggleStatus('available')}
          className={`text-left rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${
            statusFilter === 'available'
              ? 'bg-emerald-950/40 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] -translate-y-1'
              : 'bg-slate-900/60 border border-green-500/30 hover:-translate-y-1 hover:bg-slate-800/80 hover:border-green-400/60'
          }`}
          title="Sadece mevcut hesapları filtrele"
        >
          <div className="text-2xl sm:text-3xl flex items-center justify-center w-12 h-12 bg-black/25 rounded-xl shrink-0">
            ✅
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-2xl sm:text-3xl font-extrabold leading-none text-white font-mono">
              {available}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold truncate">
              Mevcut
            </span>
            {statusFilter === 'available' ? (
              <span className="text-[10px] text-emerald-400 font-bold mt-0.5">✓ Filtreleniyor</span>
            ) : (
              <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">Filtrele</span>
            )}
          </div>
        </button>

        {/* Arşiv Kartı */}
        <button
          type="button"
          onClick={() => toggleStatus('archived')}
          className={`text-left rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${
            statusFilter === 'archived'
              ? 'bg-rose-950/40 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] -translate-y-1'
              : 'bg-slate-900/60 border border-red-500/30 hover:-translate-y-1 hover:bg-slate-800/80 hover:border-red-400/60'
          }`}
          title="Sadece arşivlenen hesapları filtrele"
        >
          <div className="text-2xl sm:text-3xl flex items-center justify-center w-12 h-12 bg-black/25 rounded-xl shrink-0">
            💸
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-2xl sm:text-3xl font-extrabold leading-none text-white font-mono">
              {archived}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold truncate">
              Arşivlendi
            </span>
            {statusFilter === 'archived' ? (
              <span className="text-[10px] text-rose-400 font-bold mt-0.5">✓ Filtreleniyor</span>
            ) : (
              <span className="text-[10px] text-slate-500 mt-0.5">Filtrele</span>
            )}
          </div>
        </button>

        {/* Aktif Kartı */}
        <button
          type="button"
          onClick={() => toggleStatus('active')}
          className={`text-left rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-blue-950/40 border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)] -translate-y-1'
              : 'bg-slate-900/60 border border-blue-500/30 hover:-translate-y-1 hover:bg-slate-800/80 hover:border-blue-400/60'
          }`}
          title="Sadece aktif (oynanan) hesapları filtrele"
        >
          <div className="text-2xl sm:text-3xl flex items-center justify-center w-12 h-12 bg-black/25 rounded-xl shrink-0">
            🎮
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-2xl sm:text-3xl font-extrabold leading-none text-white font-mono">
              {active}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold truncate">
              Aktif
            </span>
            {statusFilter === 'active' ? (
              <span className="text-[10px] text-blue-400 font-bold mt-0.5">✓ Filtreleniyor</span>
            ) : (
              <span className="text-[10px] text-slate-500 mt-0.5">Filtrele</span>
            )}
          </div>
        </button>

        {/* ⚡ LEVEL KARTI (Özel Vurgu) */}
        <button
          type="button"
          onClick={() => toggleStatus('level')}
          className={`text-left rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md transition-all duration-200 cursor-pointer relative overflow-hidden ${
            statusFilter === 'level'
              ? 'bg-purple-950/50 border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.45)] -translate-y-1'
              : 'bg-slate-900/60 border border-purple-500/30 hover:-translate-y-1 hover:bg-slate-800/80 hover:border-purple-400/60'
          }`}
          title="Sadece 'Level' tagına sahip hesapları filtrele"
        >
          <div className="text-2xl sm:text-3xl flex items-center justify-center w-12 h-12 bg-purple-950/60 border border-purple-500/30 rounded-xl shrink-0">
            ⚡
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-2xl sm:text-3xl font-extrabold leading-none text-white font-mono">
              {levelCount}
            </span>
            <span className="text-xs text-purple-300 uppercase tracking-wider mt-1 font-semibold truncate flex items-center gap-1">
              Level
            </span>
            {statusFilter === 'level' ? (
              <span className="text-[10px] text-purple-300 font-bold mt-0.5">✓ Filtreleniyor</span>
            ) : (
              <span className="text-[10px] text-slate-500 mt-0.5">Filtrele</span>
            )}
          </div>
        </button>

        {/* Ban Kartı */}
        <button
          type="button"
          onClick={() => toggleStatus('error_checking')}
          className={`text-left rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${
            statusFilter === 'error_checking'
              ? 'bg-rose-950/40 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] -translate-y-1'
              : 'bg-slate-900/60 border border-rose-500/30 hover:-translate-y-1 hover:bg-slate-800/80 hover:border-rose-400/60'
          }`}
          title="Sadece kontrol hatası/ban olan hesapları filtrele"
        >
          <div className="text-2xl sm:text-3xl flex items-center justify-center w-12 h-12 bg-black/25 rounded-xl shrink-0">
            🚫
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-2xl sm:text-3xl font-extrabold leading-none text-white font-mono">
              {errored}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold truncate">
              Ban
            </span>
            {statusFilter === 'error_checking' ? (
              <span className="text-[10px] text-rose-400 font-bold mt-0.5">✓ Filtreleniyor</span>
            ) : (
              <span className="text-[10px] text-slate-500 mt-0.5">Filtrele</span>
            )}
          </div>
        </button>
      </div>

      {/* ── ACTION BAR (Hesap Ekle & Toplu İşlem) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10 bg-[#070e1a]/80 p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-3 flex-1 w-full">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>➕</span> Hesap Ekle
          </p>
          <AddAccountForm />
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> Toplu İşlem
          </p>
          <AccountSyncButton />
        </div>
      </div>

      {/* ── HESAP LİSTESİ BÖLÜMÜ ── */}
      <div className="mt-0">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Hesaplar</h2>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-slate-300">
              {total} kayıt
            </span>
          </div>

          {statusFilter && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Filtrelenen Durum:</span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/30 font-semibold uppercase">
                {statusFilter}
              </span>
              <button
                onClick={() => setStatusFilter('')}
                className="text-slate-400 hover:text-white cursor-pointer px-1 py-0.5"
                title="Filtreyi Kaldır"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <AccountTable
          accounts={accounts}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
        />
      </div>
    </div>
  );
}
