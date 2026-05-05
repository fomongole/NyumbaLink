import apiClient from './client';
import { AuditLog, AuditLogFilters, PaginatedResponse } from '@/types';

export const auditLogsApi = {
  getAll: async (filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', {
      params: filters,
    });
    return data;
  },
};