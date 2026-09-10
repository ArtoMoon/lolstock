import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/mongoose';
import Account from '@/models/Account';
import type { IAccount } from '@/models/Account';
import type { AccountData } from '@/app/actions/accounts';
import AccountDetailClient from './AccountDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  const account = await Account.findById(id).lean<IAccount & { _id: unknown }>();
  if (!account) return { title: 'Hesap Bulunamadı' };

  return {
    title: `${account.riotId} – MyLoL`,
    description: `${account.riotId} hesabının detayları. Seviye: ${account.level}, Rank: ${account.rank}`,
  };
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  await dbConnect();

  const raw = await Account.findById(id).lean<IAccount & { _id: unknown }>();

  if (!raw) {
    notFound();
  }

  const account: AccountData = {
    ...raw,
    _id: String(raw._id),
    lastCheckedAt: raw.lastCheckedAt ? new Date(raw.lastCheckedAt) : new Date(0),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(0),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(0),
    ranks: raw.ranks || { solo: null, flex: null },
    matches: raw.matches || [],
  } as AccountData;

  // Tüm verileri (ranks, matches vb.) Account modelinden alıyoruz. 
  // Live API Fetching kaldırıldı!

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-6 pb-2 border-b-2 border-transparent hover:border-yellow-500">
        ← Dashboard'a Dön
      </Link>

      <AccountDetailClient account={account} />
    </div>
  );
}
