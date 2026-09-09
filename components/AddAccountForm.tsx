'use client';

import { useState, useTransition } from 'react';
import { addAccount } from '@/app/actions/accounts';
import { sanitizeRiotId } from '@/lib/riot/utils';

const PLATFORMS = [
  { value: 'TR1',  label: '🇹🇷 TR (Türkiye)' },
  { value: 'EUW1', label: '🇪🇺 West (Batı Avrupa)' },
  { value: 'EUN1', label: '🇪🇺 EUNE (Doğu Avrupa)' },
  { value: 'NA1',  label: '🇺🇸 NA (Kuzey Amerika)' },
  { value: 'KR',   label: '🇰🇷 KR (Kore)' },
  { value: 'BR1',  label: '🇧🇷 BR (Brezilya)' },
  { value: 'RU',   label: '🇷🇺 RU (Rusya)' },
];

/**
 * Yeni hesap ekleme formu.
 *
 * "GameName#TAG" formatında Riot ID ve bölge seçimi alır.
 * Server Action üzerinden PUUID çeker ve MongoDB'ye kaydeder.
 */
export default function AddAccountForm() {
  const [riotId, setRiotId] = useState('');
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('TR1');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const cleaned = sanitizeRiotId(riotId);
    const cleanedUsername = sanitizeRiotId(username);
    if (!cleaned.includes('#')) {
      setMessage({ type: 'error', text: 'Format: "GameName#TAG"' });
      return;
    }

    startTransition(async () => {
      const result = await addAccount(cleaned, platform, cleanedUsername);
      if (result.success) {
        const displayName = result.account?.riotId ?? cleaned;
        const extra = cleanedUsername ? ` (Kullanıcı Adı: ${cleanedUsername})` : '';
        setMessage({
          type: 'success',
          text: `✅ "${displayName}"${extra} (${platform}) başarıyla eklendi!`,
        });
        setRiotId('');
        setUsername('');
      } else {
        setMessage({ type: 'error', text: `❌ ${result.error}` });
      }
    });
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Bölge seçici */}
        <select
          id="add-platform"
          className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-lg px-4 py-2.5 text-[#e8f0fe] font-sans text-sm font-semibold outline-none cursor-pointer transition-colors focus:border-blue-400 whitespace-nowrap"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          disabled={isPending}
          aria-label="Sunucu bölgesi seç"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value} className="bg-[#0f1923] text-[#e8f0fe]">
              {p.label}
            </option>
          ))}
        </select>

        {/* Riot ID girişi */}
        <input
          id="add-riot-id"
          type="text"
          className="flex-1 min-w-[200px] bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-lg px-4 py-2.5 text-[#e8f0fe] font-sans text-sm outline-none transition-all focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(61,155,233,0.12)] placeholder:text-slate-500"
          placeholder="Riot ID (Örn: Faker#KR1) *"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          disabled={isPending}
          required
          aria-label="Riot ID gir"
        />

        {/* Kullanıcı Adı (İstemci Giriş Adı) */}
        <input
          id="add-username"
          type="text"
          className="flex-1 sm:max-w-[210px] bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-lg px-4 py-2.5 text-[#e8f0fe] font-sans text-sm outline-none transition-all focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(61,155,233,0.12)] placeholder:text-slate-500"
          placeholder="Kullanıcı Adı (opsiyonel)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isPending}
          aria-label="Kullanıcı adı gir"
        />

        <button
          type="submit"
          id="add-account-btn"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg font-sans text-sm font-semibold cursor-pointer border-none transition-all whitespace-nowrap bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#050e18] shadow-[0_2px_12px_rgba(200,168,75,0.3)] hover:from-yellow-300 hover:to-yellow-500 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending || !riotId.trim()}
        >
          {isPending ? '⏳ Ekleniyor...' : '➕ Ekle'}
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-sm px-4 py-2.5 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
