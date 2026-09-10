'use server';

/**
 * Dinamik Sistem Ayarları ve Riot API Anahtarı Server Actions.
 *
 * API anahtarını veritabanında saklar, doğrular ve çalışma zamanında
 * dinamik olarak günceller.
 *
 * @module app/actions/settings
 */

import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db/mongoose';
import Setting from '@/models/Setting';

const ENV_LOCAL_PATH = path.join(process.cwd(), '.env.local');

export interface ApiKeyStatus {
  hasKey: boolean;
  maskedKey: string;
  source: 'database' | 'environment' | 'none';
  updatedAt?: Date;
}

/**
 * Aktif Riot API anahtarını döner (Dahili kullanım).
 */
export async function getActiveApiKey(): Promise<string> {
  try {
    await dbConnect();
    const doc = await Setting.findOne({ key: 'RIOT_API_KEY' }).lean<{ value: string } | null>();
    if (doc?.value && doc.value.trim().startsWith('RGAPI-')) {
      return doc.value.trim();
    }
  } catch (err) {
    console.warn('[Settings] DB API Key okunamadı, environment fallback kullanılıyor:', err);
  }

  return (process.env.RIOT_API_KEY ?? '').trim();
}

/**
 * Mevcut API Key durumunu döner.
 */
export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
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

  const envKey = (process.env.RIOT_API_KEY ?? '').trim();
  if (envKey.length > 5) {
    const masked = `${envKey.slice(0, 9)}...${envKey.slice(-4)}`;
    return {
      hasKey: true,
      maskedKey: masked,
      source: 'environment',
    };
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
 * Yeni Riot API anahtarını veritabanına, runtime belleğe ve .env.local dosyasına kaydeder.
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
    // 2. Veritabanına kaydet
    await dbConnect();
    await Setting.findOneAndUpdate(
      { key: 'RIOT_API_KEY' },
      { value: cleanKey },
      { upsert: true, new: true }
    );

    // 3. Çalışma zamanı değişkenine aktar
    process.env.RIOT_API_KEY = cleanKey;

    // 4. Varsa .env.local dosyasını güncelle
    if (fs.existsSync(ENV_LOCAL_PATH)) {
      try {
        let content = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
        if (content.includes('RIOT_API_KEY=')) {
          content = content.replace(/RIOT_API_KEY=.*/g, `RIOT_API_KEY=${cleanKey}`);
        } else {
          content += `\nRIOT_API_KEY=${cleanKey}\n`;
        }
        fs.writeFileSync(ENV_LOCAL_PATH, content, 'utf8');
      } catch (e) {
        console.warn('[Settings] .env.local güncellenemedi:', e);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Veritabanına kaydedilemedi.';
    return {
      success: false,
      error: message,
    };
  }
}
