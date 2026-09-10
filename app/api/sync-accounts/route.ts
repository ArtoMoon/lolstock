/**
 * API Route: /api/sync-accounts
 *
 * POST – Tüm hesaplar için senkronizasyonu tetikler.
 *
 * Her hesap arası 1500ms gecikme uygulanır (rate-limit koruma).
 * Hatalı hesaplar loop'u kesmez, `error_checking` statüsüne alınır.
 *
 * @module app/api/sync-accounts/route
 */

import { NextResponse } from 'next/server';
import { syncAllAccounts } from '@/app/actions/accountSync';

/**
 * POST /api/sync-accounts
 *
 * @returns {NextResponse} 200 – { results, summary } | 500 – hata
 */
export async function POST(): Promise<NextResponse> {
  try {
    const data = await syncAllAccounts();
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sunucu hatası.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
