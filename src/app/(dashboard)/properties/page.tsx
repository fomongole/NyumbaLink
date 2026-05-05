import Header from '@/components/layout/Header';
import PropertiesTable from '@/components/properties/PropertiesTable';

export default function PropertiesPage() {
  return (
    <>
      <Header
        title="Properties"
        description="Manage all property listings"
      />
      <main className="flex-1 p-6">
        <PropertiesTable />
      </main>
    </>
  );
}