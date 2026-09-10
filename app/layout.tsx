import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import OnboardingModal from '@/components/OnboardingModal';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MyLoL – Kişisel LoL Hesap Dashboard',
    template: '%s | MyLoL',
  },
  description:
    'League of Legends hesaplarınızı Riot API ile gerçek zamanlı takip edin. Level, rank ve aktivite durumunu izleyin.',
  keywords: ['League of Legends', 'LoL hesap', 'kişisel dashboard', 'Riot API', 'rank takip'],
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <OnboardingModal />
        </LanguageProvider>
      </body>
    </html>
  );
}
