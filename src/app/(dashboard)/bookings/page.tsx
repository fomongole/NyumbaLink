import Header from '@/components/layout/Header';
import BookingsTable from '@/components/bookings/BookingsTable';

export default function BookingsPage() {
  return (
    <>
      <Header
        title="Bookings"
        description="Review and manage all property booking requests"
      />
      <main className="flex-1 p-6">
        <BookingsTable />
      </main>
    </>
  );
}