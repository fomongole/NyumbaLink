import Header from '@/components/layout/Header';
import AuditLogsTable from '@/components/audit-logs/AuditLogsTable';

export default function AuditLogsPage() {
  return (
    <>
      <Header
        title="Audit Logs"
        description="Complete history of all system activity"
      />
      <main className="flex-1 p-6">
        <AuditLogsTable />
      </main>
    </>
  );
}