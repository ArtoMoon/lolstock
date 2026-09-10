/**
 * Dil Sözlüğü (Translations Dictionary).
 *
 * MyLoL uygulaması için Türkçe (TR) ve İngilizce (EN) arayüz metinleri.
 *
 * @module lib/i18n/translations
 */

export type Language = 'tr' | 'en';

export const translations = {
  tr: {
    // Navbar
    client_badge: 'Desktop Client',
    dashboard: 'Dashboard',
    db_active: 'Yerel Veritabanı Aktif',
    settings_btn: 'API Key & Ayarlar',

    // Dashboard Header
    riot_client_manager: '⚔️ Riot İstemci Yöneticisi',
    dashboard_title_1: 'Kişisel Hesap',
    dashboard_title_2: 'Paneli',
    dashboard_subtitle: 'Riot API ile gerçek zamanlı level, rank ve aktivite senkronizasyonu',

    // Stats Cards
    stat_total: 'Toplam',
    stat_available: 'Mevcut',
    stat_archived: 'Arşivlendi',
    stat_active: 'Aktif',
    stat_level: 'Level',
    stat_banned: 'Ban',
    all_selected: '● Tümü Seçili',
    filtering: '✓ Filtreleniyor',
    filter_action: 'Filtrele',

    // Statuses
    status_available: 'Mevcut',
    status_archived: 'Arşivlendi',
    status_active: 'Aktif',
    status_level: 'Level',
    status_error_checking: 'Ban',

    // Action Bar & Filters
    search_placeholder: 'Riot ID (Örn: Faker#KR1) veya hesap ara...',
    tag_all: 'Tümü',
    add_account_btn: 'Yeni Hesap Ekle',
    sync_all_btn: 'Tüm Hesapları Senkronize Et',
    syncing_status: 'Senkronize ediliyor...',

    // Table Columns & UI
    all_regions: 'Tüm Bölgeler',
    sort_by: 'Sırala:',
    sort_last_checked: '🕒 Son Kontrol (Yeni)',
    sort_level_desc: '⚡ Seviye (En Yüksek)',
    sort_level_asc: '⚡ Seviye (En Düşük)',
    sort_riot_id: '🔤 Riot ID (A-Z)',
    clear_filters: 'Tüm Filtreleri Temizle',
    reset_filters: 'Filtreleri Sıfırla',
    accounts_showing: 'hesap gösteriliyor',
    filtered_from: 'toplam {total} hesaptan filtrelendi',
    never: 'Hiç',
    th_account: 'HESAP / RIOT ID',
    th_region: 'BÖLGE',
    th_level: 'SEVİYE',
    th_rank: 'DERECELİ LİG',
    th_status: 'DURUM',
    th_last_match: 'SON MAÇ',
    th_last_checked: 'SON KONTROL',
    th_actions: 'İŞLEMLER',
    no_accounts_found: 'Hesap bulunamadı.',
    no_accounts_desc: 'Filtrelerinizi değiştirin veya yeni bir hesap ekleyin.',
    sync_btn: 'Senkronize Et',
    detail_btn: 'Detay',
    delete_btn: 'Sil',
    delete_confirm: 'Bu hesabı silmek istediğinize emin misiniz?',

    // Add Account Modal / Form
    modal_add_title: 'Yeni Hesap Ekle',
    modal_add_desc: 'Riot ID ile hesabınızı sisteme bağlayın ve otomatik senkronize edin.',
    label_riot_id: 'Riot ID',
    placeholder_riot_id: 'GameName#TAG (Örn: Hide on bush#KR1)',
    label_region: 'Bölge',
    label_username: 'Kullanıcı Adı / Not (İsteğe Bağlı)',
    placeholder_username: 'Kişisel notunuz veya istemci adı',
    cancel: 'İptal',
    save: 'Kaydet',
    adding: 'Ekleniyor...',

    // Detail Page
    back_to_dashboard: '← Panele Dön',
    summoner_info: 'Sihirdar Bilgileri',
    rank_overview: 'Dereceli Durumu',
    solo_duo: 'Tekli / Çift Dereceli',
    flex: 'Esnek Dereceli',
    unranked: 'Derecesiz',
    match_history: 'Son Maç Geçmişi',
    no_matches: 'Kayıtlı maç bulunamadı.',
    victory: 'Zafer',
    defeat: 'Bozgun',
    kills: 'Katletme',
    deaths: 'Ölüm',
    assists: 'Asist',
    cs: 'Minyon',
    kda: 'KDA',
    duration: 'Süre',
    game_mode: 'Oyun Modu',
    status_select_label: 'Hesap Durumunu Güncelle',
    status_updated: 'Durum güncellendi.',

    // Onboarding & API Key Modal
    onboarding_welcome_title: 'MyLoL\'e Hoş Geldiniz!',
    onboarding_welcome_desc: 'Tüm League of Legends ikincil ve smurf hesaplarınızı tek bir güvenli masaüstü panelinden yönetin.',
    onboarding_feature_1_title: '🛡️ Gerçek Zamanlı Hesap Takibi',
    onboarding_feature_1_desc: 'Seviye, Solo/Duo & Esnek ligleri, LP ve son oynanan maçları Riot Games API ile doğrudan senkronize eder.',
    onboarding_feature_2_title: '⚡ Hızlı Durum Yönetimi & Ban Kontrolü',
    onboarding_feature_2_desc: 'Hesaplarınızı Mevcut, Aktif, Seviye veya Arşivlendi olarak etiketleyin; olası kısıtlamaları ve ban durumlarını anında fark edin.',
    onboarding_feature_3_title: '🔒 %100 Güvenli & Yerel',
    onboarding_feature_3_desc: 'Hesap şifreleriniz istenmez. Tüm veriler yalnızca kendi bilgisayarınızdaki yerel veritabanında saklanır.',
    onboarding_api_step_title: 'Riot API Anahtarı Kurulumu',
    onboarding_api_step_desc: 'Verileri canlı çekebilmek için ücretsiz bir Riot Developer API anahtarına ihtiyacınız var (24 saatte bir yenilenir).',
    onboarding_how_to_get: 'Nasıl API Anahtarı Alınır?',
    onboarding_step_1: '1. developer.riotgames.com adresine gidin.',
    onboarding_step_2: '2. League of Legends (Riot) hesabınızla giriş yapın.',
    onboarding_step_3: '3. Ana sayfadaki "DEVELOPMENT API KEY" kutucuğundaki anahtarı kopyalayıp buraya yapıştırın.',
    onboarding_api_input_label: 'Riot API Anahtarınız (RGAPI-...)',
    onboarding_test_save_btn: 'Anahtarı Test Et & Kaydet',
    onboarding_testing: 'Test ediliyor...',
    onboarding_valid_key: '✓ API Anahtarı Geçerli ve Bağlandı!',
    onboarding_invalid_key: '✕ Hata: API Anahtarı geçersiz veya süresi dolmuş! Lütfen yeni bir anahtar alıp deneyin.',
    onboarding_close_btn: 'Kullanmaya Başla',
  },
  en: {
    // Navbar
    client_badge: 'Desktop Client',
    dashboard: 'Dashboard',
    db_active: 'Local Database Active',
    settings_btn: 'API Key & Settings',

    // Dashboard Header
    riot_client_manager: '⚔️ Riot Client Manager',
    dashboard_title_1: 'Personal Account',
    dashboard_title_2: 'Dashboard',
    dashboard_subtitle: 'Real-time level, rank, and activity synchronization via Riot API',

    // Stats Cards
    stat_total: 'Total',
    stat_available: 'Available',
    stat_archived: 'Archived',
    stat_active: 'Active',
    stat_level: 'Level',
    stat_banned: 'Banned',
    all_selected: '● All Selected',
    filtering: '✓ Filtering',
    filter_action: 'Filter',

    // Statuses
    status_available: 'Available',
    status_archived: 'Archived',
    status_active: 'Active',
    status_level: 'Leveling',
    status_error_checking: 'Banned',

    // Action Bar & Filters
    search_placeholder: 'Search Riot ID (e.g. Faker#KR1) or account...',
    tag_all: 'All',
    add_account_btn: 'Add New Account',
    sync_all_btn: 'Sync All Accounts',
    syncing_status: 'Syncing...',

    // Table Columns & UI
    all_regions: 'All Regions',
    sort_by: 'Sort by:',
    sort_last_checked: '🕒 Last Checked (Recent)',
    sort_level_desc: '⚡ Level (Highest)',
    sort_level_asc: '⚡ Level (Lowest)',
    sort_riot_id: '🔤 Riot ID (A-Z)',
    clear_filters: 'Clear All Filters',
    reset_filters: 'Reset Filters',
    accounts_showing: 'accounts showing',
    filtered_from: 'filtered from {total} accounts',
    never: 'Never',
    th_account: 'ACCOUNT / RIOT ID',
    th_region: 'REGION',
    th_level: 'LEVEL',
    th_rank: 'TIER & RANK',
    th_status: 'STATUS',
    th_last_match: 'LAST MATCH',
    th_last_checked: 'LAST CHECKED',
    th_actions: 'ACTIONS',
    no_accounts_found: 'No accounts found.',
    no_accounts_desc: 'Try adjusting your filters or add a new account.',
    sync_btn: 'Sync',
    detail_btn: 'Details',
    delete_btn: 'Delete',
    delete_confirm: 'Are you sure you want to delete this account?',

    // Add Account Modal / Form
    modal_add_title: 'Add New Account',
    modal_add_desc: 'Connect your account via Riot ID to automatically sync stats.',
    label_riot_id: 'Riot ID',
    placeholder_riot_id: 'GameName#TAG (e.g. Hide on bush#KR1)',
    label_region: 'Region',
    label_username: 'Username / Note (Optional)',
    placeholder_username: 'Personal note or client login name',
    cancel: 'Cancel',
    save: 'Save Account',
    adding: 'Adding...',

    // Detail Page
    back_to_dashboard: '← Back to Dashboard',
    summoner_info: 'Summoner Overview',
    rank_overview: 'Ranked Performance',
    solo_duo: 'Ranked Solo / Duo',
    flex: 'Ranked Flex',
    unranked: 'Unranked',
    match_history: 'Recent Match History',
    no_matches: 'No match history recorded.',
    victory: 'Victory',
    defeat: 'Defeat',
    kills: 'Kills',
    deaths: 'Deaths',
    assists: 'Assists',
    cs: 'CS',
    kda: 'KDA',
    duration: 'Duration',
    game_mode: 'Game Mode',
    status_select_label: 'Update Account Status',
    status_updated: 'Status updated.',

    // Onboarding & API Key Modal
    onboarding_welcome_title: 'Welcome to MyLoL!',
    onboarding_welcome_desc: 'Track, organize, and sync your League of Legends alternate and smurf accounts in one sleek desktop dashboard.',
    onboarding_feature_1_title: '🛡️ Real-Time Account Tracking',
    onboarding_feature_1_desc: 'Instantly syncs Summoner Level, Solo/Duo & Flex ranks, LP, and recent matches directly from Riot Games API.',
    onboarding_feature_2_title: '⚡ Fast Status Management & Ban Detection',
    onboarding_feature_2_desc: 'Tag your accounts as Available, Active, Leveling, or Archived; easily spot possible restrictions and bans.',
    onboarding_feature_3_title: '🔒 100% Private & Local',
    onboarding_feature_3_desc: 'No account passwords required. All data is kept strictly inside your local database on your own machine.',
    onboarding_api_step_title: 'Riot API Key Setup',
    onboarding_api_step_desc: 'To fetch live data, you need a free personal Riot Developer API key (expires every 24 hours).',
    onboarding_how_to_get: 'How to get an API Key?',
    onboarding_step_1: '1. Navigate to developer.riotgames.com',
    onboarding_step_2: '2. Sign in with your Riot Games / League of Legends account.',
    onboarding_step_3: '3. Copy the "DEVELOPMENT API KEY" on your dashboard and paste it here.',
    onboarding_api_input_label: 'Your Riot API Key (RGAPI-...)',
    onboarding_test_save_btn: 'Test Connection & Save',
    onboarding_testing: 'Testing Key...',
    onboarding_valid_key: '✓ API Key is Valid and Connected!',
    onboarding_invalid_key: '✕ Error: API Key is invalid or has expired! Please get a new key and retry.',
    onboarding_close_btn: 'Get Started',
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;
