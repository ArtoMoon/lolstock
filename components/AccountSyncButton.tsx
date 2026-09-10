'use client';

import { useState, useTransition } from 'react';
import { syncAllAccounts, CheckResult } from '@/app/actions/accountSync';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * "Tüm Hesapları Senkronize Et" butonu.
 *
 * Hesap senkronizasyonunu başlatır, ilerleme ve sonuç özetini gösterir.
 * Rate-limit nedeniyle uzun sürebilir (~1.5s/hesap).
 */
export default function AccountSyncButton() {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<{
    summary: { total: number; success: number; failed: number };
    results: CheckResult[];
  } | null>(null);

  function handleSync() {
    setResults(null);
    startTransition(async () => {
      const data = await syncAllAccounts();
      setResults(data);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        id="sync-all-btn"
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-sans text-sm font-semibold cursor-pointer border-none transition-all whitespace-nowrap bg-gradient-to-br from-[#1a78c2] to-[#0f5fa3] text-white shadow-[0_2px_12px_rgba(26,120,194,0.4)] hover:from-[#3d9be9] hover:to-[#1a78c2] hover:shadow-[0_4px_20px_rgba(61,155,233,0.5)] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${isPending ? 'animate-pulse' : ''}`}
        onClick={handleSync}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            {t('syncing_progress')}
          </>
        ) : (
          `🔄 ${t('sync_all_btn')}`
        )}
      </button>

      {results && (
        <div className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-xl p-5 backdrop-blur-md text-sm">
          <div className="flex flex-wrap gap-4 mb-3">
            <span className="text-[#e8f0fe]">
              {t('stat_total')}: <strong>{results.summary.total}</strong>
            </span>
            <span className="text-green-300">
              ✅ {t('sync_success')}: <strong>{results.summary.success}</strong>
            </span>
            <span className="text-red-300">
              ❌ {t('sync_failed')}: <strong>{results.summary.failed}</strong>
            </span>
          </div>

          {/* Durum değişen hesaplar */}
          {results.results.some((r) => r.statusChanged) && (
            <div className="mt-3 pt-3 border-t border-[#3d9be9]/18">
              <p className="text-amber-500 font-semibold mb-2">⚠️ Durum Değişen Hesaplar:</p>
              {results.results
                .filter((r) => r.statusChanged)
                .map((r) => (
                  <p key={r.riotId} className="text-[#8bafd4] py-0.5">
                    {r.riotId} → <strong className="text-white">{r.newStatus}</strong>
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
