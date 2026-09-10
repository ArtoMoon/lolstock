'use server';

/**
 * Hesap yönetimi Server Actions.
 *
 * Tüm veritabanı işlemleri sunucu tarafında gerçekleşir.
 * RIOT_API_KEY ve MONGODB_URI asla istemciye sızdırılmaz.
 *
 * @module app/actions/accounts
 */

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db/mongoose';
import Account, { AccountStatus, IAccount } from '@/models/Account';
import { getPuuidByRiotId } from '@/lib/riot/account';
import { parseRiotId, sanitizeRiotId } from '@/lib/riot/utils';

/** Serializable hesap nesnesi (Mongoose Document olmayan) */
export type AccountData = IAccount & { _id: string };

/** Filtre seçenekleri */
export interface AccountFilters {
  status?: AccountStatus;
  search?: string;
}

/**
 * Tüm hesapları veritabanından çeker, isteğe bağlı olarak filtreler.
 *
 * @param {AccountFilters} [filters] - Durum ve arama filtresi
 * @returns {Promise<AccountData[]>} Hesap listesi (en son eklenen önce)
 *
 * @example
 * const accounts = await getAccounts({ status: 'available' });
 */
export async function getAccounts(
  filters?: AccountFilters
): Promise<AccountData[]> {
  await dbConnect();

  const query: Record<string, unknown> = {};

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.search) {
    query.$or = [
      { riotId: { $regex: filters.search, $options: 'i' } },
      { username: { $regex: filters.search, $options: 'i' } },
      { summonerName: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const accounts = await Account.find(query)
    .sort({ createdAt: -1 })
    .lean<IAccount[]>();

  return accounts.map((a) => ({
    ...a,
    _id: String((a as IAccount & { _id: unknown })._id),
    username: a.username ?? '',
    lastCheckedAt: a.lastCheckedAt ? new Date(a.lastCheckedAt) : new Date(0),
    createdAt: a.createdAt ? new Date(a.createdAt) : new Date(0),
    updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(0),
  })) as AccountData[];
}

/**
 * Yeni bir hesap ekler. PUUID yoksa Riot Account v1'den çeker.
 *
 * Süreç:
 *  1. riotId ayrıştır → gameName + tagLine
 *  2. PUUID Riot API'den çek (account-v1, 1 req)
 *  3. MongoDB'ye kaydet (status: available)
 *  4. Dashboard önbelleğini geçersiz kıl
 *
 * Rate-limit ağırlığı: 1 istek (account-v1)
 * DB Mutasyonu: accounts koleksiyonuna yeni belge ekler
 *
 * @param {string} riotId - "GameName#TAG" formatında Riot ID
 * @param {string} [platform] - Riot platform bölgesi (ör: "TR1", "EUW1"). Varsayılan: "TR1"
 * @param {string} [username] - İstemci giriş kullanıcı adı (isteğe bağlı)
 * @returns {Promise<{ success: boolean; error?: string; account?: AccountData }>}
 *
 * @example
 * const result = await addAccount('Faker#KR1', 'KR', 'my_login_username');
 */
export async function addAccount(
  riotId: string,
  platform = 'TR1',
  username?: string
): Promise<{
  success: boolean;
  error?: string;
  account?: AccountData;
}> {
  try {
    await dbConnect();

    // Format doğrulama ve görünmez karakter temizleme
    const { gameName, tagLine } = parseRiotId(riotId);
    const normalizedRiotId = `${gameName}#${tagLine}`;
    const cleanUsername = username ? sanitizeRiotId(username) : '';

    // Duplicate kontrolü
    const existing = await Account.findOne({
      riotId: { $regex: new RegExp(`^${normalizedRiotId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    }).lean();
    if (existing) {
      return { success: false, error: `Bu hesap (${normalizedRiotId}) zaten kayıtlı.` };
    }

    // PUUID çek (account-v1)
    const puuid = await getPuuidByRiotId(gameName, tagLine, platform as import('@/lib/riot/client').RiotPlatform);

    // Kaydet
    const account = await Account.create({
      riotId: normalizedRiotId,
      username: cleanUsername,
      puuid,
      summonerName: gameName,
      platform: platform.toUpperCase(),
      status: 'available',
    });

    revalidatePath('/');

    return {
      success: true,
      account: {
        ...(account.toObject() as IAccount),
        _id: String(account._id),
      } as AccountData,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';
    return { success: false, error: message };
  }
}

/**
 * Hesabın giriş kullanıcı adı bilgisini günceller.
 *
 * @param {string} id - MongoDB ObjectId (string)
 * @param {string} username - Yeni kullanıcı adı
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function updateAccountUsername(
  id: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    const cleanUsername = sanitizeRiotId(username);

    await Account.findByIdAndUpdate(id, { username: cleanUsername });

    revalidatePath(`/accounts/${id}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';
    return { success: false, error: message };
  }
}

/**
 * Hesabı veritabanından siler.
 *
 * DB Mutasyonu: accounts koleksiyonundan _id'ye göre belgeyi siler.
 *
 * @param {string} id - MongoDB ObjectId (string)
 * @returns {Promise<{ success: boolean; error?: string }>}
 *
 * @example
 * await deleteAccount('64abc123...');
 */
export async function deleteAccount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    const result = await Account.findByIdAndDelete(id);

    if (!result) {
      return { success: false, error: 'Hesap bulunamadı.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';
    return { success: false, error: message };
  }
}

/**
 * Hesabın not alanını günceller.
 *
 * DB Mutasyonu: accounts._id'ye karşılık gelen belgenin `notes` alanını günceller.
 *
 * @param {string} id - MongoDB ObjectId (string)
 * @param {string} notes - Yeni not metni (max 500 karakter)
 * @returns {Promise<{ success: boolean; error?: string }>}
 *
 * @example
 * await updateAccountNotes('64abc123...', 'Satışa hazır, iletişim: @user');
 */
export async function updateAccountNotes(
  id: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    await Account.findByIdAndUpdate(id, { notes }, { runValidators: true });

    revalidatePath(`/accounts/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';
    return { success: false, error: message };
  }
}

/**
 * Hesap durumunu manuel olarak günceller.
 *
 * DB Mutasyonu: accounts._id'ye karşılık gelen belgenin `status` alanını günceller.
 *
 * @param {string} id - MongoDB ObjectId (string)
 * @param {AccountStatus} status - Yeni durum
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function updateAccountStatus(
  id: string,
  status: AccountStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();

    await Account.findByIdAndUpdate(id, { status });

    revalidatePath('/');
    revalidatePath(`/accounts/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';
    return { success: false, error: message };
  }
}

/**
 * Hesabın sunucu / platform bölgesini günceller.
 *
 * @param {string} id - MongoDB ObjectId (string)
 * @param {string} platform - Yeni platform kodu (ör: "TR1", "EUW1")
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function updateAccountPlatform(
  id: string,
  platform: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    const cleanPlatform = platform.trim().toUpperCase();

    await Account.findByIdAndUpdate(id, { platform: cleanPlatform });

    revalidatePath('/');
    revalidatePath(`/accounts/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata.';
    return { success: false, error: message };
  }
}

