'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, BedDouble,
  CheckCircle2, Clock, Wrench, XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import HostelRoomFormSheet from './HostelRoomFormSheet';
import { hostelRoomsApi } from '@/lib/api/hostel-rooms.api';
import { HostelRoom, HostelRoomStatus } from '@/types';

const STATUS_CONFIG: Record<HostelRoomStatus, { label: string; className: string; dot: string }> = {
  AVAILABLE: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  RESERVED: {
    label: 'Reserved',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  OCCUPIED: {
    label: 'Occupied',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
  },
};

const TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  SHARED: 'Shared',
};

const STATUS_OPTIONS: HostelRoomStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'];

interface Props {
  propertyId: string;
}

export default function HostelRoomsPanel({ propertyId }: Props) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<HostelRoom | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['hostel-rooms', propertyId],
    queryFn: () => hostelRoomsApi.getAll(propertyId),
  });

  const { data: stats } = useQuery({
    queryKey: ['hostel-room-stats', propertyId],
    queryFn: () => hostelRoomsApi.getStats(propertyId),
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => hostelRoomsApi.delete(propertyId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['hostel-room-stats', propertyId] });
      toast.success('Room deleted');
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to delete room'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ roomId, status }: { roomId: string; status: HostelRoomStatus }) =>
      hostelRoomsApi.updateStatus(propertyId, roomId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['hostel-room-stats', propertyId] });
      toast.success('Room status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const handleEdit = (r: HostelRoom) => { setSelected(r); setFormOpen(true); };
  const handleDelete = (r: HostelRoom) => { setSelected(r); setDeleteOpen(true); };

  return (
    <>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <RoomStatPill label="Total" value={stats.total} color="text-gray-700" bg="bg-gray-100" />
          <RoomStatPill label="Available" value={stats.available} color="text-emerald-700" bg="bg-emerald-50" />
          <RoomStatPill label="Occupied" value={stats.occupied} color="text-blue-700" bg="bg-blue-50" />
          <RoomStatPill label="Reserved" value={stats.reserved} color="text-amber-700" bg="bg-amber-50" />
          <RoomStatPill label="Occupancy" value={`${stats.occupancyRate}%`} color="text-purple-700" bg="bg-purple-50" />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            Rooms
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({rooms.length} total)
            </span>
          </CardTitle>
          <Button
            size="sm"
            onClick={() => { setSelected(null); setFormOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Room
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BedDouble className="h-5 w-5 text-gray-400" />
              </div>
              <p className="font-medium text-sm">No rooms added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add individual rooms with their own pricing and availability.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => { setSelected(null); setFormOpen(true); }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add First Room
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price/mo</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Floor</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amenities</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => {
                    const s = STATUS_CONFIG[room.status];
                    return (
                      <TableRow key={room.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <BedDouble className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              Room {room.roomNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {TYPE_LABELS[room.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-gray-900">
                            UGX {Number(room.price).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {room.floor !== null && room.floor !== undefined
                              ? room.floor === 0 ? 'Ground' : `Floor ${room.floor}`
                              : <span className="text-gray-300">—</span>}
                          </span>
                        </TableCell>
                        <TableCell>
                          {/* Inline status changer */}
                          <Select
                            value={room.status}
                            onValueChange={(v) =>
                              statusMutation.mutate({ roomId: room.id, status: v as HostelRoomStatus })
                            }
                          >
                            <SelectTrigger className={`h-7 w-36 text-xs border font-medium ${s.className} focus:ring-0`}>
                              <div className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((opt) => {
                                const cfg = STATUS_CONFIG[opt];
                                return (
                                  <SelectItem key={opt} value={opt} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                                      {cfg.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {room.amenities?.slice(0, 2).map((a) => (
                              <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                            {(room.amenities?.length ?? 0) > 2 && (
                              <span className="text-[10px] text-gray-400">
                                +{room.amenities!.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(room)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(room)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <HostelRoomFormSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelected(null); }}
        propertyId={propertyId}
        room={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room {selected?.roomNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This room will be permanently deleted. This cannot be undone if no bookings are linked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelected(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selected && deleteMutation.mutate(selected.id)}
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RoomStatPill({ label, value, color, bg }: {
  label: string; value: number | string; color: string; bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl px-4 py-3 text-center`}>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}