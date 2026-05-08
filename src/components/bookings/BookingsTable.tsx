'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock, CheckCircle2, XCircle, BadgeCheck,
  Search, ChevronRight, Building2, BedDouble,
  CalendarDays, Phone, Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BookingDetailSheet from './BookingDetailSheet';
import { bookingsApi } from '@/lib/api/bookings.api';
import { Booking, BookingStatus, BookingFilters } from '@/types';

const STATUS_TABS: { value: BookingStatus | 'ALL'; label: string; icon: React.ElementType }[] = [
  { value: 'ALL', label: 'All', icon: Filter },
  { value: 'PENDING', label: 'Pending', icon: Clock },
  { value: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { value: 'COMPLETED', label: 'Completed', icon: BadgeCheck },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle },
];

const STATUS_BADGE: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

const STATUS_DOT: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
  COMPLETED: 'bg-blue-500',
};

export default function BookingsTable() {
  const [activeTab, setActiveTab] = useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filters: BookingFilters = {
    status: activeTab === 'ALL' ? undefined : activeTab,
    page,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingsApi.getAll(filters),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: bookingsApi.getStats,
  });

  const bookings = useMemo(() => {
    const all = data?.data ?? [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (b) =>
        b.renterName.toLowerCase().includes(q) ||
        b.renterPhone.includes(q) ||
        b.property.title.toLowerCase().includes(q),
    );
  }, [data, search]);

  const openDetail = (b: Booking) => {
    setSelected(b);
    setDetailOpen(true);
  };

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString('en-UG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <>
      {/* Stats Row - Matches Dashboard Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Bookings"
          value={stats?.total ?? 0}
          icon={Filter}
          color="text-blue-600"
          bg="bg-blue-50"
          loading={loadingStats}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
          loading={loadingStats}
        />
        <StatCard
          label="Confirmed"
          value={stats?.confirmed ?? 0}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
          loading={loadingStats}
        />
        <StatCard
          label="This Week"
          value={stats?.thisWeek ?? 0}
          icon={CalendarDays}
          color="text-purple-600"
          bg="bg-purple-50"
          loading={loadingStats}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                {data?.meta.total ?? 0} total booking{(data?.meta.total ?? 0) !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search renter, phone, property..."
                className="pl-8 h-9 text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setPage(1); }}>
            <TabsList className="h-9 bg-gray-100 p-1 gap-1 flex-wrap">
              {STATUS_TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-7 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {value === 'PENDING' && stats?.pending ? (
                    <span className="ml-0.5 h-4 min-w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {stats.pending}
                    </span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <p className="font-medium">No bookings found</p>
              <p className="text-sm mt-1 text-gray-400">
                {search || activeTab !== 'ALL'
                  ? 'Try adjusting your search or filter.'
                  : 'Bookings submitted by renters will appear here.'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Renter
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Property
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Move-in
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Submitted
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const badge = STATUS_BADGE[booking.status];
                    return (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors group"
                        onClick={() => openDetail(booking)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">
                                {booking.renterName.charAt(0).toUpperCase()}
                              </div>
                              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${STATUS_DOT[booking.status]}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 leading-tight">
                                {booking.renterName}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" />
                                {booking.renterPhone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-1">
                              {booking.property.title}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              {booking.hostelRoom ? (
                                <><BedDouble className="h-3 w-3" />Room {booking.hostelRoom.roomNumber}</>
                              ) : (
                                <><Building2 className="h-3 w-3" />{booking.property.area}</>
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-700">{fmt(booking.moveInDate)}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge.className}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[booking.status]}`} />
                            {badge.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-gray-500">{fmt(booking.createdAt)}</p>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingDetailSheet
        booking={selected}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelected(null); }}
      />
    </>
  );
}

function StatCard({
  label, value, icon: Icon, color, bg, loading
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-600">
          {label}
        </CardTitle>
        <div className={`${bg} p-2 rounded-lg`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}