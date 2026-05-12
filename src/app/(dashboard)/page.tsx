import Header from '@/components/layout/Header';
import StatsCards from '@/components/shared/StatsCards';
import RecentProperties from '@/components/shared/RecentProperties';

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome to the Rentora Houselink admin panel"
      />
      <main className="flex-1 p-6 space-y-6">
        <StatsCards />
        <RecentProperties />
      </main>
    </>
  );
}