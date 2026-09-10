'use client';

import { useState, useEffect, useTransition } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getApiKeyStatus, saveApiKey, verifyApiKey, ApiKeyStatus } from '@/app/actions/settings';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function OnboardingModal({ isOpen: controlledOpen, onClose }: OnboardingModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Custom event dinleyicisi (Navbar'dan açmak için)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setFeedback(null);
      fetchStatus();
    };

    window.addEventListener('open-settings-modal', handleOpen);
    return () => window.removeEventListener('open-settings-modal', handleOpen);
  }, []);

  // Kontrollü açık/kapalı durumu
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
      if (controlledOpen) {
        fetchStatus();
      }
    }
  }, [controlledOpen]);

  // İlk açılış kontrolü: Daha önce görülmemişse veya key yoksa otomatik aç
  useEffect(() => {
    const checkInitialLaunch = async () => {
      try {
        const keyStatus = await getApiKeyStatus();
        setStatus(keyStatus);

        const seen = localStorage.getItem('mylol_onboarding_seen');
        if (!seen || !keyStatus.hasKey) {
          setIsOpen(true);
        }
      } catch {
        // Ignore
      }
    };

    checkInitialLaunch();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getApiKeyStatus();
      setStatus(data);
    } catch {
      // Ignore
    }
  };

  const handleSaveAndTest = () => {
    if (!apiKeyInput.trim()) {
      setFeedback({
        type: 'error',
        message: 'Lütfen bir Riot API Anahtarı giriniz.',
      });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result = await saveApiKey(apiKeyInput.trim());

      if (result.success) {
        setFeedback({
          type: 'success',
          message: t('onboarding_valid_key'),
        });
        setApiKeyInput('');
        fetchStatus();
      } else {
        setFeedback({
          type: 'error',
          message: result.error || t('onboarding_invalid_key'),
        });
      }
    });
  };

  const handleClose = () => {
    try {
      localStorage.setItem('mylol_onboarding_seen', 'true');
    } catch {
      // Ignore
    }
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#080e1a] border border-yellow-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Üst Başlık & Kapat Butonu */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050a14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.3)]">
              <img src="/icon.png" alt="MyLoL" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {t('onboarding_welcome_title')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('onboarding_welcome_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        {/* İçerik Alanı (Kaydırılabilir) */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          
          {/* Özellikler Özeti (3 Kart) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0c1524] border border-blue-500/20">
              <h3 className="text-xs font-bold text-blue-300 mb-1">
                {t('onboarding_feature_1_title')}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('onboarding_feature_1_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c1524] border border-purple-500/20">
              <h3 className="text-xs font-bold text-purple-300 mb-1">
                {t('onboarding_feature_2_title')}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('onboarding_feature_2_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c1524] border border-emerald-500/20">
              <h3 className="text-xs font-bold text-emerald-300 mb-1">
                {t('onboarding_feature_3_title')}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('onboarding_feature_3_desc')}
              </p>
            </div>
          </div>

          {/* API Key Kurulum Bölümü */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1729] to-[#080f1c] border border-yellow-500/25 shadow-inner">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                  <span>🔑</span> {t('onboarding_api_step_title')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('onboarding_api_step_desc')}
                </p>
              </div>

              {status?.hasKey && (
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Aktif: {status.maskedKey}</span>
                </div>
              )}
            </div>

            {/* Nasıl Alınır Adımları */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 space-y-1.5 mb-4">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span>{t('onboarding_how_to_get')}</span>
                <a
                  href="https://developer.riotgames.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 underline font-semibold flex items-center gap-1"
                >
                  developer.riotgames.com ↗
                </a>
              </div>
              <p>{t('onboarding_step_1')}</p>
              <p>{t('onboarding_step_2')}</p>
              <p>{t('onboarding_step_3')}</p>
            </div>

            {/* Input ve Kaydet Butonu */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('onboarding_api_input_label')}
                </label>
                <input
                  type="text"
                  placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050a14] border border-white/15 text-white font-mono text-xs focus:border-yellow-500 focus:outline-none placeholder:text-slate-600 transition-colors"
                />
              </div>

              {/* Geri Bildirim Mesajı */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span>{feedback.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAndTest}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 transition-all cursor-pointer shadow-[0_2px_15px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>{t('onboarding_testing')}</span>
                  </>
                ) : (
                  <span>{t('onboarding_test_save_btn')}</span>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Alt Çubuk */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-[#050a14] flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            {t('onboarding_close_btn')}
          </button>
        </div>

      </div>
    </div>
  );
}
