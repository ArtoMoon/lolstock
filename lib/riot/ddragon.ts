/**
 * Riot Data Dragon (DDragon) Yardımcıları.
 * Şampiyon, eşya, büyü, profil ikonları gibi statik içerikleri sağlar.
 */

// Not: Aslında dinamik olarak çekmek en iyisidir ama rate-limit ve hız için
// güncel sürümü statik olarak ya da periyodik güncelleyerek kullanabiliriz.
// Şimdilik en güncel sürümlerden birini sabit verelim, gerekirse dinamik çekeriz.
const DDRAGON_VERSION = '14.5.1'; // TODO: Dinamik hale getirilebilir

export const ddragon = {
  version: DDRAGON_VERSION,
  
  profileIcon: (iconId: number) => 
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`,
    
  champion: (championName: string) => 
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championName}.png`,
    
  item: (itemId: number) => {
    if (!itemId || itemId === 0) return null;
    return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`;
  },
  
  spell: (spellId: string) => 
    `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${spellId}.png`
};

/**
 * Riot API'den dönen championId'yi DDragon şampiyon adına çeviren mapping.
 * İdealde DDragon'dan data/tr_TR/champion.json çekilip hafızada tutulur.
 */
// TODO: Gerekirse burayı dinamik bir map haline getirebiliriz. Şimdilik isim eşleştirmeleri
// çoğunlukla sabit olduğu için Match-V5 verisindeki `championName` alanını doğrudan kullanacağız.
// Match-v5 zaten bize `championName` (örn. "Aatrox", "XinZhao") veriyor.
