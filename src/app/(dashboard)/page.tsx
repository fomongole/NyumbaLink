import Header from '@/components/layout/Header';
import StatsCards from '@/components/shared/StatsCards';

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome to the NyumbaLink admin panel"
      />
      <main className="flex-1 p-6">
        <StatsCards />
      </main>
    </>
  );
}