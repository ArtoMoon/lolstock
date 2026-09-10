'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BackToDashboardLink() {
  const { t } = useLanguage();
  return (
    <Link
      href="/"
      className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-6 pb-2 border-b-2 border-transparent hover:border-yellow-500"
    >
      {t('back_to_dashboard')}
    </Link>
  );
}
