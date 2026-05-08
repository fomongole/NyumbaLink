import ComplaintsTable from '@/components/complaints/ComplaintsTable';
import Header from '@/components/layout/Header';

export default function ComplaintsPage() {
  return (
    <>
      <Header
        title="Complaints"
        description="Review and manage renter-submitted complaints"
      />
      <main className="flex-1 p-6">
        <ComplaintsTable />
      </main>
    </>
  );
}