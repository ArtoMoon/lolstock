'use server';

/**
 * Stok kontrol Server Actions.
 *
 * Riot API üzerinden hesap bilgilerini (level, rank, lastMatchId) günceller.
 * Rate-limit kurallarına uygun batch gecikme uygulanır.
 *
 * Rate-limit kuralları (AI_GUIDELINES.md §3):
 *  - Her hesap arası: 1500ms bekleme
 *  - Tek hesap kontrol başına: ~3 istek (summoner + rank + match)
 *  - Hata olan hesap: loop'u durdurmaz, `error_checking` statüsüne alınır
 *
 * @module app/actions/stockCheck
 */

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db/mongoose';
import Account, { AccountStatus, IAccount } from '@/models/Account';
import { getSummonerByPuuid } from '@/lib/riot/summoner';
import { getRankByPuuid } from '@/lib/riot/rank';
import { getLastMatchId } from '@/lib/riot/matches';
import { delay } from '@/lib/riot/utils';

import { getDetailedRanksByPuuid, PlayerRanks } from '@/lib/riot/rank';
import { getMatchHistoryDetails, MatchDetail } from '@/lib/riot/matches';

/** Tek hesap kontrol sonucu */
export interface CheckResult {
  riotId: string;
  success: boolean;
  statusChanged?: boolean;
  newStatus?: AccountStatus;
  error?: string;
  matchCount?: number;
  message?: string;
  updatedAccount?: {
    summonerName?: string;
    level?: number;
    rank?: string;
    profileIconId?: number;
    ranks?: PlayerRanks;
    matches?: MatchDetail[];
    lastMatchId?: string;
    status?: AccountStatus;
    lastCheckedAt?: Date;
  };
}


/**
 * Tek bir hesabın Riot API verilerini günceller.
 *
 * Süreç:
 *  1. Summoner v4: level + summonerId + profileIconId çek (1 req)
 *  2. League v4: detaylı rank çek (1 req)
 *  3. Match v5: son 5 maç detayını çek (1 + 5 req)
 *  4. lastMatchId değiştiyse veya level ani artış varsa → status = "active"
 *  5. Tüm alanları MongoDB'de güncelle
 *
 * Rate-limit ağırlığı: ~8 istek / hesap
 * DB Mutasyonu: accounts koleksiyonunda tüm profil verileri güncellenir.
 *
 * @param {string} id - MongoDB ObjectId (string)
 * @returns {Promise<CheckResult>} Kontrol sonucu
 */
export async function checkSingleAccount(id: string): Promise<CheckResult> {
  await dbConnect();

  const account = await Account.findById(id).lean<IAccount & { _id: unknown }>();

  if (!account) {
    return { riotId: 'unknown', success: false, error: 'Hesap bulunamadı.' };
  }

  try {
    const platform = ((account as IAccount & { platform?: string }).platform || 'TR1') as import('@/lib/riot/client').RiotPlatform;

    // 1. Summoner v4 – level & profileIconId
    const { summonerName, level, profileIconId } = await getSummonerByPuuid(
      account.puuid,
      platform
    );

    // 2. League v4 – detailed rank
    const detailedRanks = await getDetailedRanksByPuuid(account.puuid, platform);
    const rank = detailedRanks.solo?.formattedRank || 'UNRANKED';

    // 3. Match v5 – en son 5 maç detayı
    const matches = await getMatchHistoryDetails(account.puuid, platform, 5);
    const latestMatchId = matches.length > 0 ? matches[0].matchId : null;

    // Durum değişikliği tespiti
    const matchChanged =
      latestMatchId !== null && latestMatchId !== account.lastMatchId;
    const levelSpiked = level > account.level + 5;

    let newStatus = account.status;
    if (matchChanged || levelSpiked) {
      // Hesap aktif kullanımda görünüyor
      newStatus = 'active';
    }

    const plainMatches = JSON.parse(JSON.stringify(matches));
    const plainRanks = JSON.parse(JSON.stringify(detailedRanks));

    const now = new Date();
    // DB güncelle
    await Account.findByIdAndUpdate(id, {
      summonerName,
      level,
      rank,
      profileIconId,
      ranks: plainRanks,
      matches: plainMatches,
      lastMatchId: latestMatchId ?? account.lastMatchId,
      status: newStatus,
      lastCheckedAt: now,
    });

    revalidatePath('/');
    revalidatePath(`/accounts/${id}`);

    const matchCount = matches.length;

    return {
      riotId: account.riotId,
      success: true,
      statusChanged: newStatus !== account.status,
      newStatus,
      matchCount,
      message: matchCount === 0
        ? 'Profil güncellendi, ancak Riot API üzerinde oynanmış maç bulunamadı.'
        : `Son ${matchCount} maç ve profil verileri güncellendi.`,
      updatedAccount: {
        summonerName,
        level,
        rank,
        profileIconId,
        ranks: plainRanks,
        matches: plainMatches,
        lastMatchId: latestMatchId ?? account.lastMatchId,
        status: newStatus,
        lastCheckedAt: now,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';

    // Hata olan hesabı işaretle, ama diğer hesapları etkileme
    await Account.findByIdAndUpdate(id, { status: 'error_checking' });

    console.error(`[StockCheck] ${account.riotId} kontrol hatası:`, message);

    return { riotId: account.riotId, success: false, error: message };
  }
}

/**
 * Tüm hesapları sırayla kontrol eder. Her hesap arası 1500ms bekler.
 *
 * Bir hesaptaki hata global loop'u durdurmaz.
 * Hatalı hesap `error_checking` statüsüne alınır ve sonraki hesaba geçilir.
 *
 * Rate-limit ağırlığı: ~3 istek/hesap × N hesap (aralarında 1500ms gecikme)
 * DB Mutasyonu: Tüm hesapların level, rank, lastMatchId, status, lastCheckedAt güncellenir.
 *
 * @returns {Promise<{ results: CheckResult[]; summary: { total: number; success: number; failed: number } }>}
 *
 * @example
 * const { results, summary } = await checkAllAccounts();
 * console.log(`${summary.success}/${summary.total} hesap başarıyla güncellendi`);
 */
export async function checkAllAccounts(): Promise<{
  results: CheckResult[];
  summary: { total: number; success: number; failed: number };
}> {
  await dbConnect();

  const accounts = await Account.find({}).select('_id').lean<{ _id: unknown }[]>();

  const results: CheckResult[] = [];

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const id = String(account._id);

    const result = await checkSingleAccount(id);
    results.push(result);

    // Son hesap değilse gecikme uygula (rate-limit koruma)
    if (i < accounts.length - 1) {
      await delay(1500);
    }
  }

  const successCount = results.filter((r) => r.success).length;

  return {
    results,
    summary: {
      total: results.length,
      success: successCount,
      failed: results.length - successCount,
    },
  };
}

/**
 * Yalnızca belirli bir hesabın maç geçmişini (Match v5) ve güncel ranklarını (League v4) günceller.
 *
 * @param {string} id - MongoDB ObjectId (string)
 */
export async function syncMatchHistory(id: string): Promise<CheckResult> {
  await dbConnect();
  
  const account = await Account.findById(id).lean<IAccount & { _id: unknown }>();
  if (!account) return { riotId: 'unknown', success: false, error: 'Hesap bulunamadı.' };

  try {
    const platform = ((account as IAccount & { platform?: string }).platform || 'TR1') as import('@/lib/riot/client').RiotPlatform;
    
    // 1. Maç detaylarını çek (1 id fetch + 5 match fetch)
    const matches = await getMatchHistoryDetails(account.puuid, platform, 5);
    const latestMatchId = matches.length > 0 ? matches[0].matchId : null;

    // 2. Detaylı rankları (Solo ve Flex) da güncelle
    const detailedRanks = await getDetailedRanksByPuuid(account.puuid, platform);
    const rank = detailedRanks.solo?.formattedRank || account.rank || 'UNRANKED';

    let newStatus = account.status;
    if (latestMatchId !== null && latestMatchId !== account.lastMatchId) {
      newStatus = 'active'; // Yeni maç atılmışsa hesabı aktif yap
    }

    const plainMatches = JSON.parse(JSON.stringify(matches));
    const plainRanks = JSON.parse(JSON.stringify(detailedRanks));

    const now = new Date();
    await Account.findByIdAndUpdate(id, {
      matches: plainMatches,
      ranks: plainRanks,
      rank,
      lastMatchId: latestMatchId ?? account.lastMatchId,
      status: newStatus,
      lastCheckedAt: now,
    });

    revalidatePath(`/accounts/${id}`);
    revalidatePath('/');

    const matchCount = matches.length;

    return {
      riotId: account.riotId,
      success: true,
      statusChanged: newStatus !== account.status,
      newStatus,
      matchCount,
      message: matchCount === 0
        ? 'Bu hesapta Riot API üzerinde oynanmış maç bulunamadı.'
        : `Son ${matchCount} maç başarıyla çekildi.`,
      updatedAccount: {
        matches: plainMatches,
        ranks: plainRanks,
        rank,
        lastMatchId: latestMatchId ?? account.lastMatchId,
        status: newStatus,
        lastCheckedAt: now,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Maç geçmişi güncellenirken hata oluştu.';
    return { riotId: account.riotId, success: false, error: message };
  }
}
