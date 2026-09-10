'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AccountData } from '@/app/actions/accounts';
import { updateAccountNotes, updateAccountUsername, updateAccountStatus, updateAccountPlatform } from '@/app/actions/accounts';
import type { AccountStatus } from '@/models/Account';
import { syncAccount, syncMatchHistory } from '@/app/actions/accountSync';
import StatusBadge from '@/components/StatusBadge';
import RankBadge from '@/components/RankBadge';
import PlatformBadge from '@/components/PlatformBadge';
import RiotIdDisplay from '@/components/RiotIdDisplay';
import { ddragon } from '@/lib/riot/ddragon';
import Image from 'next/image';

interface AccountDetailClientProps {
  account: AccountData;
}

function calculateWinRate(wins: number, losses: number) {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export default function AccountDetailClient({
  account: initialAccount
}: AccountDetailClientProps) {
  const router = useRouter();
  const [account, setAccount] = useState<AccountData>(initialAccount);
  const [notes, setNotes] = useState(initialAccount.notes ?? '');
  const [username, setUsername] = useState(initialAccount.username ?? '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isUsernameRevealed, setIsUsernameRevealed] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isSyncingMatches, startMatchSync] = useTransition();
  
  const [checkMsg, setCheckMsg] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [matchSyncMsg, setMatchSyncMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [platformMsg, setPlatformMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialAccount) {
      setAccount((prev) => ({
        ...prev,
        ...initialAccount,
        matches: (initialAccount.matches && initialAccount.matches.length > 0) ? initialAccount.matches : prev.matches,
        ranks: (initialAccount.ranks?.solo || initialAccount.ranks?.flex) ? initialAccount.ranks : prev.ranks,
      }));
      setNotes(initialAccount.notes ?? '');
      setUsername(initialAccount.username ?? '');
    }
  }, [initialAccount]);

  // Veritabanından gelen önbelleğe alınmış Riot verileri
  const ranks = account.ranks || { solo: null, flex: null };
  const matches = account.matches || [];
  const profileIconId = account.profileIconId || 1;

  // League of Graphs linki oluştur
  const [logGameName, logTagLine] = account.riotId.split('#');
  const platform = (account.platform || 'TR1').toUpperCase();
  // League of Graphs region kodu (platform → url segment)
  const LOG_REGION: Record<string, string> = {
    TR1: 'tr', EUW1: 'euw', EUN1: 'eune', NA1: 'na1', KR: 'kr',
    BR1: 'br1', LA1: 'lan', LA2: 'las', OC1: 'oce', JP1: 'jp', RU: 'ru',
  };
  const logRegion = LOG_REGION[platform] || platform.toLowerCase();
  const leagueOfGraphsUrl = logGameName && logTagLine
    ? `https://www.leagueofgraphs.com/summoner/${logRegion}/${encodeURIComponent(logGameName)}-${encodeURIComponent(logTagLine)}`
    : null;

  function handleStatusChange(newStatus: AccountStatus) {
    const oldStatus = account.status;
    setAccount((prev) => ({ ...prev, status: newStatus }));
    setStatusMsg(null);
    startTransition(async () => {
      const res = await updateAccountStatus(account._id, newStatus);
      if (res.success) {
        setStatusMsg('✅ Durum güncellendi');
        setTimeout(() => setStatusMsg(null), 3000);
        router.refresh();
      } else {
        setAccount((prev) => ({ ...prev, status: oldStatus }));
        setStatusMsg('❌ Hata: ' + (res.error || 'Güncellenemedi'));
      }
    });
  }

  function handlePlatformChange(newPlatform: string) {
    const oldPlatform = account.platform;
    setAccount((prev) => ({ ...prev, platform: newPlatform }));
    setPlatformMsg(null);
    startTransition(async () => {
      const res = await updateAccountPlatform(account._id, newPlatform);
      if (res.success) {
        setPlatformMsg(`✅ Sunucu güncellendi. Yeni verileri çekmek için 'Tam Senkronizasyon' yapabilirsiniz.`);
        setTimeout(() => setPlatformMsg(null), 6000);
        router.refresh();
      } else {
        setAccount((prev) => ({ ...prev, platform: oldPlatform }));
        setPlatformMsg('❌ Hata: ' + (res.error || 'Güncellenemedi'));
      }
    });
  }

  function handleSaveNotes() {
    setSaveMsg(null);
    startTransition(async () => {
      const result = await updateAccountNotes(account._id, notes);
      setSaveMsg(result.success ? '✅ Not kaydedildi.' : `❌ ${result.error}`);
    });
  }

  function handleSaveUsername() {
    startTransition(async () => {
      const result = await updateAccountUsername(account._id, username);
      if (result.success) {
        setAccount((prev) => ({ ...prev, username }));
        setIsEditingUsername(false);
      }
    });
  }

  function copyUsername() {
    if (!account.username) return;
    navigator.clipboard.writeText(account.username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  }

  function handleCheck() {
    setCheckMsg(null);
    startTransition(async () => {
      try {
        const result = await syncAccount(account._id);
        if (result.success) {
          if (result.updatedAccount) {
            setAccount((prev) => ({
              ...prev,
              ...result.updatedAccount,
            }));
          }
          const matchCount = result.updatedAccount?.matches?.length ?? 0;
          if (matchCount === 0) {
            setCheckMsg(
              result.statusChanged
                ? `Durum güncellendi → ${result.newStatus}. ℹ️ Oynanmış maç bulunamadı.`
                : 'Seviye ve rank güncellendi. ℹ️ Bu hesapta oynanmış maç bulunamadı.'
            );
          } else {
            setCheckMsg(
              result.statusChanged
                ? `Durum güncellendi → ${result.newStatus} (Son ${matchCount} maç çekildi)`
                : `✅ Tüm veriler ve son ${matchCount} maç başarıyla güncellendi.`
            );
          }
          router.refresh();
          setTimeout(() => setCheckMsg(null), 5000);
        } else {
          setCheckMsg(`Hata: ${result.error}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata.';
        setCheckMsg(`Hata: ${msg}`);
      }
    });
  }

  function handleSyncMatches() {
    setMatchSyncMsg(null);
    startMatchSync(async () => {
      try {
        const result = await syncMatchHistory(account._id);
        if (result.success) {
          if (result.updatedAccount) {
            setAccount((prev) => ({
              ...prev,
              ...result.updatedAccount,
            }));
          }
          const matchCount = result.updatedAccount?.matches?.length ?? 0;
          if (matchCount === 0) {
            setMatchSyncMsg('ℹ️ Bu hesapta Riot API üzerinde oynanmış maç bulunamadı (0 maç).');
          } else {
            setMatchSyncMsg(`✅ Son ${matchCount} maç ve rank bilgileri başarıyla güncellendi!`);
          }
          router.refresh();
          setTimeout(() => setMatchSyncMsg(null), 5000);
        } else {
          setMatchSyncMsg(`❌ Hata: ${result.error}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata.';
        setMatchSyncMsg(`❌ Hata: ${msg}`);
      }
    });
  }

  const lastChecked = account.lastCheckedAt
    ? new Date(account.lastCheckedAt).toLocaleString('tr-TR')
    : 'Hiç kontrol edilmedi';

  const createdAt = account.createdAt
    ? new Date(account.createdAt).toLocaleDateString('tr-TR')
    : '–';

  // Son X Maç Özeti
  const wins = matches.filter(m => m.win).length;
  const recentWinRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
  const avgKills = matches.length > 0 ? (matches.reduce((a, b) => a + b.kills, 0) / matches.length).toFixed(1) : 0;
  const avgDeaths = matches.length > 0 ? (matches.reduce((a, b) => a + b.deaths, 0) / matches.length).toFixed(1) : 0;
  const avgAssists = matches.length > 0 ? (matches.reduce((a, b) => a + b.assists, 0) / matches.length).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SOL SÜTUN (Profil, Ranklar, Notlar) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Profil Kartı */}
        <div className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
          <div className="h-24 bg-gradient-to-r from-blue-900 to-slate-900" />
          <div className="px-6 pb-6 relative flex flex-col">
            <div className="flex justify-between items-start -mt-12 mb-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-[#0e192d] overflow-hidden bg-slate-800 relative shadow-xl shrink-0">
                <Image 
                  src={ddragon.profileIcon(profileIconId)} 
                  alt="Profile Icon" 
                  width={96} height={96}
                  unoptimized
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center text-xs font-bold text-white py-0.5">
                  {account.level}
                </div>
              </div>
              <div className="mt-14 shrink-0 flex items-center gap-2">
                <PlatformBadge platform={account.platform} />
                <StatusBadge status={account.status} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <RiotIdDisplay
                  riotId={account.riotId}
                  textClassName="text-2xl font-extrabold text-white tracking-tight"
                  tagClassName="text-sm font-mono text-amber-300/90 bg-amber-400/10 border-amber-400/20"
                />
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <p className="text-xs text-slate-400">Eklendi: {createdAt}</p>
                {/* League of Graphs Dış Linki */}
                {leagueOfGraphsUrl && (
                  <a
                    href={leagueOfGraphsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#1a6b3c]/15 text-emerald-300 border border-emerald-500/25 hover:bg-[#1a6b3c]/30 hover:border-emerald-400/50 transition-all group cursor-pointer"
                    title="League of Graphs'ta profili görüntüle"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <span>League of Graphs</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Kullanıcı Adı (Giriş) */}
            <div className="mt-4 p-3 bg-black/30 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block">
                    Giriş Kullanıcı Adı
                  </span>
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Kullanıcı adı gir"
                        className="bg-[#0f1923] border border-blue-500/40 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none w-full focus:border-blue-400"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveUsername}
                        disabled={isPending}
                        className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 text-xs rounded-lg font-semibold cursor-pointer"
                        title="Kaydet"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setUsername(account.username ?? '');
                          setIsEditingUsername(false);
                        }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-lg cursor-pointer"
                        title="İptal"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {account.username ? (
                        <>
                          {isUsernameRevealed ? (
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => setIsUsernameRevealed(false)}
                                className="text-sm font-mono font-bold text-amber-300 truncate cursor-pointer hover:opacity-80"
                                title="Gizlemek için tıkla"
                              >
                                {account.username}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsUsernameRevealed(false)}
                                className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer text-xs"
                                title="Gizle"
                              >
                                🙈
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsUsernameRevealed(true)}
                              className="group flex items-center gap-2 cursor-pointer text-left bg-transparent border-none p-0"
                              title="Kullanıcı adını görmek için tıkla"
                            >
                              <span className="text-sm font-mono tracking-widest text-slate-400 group-hover:text-amber-300 transition-colors">
                                ••••••••
                              </span>
                              <span className="text-[0.7rem] text-slate-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                👁️ Göster
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={copyUsername}
                            className="text-xs text-slate-400 hover:text-amber-300 transition-colors p-0.5 cursor-pointer"
                            title="Kullanıcı Adını Kopyala"
                          >
                            {copiedUser ? '✅' : '📋'}
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-500 text-xs font-sans italic">Belirtilmedi</span>
                      )}
                    </div>
                  )}
                </div>
                {!isEditingUsername && (
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Kullanıcı adını düzenle"
                  >
                    ✏️ Düzenle
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-sm flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Hesap Durumu:</span>
                <select
                  className="bg-[#0f1923] border border-blue-500/30 hover:border-blue-400 rounded-lg px-2.5 py-1 text-xs text-[#e8f0fe] cursor-pointer outline-none transition-colors font-medium"
                  value={account.status}
                  onChange={(e) => handleStatusChange(e.target.value as AccountStatus)}
                  disabled={isPending}
                >
                  <option value="available" className="bg-[#0f1923]">✅ Mevcut</option>
                  <option value="archived" className="bg-[#0f1923]">📁 Arşivlendi</option>
                  <option value="active" className="bg-[#0f1923]">🎮 Aktif</option>
                  <option value="level" className="bg-[#0f1923]">⚡ Level</option>
                  <option value="error_checking" className="bg-[#0f1923]">🚫 Ban</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Sunucu / Bölge:</span>
                <select
                  className="bg-[#0f1923] border border-blue-500/30 hover:border-blue-400 rounded-lg px-2.5 py-1 text-xs text-[#e8f0fe] cursor-pointer outline-none transition-colors font-medium"
                  value={(account.platform || 'TR1').toUpperCase()}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  disabled={isPending}
                >
                  <option value="TR1" className="bg-[#0f1923]">🇹🇷 TR (Türkiye)</option>
                  <option value="EUW1" className="bg-[#0f1923]">🇪🇺 West (Batı Avrupa)</option>
                  <option value="EUN1" className="bg-[#0f1923]">🇪🇺 EUNE (Doğu Avrupa)</option>
                  <option value="NA1" className="bg-[#0f1923]">🇺🇸 NA (Kuzey Amerika)</option>
                  <option value="KR" className="bg-[#0f1923]">🇰🇷 KR (Kore)</option>
                  <option value="BR1" className="bg-[#0f1923]">🇧🇷 BR (Brezilya)</option>
                  <option value="RU" className="bg-[#0f1923]">🇷🇺 RU (Rusya)</option>
                </select>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Son Kontrol:</span>
                <span className="text-white font-medium">{lastChecked}</span>
              </div>
            </div>

            {statusMsg && (
              <p className="text-xs text-center mt-2 font-medium text-emerald-400 bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                {statusMsg}
              </p>
            )}

            {platformMsg && (
              <p className="text-xs text-center mt-2 font-medium text-sky-400 bg-sky-500/10 py-1.5 rounded-lg border border-sky-500/20">
                {platformMsg}
              </p>
            )}

            <button
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-500/50 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              onClick={handleCheck}
              disabled={isPending || isSyncingMatches}
            >
              {isPending ? '⏳ Tam Senkronizasyon Yapılıyor...' : '🔄 Tam Senkronizasyon (API)'}
            </button>
            {checkMsg && <p className="text-xs text-center mt-2 text-slate-300">{checkMsg}</p>}
          </div>
        </div>

        {/* Rank Kartları */}
        <div className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col gap-4">
          
          {/* Solo/Duo */}
          <div className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="w-16 h-16 flex items-center justify-center">
              <RankBadge rank={ranks.solo?.formattedRank || account.rank || 'UNRANKED'} size={64} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-semibold mb-1">Ranked Solo</p>
              {ranks.solo ? (
                <>
                  <p className="text-lg font-bold text-white leading-none">{ranks.solo.formattedRank}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="text-green-400">{ranks.solo.wins}W</span> - <span className="text-red-400">{ranks.solo.losses}L</span> 
                    <span className="mx-2">•</span> 
                    Win Rate <strong className="text-white">{calculateWinRate(ranks.solo.wins, ranks.solo.losses)}%</strong>
                  </p>
                </>
              ) : account.rank && account.rank !== 'UNRANKED' ? (
                <>
                  <p className="text-lg font-bold text-slate-300 leading-none">{account.rank}</p>
                  <p className="text-[0.65rem] text-amber-500/80 mt-1 uppercase tracking-wider font-semibold">Geçmiş Sezon / Kayıtlı</p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500">Unranked</p>
              )}
            </div>
          </div>

          {/* Flex */}
          <div className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="w-14 h-14 flex items-center justify-center opacity-80">
              <RankBadge rank={ranks.flex?.formattedRank || 'UNRANKED'} size={48} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-semibold mb-1">Ranked Flex</p>
              {ranks.flex ? (
                <>
                  <p className="text-sm font-bold text-white leading-none">{ranks.flex.formattedRank}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="text-green-400">{ranks.flex.wins}W</span> - <span className="text-red-400">{ranks.flex.losses}L</span> 
                    <span className="mx-2">•</span> 
                    WR <strong className="text-white">{calculateWinRate(ranks.flex.wins, ranks.flex.losses)}%</strong>
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500">Unranked</p>
              )}
            </div>
          </div>

        </div>

        {/* Notlar */}
        <div className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">📝 Notlar</h2>
          <textarea
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-[#e8f0fe] font-sans min-h-[100px] resize-y outline-none transition-all focus:border-yellow-500/50 focus:bg-black/50"
            placeholder="Bu hesap hakkında not ekle..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPending}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-3">
            <span className={`text-xs font-medium ${saveMsg?.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {saveMsg}
            </span>
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#050e18] bg-gradient-to-br from-yellow-400 to-yellow-600 hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
              onClick={handleSaveNotes}
              disabled={isPending}
            >
              Kaydet
            </button>
          </div>
        </div>

      </div>


      {/* SAĞ SÜTUN (Maç Geçmişi) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Maç Geçmişi Üst Barı - Daima Görünür */}
        <div className="bg-[#0e192d]/85 border border-[#3d9be9]/18 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          {matches.length > 0 ? (
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">Son {matches.length} Maç (Kayıtlı)</p>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${recentWinRate >= 50 ? 'text-blue-400' : 'text-red-400'}`}>
                    {recentWinRate}% WR
                  </span>
                  <span className="text-sm text-slate-400">({wins}W {matches.length - wins}L)</span>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">Ortalama KDA</p>
                <p className="text-lg font-bold text-white">
                  {avgKills} <span className="text-slate-500">/</span> <span className="text-red-400">{avgDeaths}</span> <span className="text-slate-500">/</span> {avgAssists}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🎮 Maç Geçmişi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Riot API üzerinden son 5 karşılaşma ve dereceli (Solo/Flex) rank bilgileri
              </p>
            </div>
          )}

          {/* Maçları Güncelle / Çek Butonu */}
          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 hover:border-indigo-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
              onClick={handleSyncMatches}
              disabled={isPending || isSyncingMatches}
            >
              {isSyncingMatches ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Maçlar Çekiliyor...</span>
                </>
              ) : (
                <>
                  <span>⚔️</span>
                  <span>{matches.length > 0 ? 'Son Maçları Güncelle' : 'Maçları Riot\'tan Çek'}</span>
                </>
              )}
            </button>
            {matchSyncMsg && (
              <span className={`text-xs mt-1.5 font-medium ${matchSyncMsg.includes('✅') ? 'text-green-400' : matchSyncMsg.includes('ℹ️') || matchSyncMsg.includes('⚠️') ? 'text-amber-400' : 'text-red-400'}`}>
                {matchSyncMsg}
              </span>
            )}
          </div>
        </div>

        {/* Maç Kartları / Boş Durum */}
        <div className="flex flex-col gap-2">
          {matches.length === 0 ? (
            <div className="bg-[#0e192d]/50 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${account.lastCheckedAt ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                {account.lastCheckedAt ? '📭' : '🎮'}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {account.lastCheckedAt
                    ? 'Bu hesapta oynanmış maç bulunamadı'
                    : 'Veritabanında kayıtlı maç bulunmuyor'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {account.lastCheckedAt
                    ? 'Riot API sorgulandı ancak bu hesapta son zamanlarda oynanmış herhangi bir karşılaşma (Normal, Dereceli, ARAM) bulunmuyor veya hesap yeni açılmış.'
                    : 'Son 5 karşılaşmayı ve güncel Solo/Flex ranklarını Riot API üzerinden çekip kaydetmek için butona tıklayın.'}
                </p>
              </div>
              <button
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                onClick={handleSyncMatches}
                disabled={isPending || isSyncingMatches}
              >
                {isSyncingMatches ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>Riot API'den Maçlar Çekiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>⚔️</span>
                    <span>{account.lastCheckedAt ? 'Tekrar Kontrol Et' : 'Maçları Şimdi Çek'}</span>
                  </>
                )}
              </button>
              {matchSyncMsg && (
                <p className={`text-xs mt-2 font-medium ${matchSyncMsg.includes('✅') ? 'text-green-400' : matchSyncMsg.includes('ℹ️') || matchSyncMsg.includes('⚠️') ? 'text-amber-400' : 'text-red-400'}`}>
                  {matchSyncMsg}
                </p>
              )}
            </div>
          ) : (
            matches.map((match) => (
              <div 
                key={match.matchId} 
                className={`flex flex-col sm:flex-row items-center gap-4 p-3 pr-6 rounded-xl border-l-4 shadow-sm bg-black/20 transition-colors hover:bg-black/40
                  ${match.win ? 'border-l-blue-500/80 border-y border-r border-blue-500/10' : 'border-l-red-500/80 border-y border-r border-red-500/10'}
                `}
              >
                {/* Sonuç & Süre */}
                <div className="w-20 flex flex-col items-center sm:items-start text-center sm:text-left shrink-0">
                  <span className={`text-sm font-bold ${match.win ? 'text-blue-400' : 'text-red-400'}`}>
                    {match.win ? 'Victory' : 'Defeat'}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s
                  </span>
                </div>

                {/* Şampiyon */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#14233c]">
                    <Image 
                      src={ddragon.champion(match.championName)} 
                      alt={match.championName} 
                      width={48} height={48}
                      unoptimized
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-black/80 rounded px-1 border border-white/10 text-[0.6rem] font-bold text-white">
                    {match.championName}
                  </div>
                </div>

                {/* KDA & CS */}
                <div className="flex flex-col items-center sm:items-start w-28 shrink-0">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {match.kills} <span className="text-slate-500">/</span> <span className="text-red-400">{match.deaths}</span> <span className="text-slate-500">/</span> {match.assists}
                  </span>
                  <span className="text-[0.65rem] text-slate-400 mt-1">
                    <strong className="text-slate-300">{match.cs}</strong> CS ({(match.cs / (match.gameDuration / 60)).toFixed(1)}/m)
                  </span>
                </div>

                {/* Eşyalar */}
                <div className="flex items-center gap-1 mt-2 sm:mt-0 flex-wrap justify-center sm:justify-start">
                  {match.items.slice(0,6).map((itemId, i) => {
                    const itemUrl = ddragon.item(itemId);
                    return itemUrl ? (
                      <div key={i} className="w-6 h-6 rounded bg-slate-800 border border-black/50 overflow-hidden">
                        <Image src={itemUrl} alt="item" width={24} height={24} unoptimized />
                      </div>
                    ) : (
                      <div key={i} className="w-6 h-6 rounded bg-black/30 border border-white/5" />
                    );
                  })}
                  {/* Trinket */}
                  {ddragon.item(match.items[6]) ? (
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-black/50 overflow-hidden ml-1">
                      <Image src={ddragon.item(match.items[6])!} alt="trinket" width={24} height={24} unoptimized />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-black/30 border border-white/5 ml-1" />
                  )}
                </div>

                {/* Rol */}
                <div className="ml-auto hidden md:flex items-center justify-center bg-black/30 px-2 py-1 rounded text-xs text-slate-400">
                  {match.role !== 'NONE' ? match.role.replace('BOTTOM', 'ADC').replace('UTILITY', 'SUPP') : match.lane}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
