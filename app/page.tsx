import type { Metadata } from 'next';
import { getAccounts } from '@/app/actions/accounts';
import DashboardView from '@/components/DashboardView';
import DashboardHeader from '@/components/DashboardHeader';

export const metadata: Metadata = {
  title: 'Dashboard – MyLoL',
  description: 'Tüm LoL hesaplarınızı tek panelden takip edin.',
};

export default async function HomePage() {
  const accounts = await getAccounts();

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-8 pb-16">
      <DashboardHeader />

      {/* ── Dashboard (Interactive Stats Grid + Action Bar + Account Table with Tag Filters) ── */}
      <DashboardView accounts={accounts} />
    </div>
  );
}
