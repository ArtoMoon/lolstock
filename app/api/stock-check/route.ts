/**
 * API Route: /api/stock-check
 *
 * POST – Tüm hesaplar için stok kontrolünü tetikler.
 *
 * Her hesap arası 1500ms gecikme uygulanır (rate-limit koruma).
 * Hatalı hesaplar loop'u kesmez, `error_checking` statüsüne alınır.
 *
 * Rate-limit ağırlığı: ~3 istek/hesap × N hesap
 * DB Mutasyonu: Tüm hesapların level, rank, lastMatchId, status, lastCheckedAt güncellenir.
 *
 * @module app/api/stock-check/route
 */

import { NextResponse } from 'next/server';
import { checkAllAccounts } from '@/app/actions/stockCheck';

/**
 * POST /api/stock-check
 *
 * @returns {NextResponse} 200 – { results, summary } | 500 – hata
 */
export async function POST(): Promise<NextResponse> {
  try {
    const data = await checkAllAccounts();
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sunucu hatası.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
