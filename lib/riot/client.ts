/**
 * Riot API temel HTTP istemcisi.
 *
 * Tüm Riot API çağrıları bu modül üzerinden yapılır.
 * Rate-limit başlıklarını denetler, 429 durumunda duraklar ve
 * hata yönetimi sağlar.
 *
 * Rate-limit kuralları (AI_GUIDELINES.md §3):
 *  - 20 istek / 10 saniye (uygulama)
 *  - 100 istek / 2 dakika (uygulama)
 *
 * @module lib/riot/client
 */

const RIOT_API_KEY = process.env.RIOT_API_KEY ?? '';

/** Desteklenen Riot platform bölgeleri */
export type RiotPlatform =
  | 'TR1'
  | 'EUW1'
  | 'EUN1'
  | 'NA1'
  | 'KR'
  | 'BR1'
  | 'LA1'
  | 'LA2'
  | 'OC1'
  | 'RU'
  | 'JP1';

/** Desteklenen Riot routing bölgeleri (match-v5 ve account-v1 için) */
export type RiotRegion = 'europe' | 'americas' | 'asia' | 'sea';

/** Platform → Routing bölgesi eşleşmesi */
const PLATFORM_TO_REGION: Record<RiotPlatform, RiotRegion> = {
  TR1: 'europe',
  EUW1: 'europe',
  EUN1: 'europe',
  NA1: 'americas',
  BR1: 'americas',
  LA1: 'americas',
  LA2: 'americas',
  KR: 'asia',
  JP1: 'asia',
  OC1: 'sea',
  RU: 'europe',
};

/**
 * Verilen platform için routing bölgesini döndürür.
 *
 * @param {RiotPlatform} platform - Platform kodu (ör: "TR1")
 * @returns {RiotRegion} Routing bölgesi (ör: "europe")
 */
export function getRegionForPlatform(platform: RiotPlatform): RiotRegion {
  return PLATFORM_TO_REGION[platform];
}

/**
 * Riot API'ye GET isteği gönderir.
 *
 * - `X-App-Rate-Limit-Count` başlığını kontrol eder.
 * - HTTP 429 durumunda `Retry-After` süresince bekler ve tekrar dener.
 * - Başarısız isteklerde açıklayıcı hata fırlatır.
 *
 * @param {string} url - Tam Riot API URL'si
 * @returns {Promise<T>} Ayrıştırılmış JSON yanıtı
 * @throws {Error} HTTP hatası veya ağ hatası durumunda
 *
 * @example
 * const data = await riotFetch<SummonerDto>(
 *   'https://tr1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/...'
 * );
 */
export async function riotFetch<T>(url: string): Promise<T> {
  if (!RIOT_API_KEY) {
    throw new Error(
      'RIOT_API_KEY environment variable is not defined. Add it to .env.local.'
    );
  }

  const headers = {
    'X-Riot-Token': RIOT_API_KEY,
    Accept: 'application/json',
  };

  let response: Response;

  try {
    response = await fetch(url, { headers });
  } catch (err) {
    throw new Error(`Riot API ağ hatası: ${String(err)}`);
  }

  // Rate-limit başlığını logla (yaklaşma durumunda uyarı ver)
  const rateLimitCount = response.headers.get('X-App-Rate-Limit-Count');
  if (rateLimitCount) {
    const parts = rateLimitCount.split(',');
    parts.forEach((part) => {
      const [count, window] = part.trim().split(':').map(Number);
      const limit = window === 10 ? 20 : 100;
      if (count >= limit * 0.8) {
        console.warn(
          `[RiotClient] Rate-limit uyarısı: ${count}/${limit} (${window}s penceresi)`
        );
      }
    });
  }

  // 429 Too Many Requests — Retry-After süresince bekle
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
    console.warn(
      `[RiotClient] 429 alındı. ${waitMs / 1000}s bekleniyor...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return riotFetch<T>(url); // Tekrar dene
  }

  if (!response.ok) {
    throw new Error(
      `Riot API HTTP ${response.status}: ${response.statusText} — ${url}`
    );
  }

  return response.json() as Promise<T>;
}
