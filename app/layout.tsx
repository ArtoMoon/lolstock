import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LoLStock – LoL Hesap Stok Takip',
    template: '%s | LoLStock',
  },
  description:
    'League of Legends hesaplarınızı Riot API ile gerçek zamanlı takip edin. Level, rank ve aktivite durumunu izleyin.',
  keywords: ['League of Legends', 'LoL hesap', 'stok takip', 'Riot API', 'rank takip'],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
