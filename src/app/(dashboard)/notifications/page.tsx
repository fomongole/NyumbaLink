import Header from '@/components/layout/Header';
import BroadcastCard from '@/components/notifications/BroadcastCard';

export default function NotificationsPage() {
  return (
    <>
      <Header
        title="Notifications"
        description="Broadcast messages to all renters on the mobile app"
      />
      <main className="flex-1 p-6 max-w-2xl">
        <BroadcastCard />
      </main>
    </>
  );
}