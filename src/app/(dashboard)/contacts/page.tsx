import ContactsTable from '@/components/contacts/ContactsTable';
import Header from '@/components/layout/Header';

export default function ContactsPage() {
  return (
    <>
      <Header
        title="Contacts"
        description="Manage property owners and agents"
      />
      <main className="flex-1 p-6">
        <ContactsTable />
      </main>
    </>
  );
}