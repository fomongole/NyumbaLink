import Header from '@/components/layout/Header';
import UsersTable from '@/components/users/UsersTable';

export default function UsersPage() {
  return (
    <>
      <Header
        title="Users"
        description="Manage admin team members and access"
      />
      <main className="flex-1 p-6">
        <UsersTable />
      </main>
    </>
  );
}