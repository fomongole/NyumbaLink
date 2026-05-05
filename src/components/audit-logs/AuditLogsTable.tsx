'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
  Card, CardContent, CardHeader,
  CardTitle, CardDescription,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { auditLogsApi } from '@/lib/api/audit-logs.api';
import { AuditAction, AuditEntity, AuditLogFilters } from '@/types';

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  RESTORE: 'Restored',
  STATUS_CHANGE: 'Status Changed',
  IMAGE_UPLOAD: 'Image Uploaded',
  IMAGE_DELETE: 'Image Deleted',
  LOGIN: 'Login',
  PASSWORD_CHANGE: 'Password Changed',
};

const ACTION_VARIANTS: Record<AuditAction, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREATE: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
  RESTORE: 'default',
  STATUS_CHANGE: 'secondary',
  IMAGE_UPLOAD: 'secondary',
  IMAGE_DELETE: 'destructive',
  LOGIN: 'outline',
  PASSWORD_CHANGE: 'outline',
};

const ENTITY_LABELS: Record<AuditEntity, string> = {
  PROPERTY: 'Property',
  LANDLORD: 'Landlord',
  USER: 'User',
  IMAGE: 'Image',
  AUTH: 'Auth',
};

const UNSET = '__ALL__';

export default function AuditLogsTable() {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogsApi.getAll(filters),
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const setFilter = (key: keyof AuditLogFilters, value: AuditLogFilters[keyof AuditLogFilters]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <Card>
      {/* Updated responsive CardHeader */}
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            {meta ? `${meta.total} total events` : 'All system events'}
          </CardDescription>
        </div>
        {/* Updated flexible button wrapper */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Select
            value={(filters.entity as string) ?? UNSET}
            onValueChange={(v) =>
              setFilter('entity', v === UNSET ? undefined : (v as AuditEntity))
            }
          >
            <SelectTrigger className="h-8 w-full sm:w-32 text-sm flex-1 sm:flex-none">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>All Entities</SelectItem>
              {(Object.keys(ENTITY_LABELS) as AuditEntity[]).map((e) => (
                <SelectItem key={e} value={e}>{ENTITY_LABELS[e]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(filters.action as string) ?? UNSET}
            onValueChange={(v) =>
              setFilter('action', v === UNSET ? undefined : (v as AuditAction))
            }
          >
            <SelectTrigger className="h-8 w-full sm:w-40 text-sm flex-1 sm:flex-none">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>All Actions</SelectItem>
              {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
                <SelectItem key={a} value={a}>{ACTION_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">No activity recorded yet</p>
          </div>
        ) : (
          <>
            {/* Added missing overflow-x-auto wrapper */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={ACTION_VARIANTS[log.action]}>
                          {ACTION_LABELS[log.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ENTITY_LABELS[log.entity]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 min-w-[150px]">
                        {log.entityTitle ?? (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div>
                          <p className="text-sm font-medium">{log.performedByName}</p>
                          <p className="text-xs text-gray-500">{log.performedByEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-UG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages} · {meta.total} events
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page === 1}
                    onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page === meta.totalPages}
                    onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}