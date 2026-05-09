'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle,
} from '@/components/ui/card';
import { notificationsApi } from '@/lib/api/notifications.api';

export default function BroadcastCard() {
  const [title, setTitle]     = useState('');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () => notificationsApi.broadcast({ title, message }),
    onSuccess: (res) => {
      toast.success(res.message ?? 'Notification sent to all renters');
      setTitle('');
      setMessage('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to send notification';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const canSubmit = title.trim().length >= 3 && message.trim().length >= 10;

  return (
    <div className="space-y-6">

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
        <Users className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          This sends a <strong>SYSTEM_ALERT</strong> notification to every active renter
          on the mobile app. Use this for maintenance windows, platform updates, or
          important announcements. Use sparingly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Broadcast Notification
          </CardTitle>
          <CardDescription>
            Compose a message to send to all active renter accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-1.5">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Scheduled Maintenance Tonight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
            <p className="text-xs text-gray-400 text-right">{title.length}/80</p>
          </div>

          <div className="space-y-1.5">
            <Label>
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="e.g. The platform will be under maintenance from 11 PM to 1 AM EAT. Booking submissions may be temporarily unavailable."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
          </div>

          {/* Live preview */}
          {(title || message) && (
            <div className="rounded-lg border bg-gray-50 p-3 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Preview
              </p>
              <p className="text-sm font-semibold text-gray-900">{title || '—'}</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message || '—'}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Send className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Sending...' : 'Send to All Renters'}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}