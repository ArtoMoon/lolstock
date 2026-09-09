/**
 * Riot Match v5 – En son maç ID'si çekme modülü.
 *
 * Sadece en son maç ID'si çekilir (`count=1`).
 * `lastMatchId` değişirse hesap "sold" ya da "active" olarak işaretlenir.
 *
 * Kullanılan endpoint:
 *   GET /lol/match/v5/matches/by-puuid/{puuid}/ids?count=1
 *   Host: {region}.api.riotgames.com
 *
 * Cache stratejisi: Match ID 6–12 saatte bir kontrol edilir.
 * Değişiklik varsa hesap durumu güncellenir (AI_GUIDELINES.md §3).
 *
 * @module lib/riot/matches
 */

import { getRegionForPlatform, riotFetch, RiotPlatform } from './client';

/**
 * Verilen PUUID'nin en son RANKED_SOLO_5x5 maç ID'sini döndürür.
 *
 * Rate-limit ağırlığı: 1 istek / çağrı
 * DB Mutasyonu: Çağrıcı, dönen `matchId`'yi `accounts.lastMatchId` ile karşılaştırır;
 *               farklıysa hesap durumunu "sold" veya "active" olarak günceller.
 *
 * @param {string} puuid - Hesabın kalıcı PUUID'si
 * @param {RiotPlatform} platform - Platform kodu (ör: "TR1")
 * @param {string} [queue] - Kuyruk filtresi (ör: "420" = Ranked Solo). Varsayılan: tüm kuyruklar.
 * @returns {Promise<string | null>} En son maç ID'si ya da maç yoksa null
 * @throws {Error} API hatası durumunda
 *
 * @example
 * const matchId = await getLastMatchId('abc...puuid', 'TR1');
 * // "TR1_1234567890"
 */
export async function getLastMatchId(
  puuid: string,
  platform: RiotPlatform = 'TR1',
  queue?: string
): Promise<string | null> {
  const region = getRegionForPlatform(platform);
  const queueParam = queue ? `&queue=${queue}` : '';

  const url =
    `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/` +
    `${encodeURIComponent(puuid)}/ids?count=1${queueParam}`;

  const ids = await riotFetch<string[]>(url);

  return ids.length > 0 ? ids[0] : null;
}

export interface MatchDetail {
  matchId: string;
  gameDuration: number;
  gameCreation: number;
  queueId: number;
  win: boolean;
  championName: string;
  championId: number;
  kills: number;
  deaths: number;
  assists: number;
  items: number[];
  cs: number;
  spell1Id: number;
  spell2Id: number;
  role: string;
  lane: string;
}

/**
 * Kullanıcının son X maçının detaylarını çeker.
 */
export async function getMatchHistoryDetails(
  puuid: string,
  platform: RiotPlatform = 'TR1',
  count: number = 5
): Promise<MatchDetail[]> {
  const region = getRegionForPlatform(platform);

  // 1. Son X maçın ID'lerini al
  const idsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?count=${count}`;
  const matchIds = await riotFetch<string[]>(idsUrl);

  if (!matchIds || matchIds.length === 0) return [];

  // 2. Her bir maçın detaylarını paralel olarak çek
  const detailsPromises = matchIds.map(async (matchId) => {
    try {
      const matchUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      const matchData = await riotFetch<any>(matchUrl);
      
      // İlgili oyuncunun participant verisini bul
      const participant = matchData.info.participants.find((p: any) => p.puuid === puuid);
      if (!participant) return null;

      // Minyon hesaplaması (lane minion + jungle monster)
      const cs = (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0);

      // Eşyalar
      const items = [
        participant.item0, participant.item1, participant.item2,
        participant.item3, participant.item4, participant.item5,
        participant.item6
      ];

      return {
        matchId,
        gameDuration: matchData.info.gameDuration,
        gameCreation: matchData.info.gameCreation,
        queueId: matchData.info.queueId,
        win: participant.win,
        championName: participant.championName,
        championId: participant.championId,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        items,
        cs,
        spell1Id: participant.summoner1Id,
        spell2Id: participant.summoner2Id,
        role: participant.role,
        lane: participant.lane
      } as MatchDetail;
    } catch (error) {
      console.error(`Maç detayları çekilemedi: ${matchId}`, error);
      return null;
    }
  });

  const results = await Promise.all(detailsPromises);
  
  // Hatalı (null) dönenleri filtrele
  return results.filter((r): r is MatchDetail => r !== null);
}
