/**
 * Riot API yardımcı araçları – genel amaçlı fonksiyonlar.
 * @module lib/riot/utils
 */

/**
 * Belirtilen süre kadar asenkron bekler.
 * Batch hesap senkronizasyon döngülerinde rate-limit ihlalini önlemek için kullanılır.
 *
 * @param {number} ms - Bekleme süresi (milisaniye)
 * @returns {Promise<void>}
 *
 * @example
 * await delay(1500); // 1.5 saniye bekle
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Metin içindeki görünmez Unicode biçimlendirme ve kontrol karakterlerini
 * (Ör: LRI \u2066, PDI \u2069, ZWSP \u200B, LRM, RLM, BOM vb.) temizler.
 * Kopyala-yapıştır sırasında gelen gizli karakterleri ayıklar.
 *
 * @param {string} raw - Ham girdi metni
 * @returns {string} Temizlenmiş metin
 */
export function sanitizeRiotId(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\p{Cf}\p{Cc}]/gu, '')
    .trim();
}

/**
 * "GameName#TAG" formatındaki Riot ID'yi bileşenlerine ayırır.
 * Görünmez Unicode karakterleri otomatik olarak temizler.
 *
 * @param {string} fullRiotId - "GameName#TAG" formatında Riot ID
 * @returns {{ gameName: string; tagLine: string }} Ayrıştırılmış bileşenler
 * @throws {Error} Geçersiz format durumunda
 *
 * @example
 * parseRiotId('Faker#KR1'); // { gameName: 'Faker', tagLine: 'KR1' }
 */
export function parseRiotId(fullRiotId: string): {
  gameName: string;
  tagLine: string;
} {
  const cleaned = sanitizeRiotId(fullRiotId);
  const parts = cleaned.split('#');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    throw new Error(
      `Geçersiz Riot ID formatı: "${fullRiotId}". Beklenen format: "GameName#TAG"`
    );
  }
  return { gameName: parts[0].trim(), tagLine: parts[1].trim() };
}

/**
 * Riot ID'yi temizler ve standart "GameName#TAG" biçiminde döndürür.
 *
 * @param {string} fullRiotId - Ham Riot ID
 * @returns {string} Temizlenmiş "GameName#TAG"
 */
export function normalizeRiotId(fullRiotId: string): string {
  const { gameName, tagLine } = parseRiotId(fullRiotId);
  return `${gameName}#${tagLine}`;
}

/**
 * Sayısal rank tier + division bilgisini okunabilir stringe dönüştürür.
 *
 * @param {string} tier - Rank tier (ör: "GOLD")
 * @param {string} division - Rank division (ör: "II")
 * @param {number} lp - LP miktarı
 * @returns {string} Formatlanmış rank, ör: "GOLD II 45 LP"
 */
export function formatRank(
  tier: string,
  division: string,
  lp: number
): string {
  if (!tier || tier === 'UNRANKED') return 'UNRANKED';
  return `${tier} ${division} ${lp} LP`;
}
