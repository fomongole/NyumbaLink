import LandlordsTable from '@/components/landlords/LandlordsTable';
import Header from '@/components/layout/Header';

export default function LandlordsPage() {
  return (
    <>
      <Header
        title="Landlords"
        description="Manage all registered landlords"
      />
      <main className="flex-1 p-6">
        <LandlordsTable />
      </main>
    </>
  );
}