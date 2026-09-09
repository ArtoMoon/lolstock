/**
 * Riot Summoner v4 – Summoner bilgisi çekme modülü.
 *
 * Kullanılan endpoint:
 *   GET /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}
 *   Host: {platform}.api.riotgames.com
 *
 * Cache stratejisi: Level & summonerName 6–12 saatte bir güncellenir
 * (AI_GUIDELINES.md §3).
 *
 * @module lib/riot/summoner
 */

import { riotFetch, RiotPlatform } from './client';

/**
 * Riot Summoner v4 API yanıtı.
 * Not: `id` (encryptedSummonerId) bazı dev key konfigürasyonlarında
 * dönmeyebilir — çağrıcı null kontrolü yapmalıdır.
 */
interface SummonerDto {
  id?: string;
  accountId?: string;
  puuid?: string;
  name?: string;
  profileIconId?: number;
  revisionDate?: number;
  summonerLevel?: number;
}

/**
 * PUUID'ye göre summoner bilgisini (level, summonerId, görünen isim) döndürür.
 *
 * Rate-limit ağırlığı: 1 istek / çağrı
 * DB Mutasyonu: Çağrıcı, `level` ve `summonerName` alanlarını MongoDB'de günceller.
 *
 * @param {string} puuid - Hesabın kalıcı PUUID'si
 * @param {RiotPlatform} platform - Platform kodu (ör: "TR1")
 * @returns {Promise<{ summonerId: string | null; summonerName: string; level: number }>}
 *   summonerId — null ise League v4 rank çekimi atlanmalıdır.
 * @throws {Error} API hatası veya hesap bulunamadığında
 *
 * @example
 * const info = await getSummonerByPuuid('abc...', 'TR1');
 * // { summonerId: 'enc_id...', summonerName: 'SoyBeans', level: 142 }
 */
export async function getSummonerByPuuid(
  puuid: string,
  platform: RiotPlatform = 'TR1'
): Promise<{ summonerId: string | null; summonerName: string; level: number; profileIconId: number }> {
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;

  const data = await riotFetch<SummonerDto>(url);

  // Yanıt yapısını logla — beklenmedik format tespiti için
  if (!data.id) {
    console.warn(
      '[Summoner] encryptedSummonerId (data.id) boş döndü. ' +
        'Rank çekimi atlanacak. Yanıt anahtarları:',
      Object.keys(data)
    );
  }

  return {
    summonerId: data.id ?? null,
    summonerName: data.name ?? puuid.slice(0, 16),
    level: data.summonerLevel ?? 0,
    profileIconId: data.profileIconId ?? 1,
  };
}
