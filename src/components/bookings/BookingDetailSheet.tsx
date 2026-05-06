'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  X, User, Phone, Mail, Building2, BedDouble,
  Calendar, CheckCircle2, XCircle, Clock, BadgeCheck,
  MessageSquare, ChevronRight, AlertTriangle,
} from 'lucide-react';

import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { bookingsApi } from '@/lib/api/bookings.api';
import { Booking, BookingStatus } from '@/types';

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<BookingStatus, {
  label: string;
  color: string;
  icon: React.ElementType;
  bg: string;
}> = {
  PENDING: {
    label: 'Pending Review',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: BadgeCheck,
  },
};

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function BookingDetailSheet({ booking, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => bookingsApi.confirm(booking!.id, { adminNotes: adminNotes || undefined }),
    onSuccess: () => { toast.success('Booking confirmed'); invalidate(); onClose(); },
    onError: () => toast.error('Failed to confirm booking'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(booking!.id, { reason: cancelReason || undefined }),
    onSuccess: () => { toast.success('Booking cancelled'); invalidate(); onClose(); },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const completeMutation = useMutation({
    mutationFn: () => bookingsApi.complete(booking!.id),
    onSuccess: () => { toast.success('Booking marked as completed'); invalidate(); onClose(); },
    onError: () => toast.error('Failed to complete booking'),
  });

  if (!booking) return null;

  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  const fmt = (date?: string) =>
    date ? new Date(date).toLocaleDateString('en-UG', {
      day: 'numeric', month: 'long', year: 'numeric',
    }) : '—';

  const fmtTime = (date?: string) =>
    date ? new Date(date).toLocaleString('en-UG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="!w-[480px] !max-w-[95vw] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
            <SheetHeader>
              <SheetTitle className="text-base font-semibold">Booking Details</SheetTitle>
              <SheetDescription className="text-xs text-gray-400 font-mono">
                #{booking.id.slice(0, 8).toUpperCase()}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Status Banner */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.bg}`}>
              <StatusIcon className={`h-5 w-5 ${status.color} flex-shrink-0`} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Created {fmtTime(booking.createdAt)}
                </p>
              </div>
            </div>

            {/* Renter Info */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Renter Information
              </p>
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 px-1">
                <InfoRow icon={User} label="Full Name" value={booking.renterName} />
                <InfoRow icon={Phone} label="Phone" value={
                  <a href={`tel:${booking.renterPhone}`} className="text-primary hover:underline">
                    {booking.renterPhone}
                  </a>
                } />
                {booking.renterEmail && (
                  <InfoRow icon={Mail} label="Email" value={
                    <a href={`mailto:${booking.renterEmail}`} className="text-primary hover:underline">
                      {booking.renterEmail}
                    </a>
                  } />
                )}
              </div>
            </section>

            {/* Property Info */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Property
              </p>
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 px-1">
                <InfoRow icon={Building2} label="Property" value={booking.property.title} />
                {booking.hostelRoom && (
                  <InfoRow icon={BedDouble} label="Room" value={
                    <span className="flex items-center gap-1.5">
                      Room {booking.hostelRoom.roomNumber}
                      <Badge variant="outline" className="text-xs py-0">{booking.hostelRoom.type}</Badge>
                    </span>
                  } />
                )}
                <InfoRow icon={Building2} label="District" value={
                  `${booking.property.district.name} · ${booking.property.area}`
                } />
              </div>
            </section>

            {/* Dates */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Booking Dates
              </p>
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 px-1">
                <InfoRow icon={Calendar} label="Move-in Date" value={fmt(booking.moveInDate)} />
                <InfoRow icon={Calendar} label="Move-out Date" value={
                  booking.moveOutDate ? fmt(booking.moveOutDate) : (
                    <span className="text-gray-400 italic">Open-ended</span>
                  )
                } />
              </div>
            </section>

            {/* Notes */}
            {booking.notes && (
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Renter Notes
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{booking.notes}</p>
                </div>
              </section>
            )}

            {/* Admin Notes */}
            {booking.adminNotes && (
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Admin Notes
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-sm text-gray-700">{booking.adminNotes}</p>
                </div>
              </section>
            )}

            {/* Cancellation Info */}
            {booking.status === 'CANCELLED' && (
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Cancellation
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs text-red-600">
                    Cancelled by <strong>{booking.cancelledBy ?? 'unknown'}</strong>
                    {booking.cancelledAt ? ` on ${fmtTime(booking.cancelledAt)}` : ''}
                  </p>
                  {booking.cancellationReason && (
                    <p className="text-sm text-gray-700">{booking.cancellationReason}</p>
                  )}
                </div>
              </section>
            )}

            {/* Timeline */}
            {(booking.confirmedAt || booking.cancelledAt) && (
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <div className="space-y-2">
                  <TimelineItem label="Created" time={booking.createdAt} />
                  {booking.confirmedAt && (
                    <TimelineItem label="Confirmed" time={booking.confirmedAt} color="emerald" />
                  )}
                  {booking.cancelledAt && (
                    <TimelineItem label="Cancelled" time={booking.cancelledAt} color="red" />
                  )}
                </div>
              </section>
            )}

            {/* Actions */}
            {booking.status === 'PENDING' && (
              <section className="pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Actions
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">Admin notes (optional)</Label>
                    <Textarea
                      placeholder="Add internal notes before confirming..."
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setConfirmDialogOpen(true)}
                      disabled={confirmMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Confirm Booking
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {booking.status === 'CONFIRMED' && (
              <section className="pt-2 flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setCompleteDialogOpen(true)}
                  disabled={completeMutation.isPending}
                >
                  <BadgeCheck className="h-4 w-4 mr-1.5" />
                  Mark Completed
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </section>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the booking as confirmed and set the room/property to occupied.
              The renter will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => confirmMutation.mutate()}
            >
              Yes, Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel this booking?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the booking and free up the room/property.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-2">
            <Label className="text-sm">Reason (optional)</Label>
            <Textarea
              placeholder="Reason for cancellation..."
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1.5 text-sm resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => cancelMutation.mutate()}
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the renter as moved out and frees up the property/room for new bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => completeMutation.mutate()}
            >
              Mark Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TimelineItem({ label, time, color = 'gray' }: {
  label: string; time?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-400', emerald: 'bg-emerald-500', red: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${colors[color] ?? colors.gray}`} />
      <span className="text-sm text-gray-600">{label}</span>
      <ChevronRight className="h-3 w-3 text-gray-300" />
      <span className="text-sm text-gray-500 ml-auto">
        {time ? new Date(time).toLocaleString('en-UG', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        }) : '—'}
      </span>
    </div>
  );
}