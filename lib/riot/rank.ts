/**
 * Riot League v4 – Rank bilgisi çekme modülü.
 *
 * Kullanılan endpoint:
 *   GET /lol/league/v4/entries/by-puuid/{encryptedPUUID}
 *   Host: {platform}.api.riotgames.com
 *
 * Cache stratejisi: Rank bilgisi 6–12 saatte bir güncellenir
 * (AI_GUIDELINES.md §3).
 *
 * @module lib/riot/rank
 */

import { riotFetch, RiotPlatform } from './client';
import { formatRank } from './utils';

/** League-v4 tek giriş DTO'su */
interface LeagueEntryDto {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
}

/**
 * Verilen PUUID için RANKED_SOLO_5x5 rank bilgisini döndürür.
 *
 * Rate-limit ağırlığı: 1 istek / çağrı
 * DB Mutasyonu: Çağrıcı, dönen `rank` değerini MongoDB `accounts` koleksiyonunda günceller.
 *
 * Not: encryptedSummonerId tabanlı endpoint yerine PUUID tabanlı endpoint kullanılır.
 * Riot API'nin yeni sürümlerinde summonerId artık Summoner v4 yanıtında dönmeyebilir.
 *
 * @param {string} puuid - Hesabın kalıcı PUUID'si
 * @param {RiotPlatform} platform - Platform kodu (ör: "TR1")
 * @returns {Promise<string>} Formatlanmış rank, ör: "GOLD II 45 LP" ya da "UNRANKED"
 * @throws {Error} API hatası durumunda
 *
 * @example
 * const rank = await getRankByPuuid('abc...puuid', 'TR1');
 * // "PLATINUM I 87 LP"
 */
export async function getRankByPuuid(
  puuid: string,
  platform: RiotPlatform = 'TR1'
): Promise<string> {
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;

  const entries = await riotFetch<LeagueEntryDto[]>(url);

  const soloEntry = entries.find(
    (e) => e.queueType === 'RANKED_SOLO_5x5'
  );

  if (!soloEntry) return 'UNRANKED';

  return formatRank(soloEntry.tier, soloEntry.rank, soloEntry.leaguePoints);
}

export interface DetailedRank {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  formattedRank: string;
}

export interface PlayerRanks {
  solo: DetailedRank | null;
  flex: DetailedRank | null;
}

/**
 * Verilen PUUID için Solo ve Flex detaylı rank bilgilerini döndürür.
 */
export async function getDetailedRanksByPuuid(
  puuid: string,
  platform: RiotPlatform = 'TR1'
): Promise<PlayerRanks> {
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
  
  try {
    const entries = await riotFetch<LeagueEntryDto[]>(url);
    
    const soloEntry = entries.find((e) => e.queueType === 'RANKED_SOLO_5x5');
    const flexEntry = entries.find((e) => e.queueType === 'RANKED_FLEX_SR');
    
    const parseEntry = (e: LeagueEntryDto | undefined): DetailedRank | null => {
      if (!e) return null;
      return {
        tier: e.tier,
        rank: e.rank,
        lp: e.leaguePoints,
        wins: e.wins,
        losses: e.losses,
        formattedRank: formatRank(e.tier, e.rank, e.leaguePoints)
      };
    };

    return {
      solo: parseEntry(soloEntry),
      flex: parseEntry(flexEntry)
    };
  } catch (error) {
    console.error('Rank detayları alınamadı:', error);
    return { solo: null, flex: null };
  }
}

/**
 * @deprecated summonerId artık Riot API'den dönmeyebilir.
 * Bunun yerine getRankByPuuid() kullanın.
 */
export async function getRankBySummonerId(
  summonerId: string | null,
  platform: RiotPlatform = 'TR1'
): Promise<string> {
  if (!summonerId) return 'UNRANKED';
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`;
  const entries = await riotFetch<LeagueEntryDto[]>(url);
  const soloEntry = entries.find((e) => e.queueType === 'RANKED_SOLO_5x5');
  if (!soloEntry) return 'UNRANKED';
  return formatRank(soloEntry.tier, soloEntry.rank, soloEntry.leaguePoints);
}
