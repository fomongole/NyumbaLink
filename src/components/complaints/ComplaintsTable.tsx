'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search, ChevronRight, Filter,
  AlertCircle, Clock, CheckCircle2, XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { complaintsApi } from '@/lib/api/complaints.api';
import {
  Complaint, ComplaintStatus, ComplaintCategory, ComplaintFilters,
} from '@/types';

// ── Labels & styles ───────────────────────────────────────────────────────────

const STATUS_TABS: { value: ComplaintStatus | 'ALL'; label: string; icon: React.ElementType }[] = [
  { value: 'ALL',         label: 'All',         icon: Filter },
  { value: 'OPEN',        label: 'Open',         icon: AlertCircle },
  { value: 'IN_PROGRESS', label: 'In Progress',  icon: Clock },
  { value: 'RESOLVED',    label: 'Resolved',     icon: CheckCircle2 },
  { value: 'CLOSED',      label: 'Closed',       icon: XCircle },
];

const STATUS_BADGE: Record<ComplaintStatus, { label: string; className: string }> = {
  OPEN:        { label: 'Open',        className: 'bg-red-50 text-red-700 border-red-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  RESOLVED:    { label: 'Resolved',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED:      { label: 'Closed',      className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATUS_DOT: Record<ComplaintStatus, string> = {
  OPEN:        'bg-red-500',
  IN_PROGRESS: 'bg-amber-400',
  RESOLVED:    'bg-emerald-500',
  CLOSED:      'bg-gray-400',
};

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  GENERAL:            'General',
  PROPERTY_CONDITION: 'Property Condition',
  CONTACT_CONDUCT:    'Contact Conduct',
  PRICING:            'Pricing',
  BOOKING:            'Booking',
  APP_ISSUE:          'App Issue',
  OTHER:              'Other',
};

const NEXT_STATUSES: Record<ComplaintStatus, ComplaintStatus[]> = {
  OPEN:        ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED:    ['OPEN', 'CLOSED'],
  CLOSED:      ['OPEN'],
};

const UNSET = '__ALL__';

// ── Detail Sheet ──────────────────────────────────────────────────────────────

function ComplaintDetailSheet({
  complaint,
  open,
  onClose,
}: {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [adminReply, setAdminReply] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      complaintsApi.updateStatus(complaint!.id, {
        status: newStatus as ComplaintStatus,
        adminNotes: adminNotes || undefined,
        adminReply: adminReply || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
      toast.success('Complaint updated');
      setNewStatus('');
      setAdminNotes('');
      setAdminReply('');
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update status';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  if (!complaint) return null;

  const badge = STATUS_BADGE[complaint.status];
  const allowedNext = NEXT_STATUSES[complaint.status];

  const fmt = (date: string) =>
    new Date(date).toLocaleString('en-UG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!max-w-[560px] !w-[90vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Complaint Details</SheetTitle>
          <SheetDescription>Submitted {fmt(complaint.createdAt)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Status + Category */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${badge.className}`}>
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[complaint.status]}`} />
              {badge.label}
            </span>
            <Badge variant="outline" className="text-xs">
              {CATEGORY_LABELS[complaint.category]}
            </Badge>
          </div>

          {/* Submitter */}
          <div className="rounded-lg border p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitter</p>
            <p className="font-medium">{complaint.submitterName}</p>
            <p className="text-sm text-gray-600">{complaint.submitterPhone}</p>
            {complaint.submitterEmail && (
              <p className="text-sm text-gray-600">{complaint.submitterEmail}</p>
            )}
          </div>

          {/* Related property */}
          {complaint.property && (
            <div className="rounded-lg border p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Related Property</p>
              <p className="font-medium text-sm">{complaint.property.title}</p>
              <p className="text-xs text-gray-500">{complaint.property.area}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Admin notes (internal) */}
          {complaint.adminNotes && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-1">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Internal Notes
              </p>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{complaint.adminNotes}</p>
              {complaint.resolvedByName && (
                <p className="text-xs text-amber-600 mt-1">Actioned by {complaint.resolvedByName}</p>
              )}
            </div>
          )}

          {/* Admin reply — shown if one was previously sent */}
          {complaint.adminReply && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-1">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                Reply sent to renter
              </p>
              <p className="text-sm text-emerald-800 whitespace-pre-wrap">{complaint.adminReply}</p>
            </div>
          )}

          {/* Update form */}
          {allowedNext.length > 0 && (
            <div className="rounded-lg border p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Complaint</p>

              <div className="space-y-1.5">
                <Label className="text-sm">New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as ComplaintStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedNext.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_BADGE[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Reply to renter
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    (sent via email + in-app notification if they have an account)
                  </span>
                </Label>
                <Textarea
                  placeholder="Write a message the renter will see, e.g. what action was taken..."
                  rows={3}
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Internal notes
                  <span className="ml-1.5 text-xs font-normal text-gray-400">(admin only, never shown to renter)</span>
                </Label>
                <Textarea
                  placeholder="Add private notes for your team..."
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={!newStatus || updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Complaint'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


// ── Stat Card (Updated to Dashboard Style) ───────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export default function ComplaintsTable() {
  const [activeTab, setActiveTab] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filters: ComplaintFilters = {
    status: activeTab === 'ALL' ? undefined : activeTab,
    category: categoryFilter,
    page,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['complaints', filters],
    queryFn: () => complaintsApi.getAll(filters),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['complaint-stats'],
    queryFn: complaintsApi.getStats,
  });

  const complaints = useMemo(() => {
    const all = data?.data ?? [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (c) =>
        c.submitterName.toLowerCase().includes(q) ||
        c.submitterPhone.includes(q) ||
        c.property?.title.toLowerCase().includes(q),
    );
  }, [data, search]);

  const openDetail = (c: Complaint) => { setSelected(c); setDetailOpen(true); };
  const fmt = (date: string) =>
    new Date(date).toLocaleDateString('en-UG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <>
      {/* Stats Row - Updated Grid and Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Total" 
          value={stats?.total ?? 0} 
          icon={Filter} 
          color="text-gray-600" 
          bg="bg-gray-50" 
          loading={loadingStats}
        />
        <StatCard 
          label="Open" 
          value={stats?.open ?? 0} 
          icon={AlertCircle} 
          color="text-red-600" 
          bg="bg-red-50" 
          loading={loadingStats}
        />
        <StatCard 
          label="In Progress" 
          value={stats?.inProgress ?? 0} 
          icon={Clock} 
          color="text-amber-600" 
          bg="bg-amber-50" 
          loading={loadingStats}
        />
        <StatCard 
          label="This Week" 
          value={stats?.thisWeek ?? 0} 
          icon={CheckCircle2} 
          color="text-blue-600" 
          bg="bg-blue-50" 
          loading={loadingStats}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Complaints</CardTitle>
              <CardDescription>
                {data?.meta.total ?? 0} total complaint{(data?.meta.total ?? 0) !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search submitter, property..."
                  className="pl-8 h-9 text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select
                value={categoryFilter ?? UNSET}
                onValueChange={(v) => {
                  setCategoryFilter(v === UNSET ? undefined : v as ComplaintCategory);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-44 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>All Categories</SelectItem>
                  {(Object.keys(CATEGORY_LABELS) as ComplaintCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => { setActiveTab(v as any); setPage(1); }}
          >
            <TabsList className="h-9 bg-gray-100 p-1 gap-1 flex-wrap">
              {STATUS_TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-7 px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {value === 'OPEN' && stats?.open ? (
                    <span className="ml-0.5 h-4 min-w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {stats.open}
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
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No complaints found</p>
              <p className="text-sm mt-1 text-gray-400">
                {search || activeTab !== 'ALL' || categoryFilter
                  ? 'Try adjusting your filters.'
                  : 'Complaints submitted by renters will appear here.'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitter</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => {
                    const badge = STATUS_BADGE[complaint.status];
                    return (
                      <TableRow
                        key={complaint.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors group"
                        onClick={() => openDetail(complaint)}
                      >
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {complaint.submitterName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {complaint.submitterPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[complaint.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {complaint.property ? (
                            <div>
                              <p className="text-sm text-gray-700 leading-tight line-clamp-1">
                                {complaint.property.title}
                              </p>
                              <p className="text-xs text-gray-400">{complaint.property.area}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge.className}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[complaint.status]}`} />
                            {badge.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-gray-500">{fmt(complaint.createdAt)}</p>
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

      <ComplaintDetailSheet
        complaint={selected}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelected(null); }}
      />
    </>
  );
}