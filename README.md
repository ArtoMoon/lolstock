# ⚔️ MyLoL – League of Legends Alt-Account Dashboard & Desktop Client

<p align="center">
  <img src="https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/588.png" width="96" height="96" alt="MyLoL Logo" style="border-radius: 20px; box-shadow: 0 0 20px rgba(234, 179, 8, 0.4);" />
</p>

<p align="center">
  <b>Tüm League of Legends ikincil ve smurf hesaplarınızı tek bir modern masaüstü panelinden yönetin ve senkronize edin.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Electron-Desktop_Client-47848F?style=for-the-badge&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Riot_API-Compliant-D32936?style=for-the-badge&logo=riotgames" alt="Riot Games" />
</p>

---

## 🌟 Temel Özellikler

* 🔄 **Riot API Gerçek Zamanlı Senkronizasyon:** Riot ID (`GameName#TAG`) üzerinden anlık Summoner Level, Solo/Duo & Flex rankları, lig puanı (LP) ve son maç geçmişi takibi.
* 🛡️ **Riot Games ToS & API Uyumluluğu:** Kişisel hesap takip ve senkronizasyon standartlarına tam uyumlu mimari.
* ⚡ **Akıllı Rate-Limit Koruması:** Riot API sınırlarını aşmamak için otomatik batch delay loop (her hesap arası 1500ms) ve HTTP 429 kurtarma mekanizması.
* 🖥️ **Özel Masaüstü İstemcisi (Native Desktop App):** 
  * Windows için çerçevesiz (frameless) şık Riot Client tarzı arayüz.
  * Sürüklenebilir başlık çubuğu (`drag-region`).
  * Web tarayıcısı hissiyatından arındırılmış, optimize masaüstü `.exe` çıktısı.
* 📊 **Zengin İstatistikler ve Filtreleme:** Tek tıkla statü filtreleri (`Mevcut`, `Aktif`, `Level`, `Arşivlendi`, `Ban`), detaylı lig rozetleri ve dinamik arama.
* 🔒 **Güvenli ve Yerel:** API anahtarları asla istemciye açılmaz (`'use server'`), tüm veriler yerel MongoDB veritabanınızda şifrelenir/saklanır.

---

## 🚀 Başlangıç ve Kurulum

### Gereksinimler
* [Node.js](https://nodejs.org/) (v20 veya üzeri önerilir)
* [Yarn](https://yarnpkg.com/) paket yöneticisi
* Yerel [MongoDB Community Server](https://www.mongodb.com/try/download/community) veya MongoDB Atlas URI
* [Riot Games Developer Portal](https://developer.riotgames.com/) üzerinden alınmış geçerli bir API Key

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/ArtoMoon/lolstock.git
cd lolstock
```

### 2. Bağımlılıkları Yükleyin
```bash
yarn install
```

### 3. Ortam Değişkenlerini Ayarlayın
Kök dizinde `.env.local` dosyası oluşturun ve bilgilerinizi girin:
```env
MONGODB_URI=mongodb://localhost:27017/
RIOT_API_KEY=RGAPI-your-riot-api-key-here
```

---

## 💻 Çalıştırma Seçenekleri

### Web Geliştirme Modu (Tarayıcı)
```bash
yarn dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### Masaüstü Geliştirme Modu (Electron + Next.js)
```bash
yarn electron:dev
```
*(Next.js sunucusuyla birlikte yerel Electron masaüstü penceresi açılır).*

### Windows Masaüstü (.exe) Derleme
```bash
# Bağımsız klasör olarak unpacked .exe üretir:
yarn electron:build:dir

# Veya tek dosya taşınabilir (.exe) üretir:
yarn electron:build:portable
```
Üretilen çalıştırılabilir dosya `dist/win-unpacked/MyLoL.exe` veya `dist/MyLoL-Portable-0.1.0.exe` konumunda yer alır.

---

## 📁 Proje Mimarisi

```text
├── app/
│   ├── actions/          # Server Actions (syncAccounts.ts, accounts.ts)
│   ├── api/              # API Route Handlers (/api/sync-accounts, /api/accounts)
│   ├── accounts/[id]/    # Detaylı hesap ve maç analiz sayfası
│   ├── layout.tsx        # Kök layout ve font yapılandırması
│   └── page.tsx          # Ana dashboard sayfası
├── components/           # UI Bileşenleri (AccountTable, StatusBadge, RankBadge vb.)
├── electron/             # Electron masaüstü main & preload scriptleri
├── lib/
│   ├── db/               # Mongoose global connection cache
│   └── riot/             # Riot API wrapper (account, summoner, rank, matches)
├── models/               # MongoDB Mongoose şemaları (Account.ts)
├── scripts/              # Standalone build & dereference scriptleri
└── package.json
```

---

## ⚖️ Yasal Uyarı / Disclaimer

*MyLoL isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.*

---

## 📝 Lisans
Bu proje MIT lisansı ile lisanslanmıştır.
