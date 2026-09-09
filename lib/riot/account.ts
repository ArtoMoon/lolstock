/**
 * Riot Account v1 – PUUID çekme modülü.
 *
 * PUUID kalıcıdır; bir kez MongoDB'ye kaydedildikten sonra
 * tekrar sorgulanmaz (AI_GUIDELINES.md §3 – Database-First Caching).
 *
 * Kullanılan endpoint:
 *   GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
 *   Host: {region}.api.riotgames.com
 *
 * @module lib/riot/account
 */

import { getRegionForPlatform, riotFetch, RiotPlatform } from './client';
import { sanitizeRiotId } from './utils';

/** Account-v1 API yanıtı */
interface AccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

/**
 * Riot ID'ye karşılık gelen PUUID'yi Riot Account v1 API'sinden çeker.
 *
 * Rate-limit ağırlığı: 1 istek / çağrı
 * Caching: Dönen PUUID MongoDB'ye kaydedilmeli ve sonraki kontrollerde
 *          doğrudan DB'den okunmalıdır.
 *
 * @param {string} gameName  - Riot oyun adı (# işareti olmaksızın)
 * @param {string} tagLine   - Riot etiket satırı (# olmaksızın)
 * @param {RiotPlatform} platform - Platform kodu (ör: "TR1")
 * @returns {Promise<string>} PUUID
 * @throws {Error} API hatası veya hesap bulunamadığında
 *
 * @example
 * const puuid = await getPuuidByRiotId('Faker', 'KR1', 'KR');
 */
export async function getPuuidByRiotId(
  gameName: string,
  tagLine: string,
  platform: RiotPlatform = 'TR1'
): Promise<string> {
  const region = getRegionForPlatform(platform);
  const cleanName = sanitizeRiotId(gameName);
  const cleanTag = sanitizeRiotId(tagLine);

  const encodedName = encodeURIComponent(cleanName);
  const encodedTag = encodeURIComponent(cleanTag);

  const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;

  try {
    const data = await riotFetch<AccountDto>(url);
    return data.puuid;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('404')) {
      throw new Error(
        `"${cleanName}#${cleanTag}" Riot ID'sine sahip hesap bulunamadı (404). Lütfen adı, etiketi ve sunucu bölgesini kontrol edin.`
      );
    }
    throw err;
  }
}
