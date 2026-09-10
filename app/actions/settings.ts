'use server';

/**
 * Dinamik Sistem Ayarları ve Riot API Anahtarı Server Actions.
 *
 * API anahtarını doğrudan veritabanında saklar, doğrular ve çalışma zamanında
 * dinamik olarak günceller. .env dosyasından çekilmez veya oraya yazılmaz.
 *
 * @module app/actions/settings
 */

import dbConnect from '@/lib/db/mongoose';
import Setting from '@/models/Setting';

export interface ApiKeyStatus {
  hasKey: boolean;
  maskedKey: string;
  source: 'database' | 'none';
  updatedAt?: Date;
}

/**
 * Aktif Riot API anahtarını sadece veritabanından döner.
 * .env dosyasından kesinlikle okunmaz.
 */
export async function getActiveApiKey(): Promise<string> {
  try {
    await dbConnect();
    const doc = await Setting.findOne({ key: 'RIOT_API_KEY' }).lean<{ value: string } | null>();
    if (doc?.value && doc.value.trim().startsWith('RGAPI-')) {
      return doc.value.trim();
    }
  } catch (err) {
    console.error('[Settings] API Key veritabanından okunamadı:', err);
  }

  return '';
}

/**
 * Mevcut API Key durumunu döner (Yalnızca veritabanı kontrol edilir).
 */
export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
  try {
    await dbConnect();
    const doc = await Setting.findOne({ key: 'RIOT_API_KEY' }).lean<{ value: string; updatedAt: Date } | null>();

    if (doc?.value && doc.value.trim().length > 5) {
      const val = doc.value.trim();
      const masked = `${val.slice(0, 9)}...${val.slice(-4)}`;
      return {
        hasKey: true,
        maskedKey: masked,
        source: 'database',
        updatedAt: doc.updatedAt,
      };
    }
  } catch (err) {
    console.error('[Settings] API Key durumu alınamadı:', err);
  }

  return {
    hasKey: false,
    maskedKey: '',
    source: 'none',
  };
}

/**
 * Verilen Riot API anahtarını doğrudan Riot Games sunucusuna test isteği göndererek doğrular.
 */
export async function verifyApiKey(keyToTest: string): Promise<{ valid: boolean; error?: string }> {
  const cleanKey = keyToTest.trim();

  if (!cleanKey.startsWith('RGAPI-')) {
    return {
      valid: false,
      error: 'API anahtarı "RGAPI-" ile başlamalıdır.',
    };
  }

  try {
    // Riot Games platform status endpoint'i ile hızlı ve hafif doğrulama
    const res = await fetch('https://tr1.api.riotgames.com/lol/status/v4/platform-data', {
      headers: {
        'X-Riot-Token': cleanKey,
      },
      cache: 'no-store',
    });

    if (res.status === 200) {
      return { valid: true };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        valid: false,
        error: 'API Anahtarı geçersiz veya 24 saatlik süresi dolmuş! (HTTP ' + res.status + ')',
      };
    }

    return {
      valid: false,
      error: `Riot API yanıt vermedi (HTTP ${res.status})`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bağlantı hatası.';
    return {
      valid: false,
      error: `Bağlantı kurulamadı: ${message}`,
    };
  }
}

/**
 * Yeni Riot API anahtarını sadece veritabanına kaydeder.
 * .env dosyasına dokunulmaz.
 */
export async function saveApiKey(newKey: string): Promise<{ success: boolean; error?: string }> {
  const cleanKey = newKey.trim();

  if (!cleanKey.startsWith('RGAPI-')) {
    return {
      success: false,
      error: 'Geçerli bir Riot API anahtarı giriniz (RGAPI- ile başlamalıdır).',
    };
  }

  // 1. Önce anahtarı test et
  const verification = await verifyApiKey(cleanKey);
  if (!verification.valid) {
    return {
      success: false,
      error: verification.error || 'API anahtarı doğrulanamadı.',
    };
  }

  try {
    // 2. Sadece veritabanına kaydet
    await dbConnect();
    await Setting.findOneAndUpdate(
      { key: 'RIOT_API_KEY' },
      { value: cleanKey },
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Veritabanına kaydedilemedi.';
    return {
      success: false,
      error: message,
    };
  }
}
