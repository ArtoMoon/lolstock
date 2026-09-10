/**
 * API Route: /api/accounts
 *
 * GET  – Tüm hesapları döndürür (isteğe bağlı ?status= ve ?search= filtresi)
 * POST – Yeni hesap ekler
 *
 * Tüm Riot API işlemleri sunucu tarafında çalışır.
 *
 * @module app/api/accounts/route
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Account from '@/models/Account';
import { getPuuidByRiotId } from '@/lib/riot/account';
import { parseRiotId, sanitizeRiotId } from '@/lib/riot/utils';
import { AccountStatus } from '@/models/Account';

/**
 * GET /api/accounts
 *
 * Query params:
 *  - `status`  : AccountStatus filtresi (ör: "available")
 *  - `search`  : riotId, username veya summonerName'de arama (case-insensitive)
 *
 * @returns {NextResponse} 200 – hesap listesi JSON dizisi
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AccountStatus | null;
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { riotId: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { summonerName: { $regex: search, $options: 'i' } },
      ];
    }

    const accounts = await Account.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(accounts, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sunucu hatası.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/accounts
 *
 * Body (JSON): `{ "riotId": "GameName#TAG", "username": "login_user" }`
 *
 * İşlem:
 *  1. riotId formatı doğrula
 *  2. Duplicate kontrolü
 *  3. PUUID'yi Riot Account v1'den çek
 *  4. MongoDB'ye kaydet
 *
 * Rate-limit ağırlığı: 1 istek (account-v1)
 * DB Mutasyonu: accounts koleksiyonuna yeni belge ekler
 *
 * @returns {NextResponse} 201 – oluşturulan hesap | 400 – geçersiz istek | 500 – sunucu hatası
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    const body = await request.json();
    const riotId: string = body?.riotId?.trim();
    const rawUsername: string = body?.username ?? '';

    if (!riotId) {
      return NextResponse.json(
        { error: 'riotId gerekli.' },
        { status: 400 }
      );
    }

    const { gameName, tagLine } = parseRiotId(riotId);
    const normalizedRiotId = `${gameName}#${tagLine}`;
    const cleanUsername = rawUsername ? sanitizeRiotId(rawUsername) : '';

    const existing = await Account.findOne({
      riotId: { $regex: new RegExp(`^${normalizedRiotId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: `Bu hesap (${normalizedRiotId}) zaten kayıtlı.` },
        { status: 400 }
      );
    }

    const puuid = await getPuuidByRiotId(gameName, tagLine, 'TR1');

    const account = await Account.create({
      riotId: normalizedRiotId,
      username: cleanUsername,
      puuid,
      summonerName: gameName,
      status: 'available',
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sunucu hatası.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
