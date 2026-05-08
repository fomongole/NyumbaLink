import apiClient from './client';
import {
  Complaint,
  ComplaintStats,
  ComplaintFilters,
  UpdateComplaintStatusPayload,
  PaginatedResponse,
} from '@/types';

export const complaintsApi = {
  getAll: async (filters?: ComplaintFilters): Promise<PaginatedResponse<Complaint>> => {
    const { data } = await apiClient.get<PaginatedResponse<Complaint>>('/complaints', {
      params: filters,
    });
    return data;
  },

  getOne: async (id: string): Promise<Complaint> => {
    const { data } = await apiClient.get<Complaint>(`/complaints/${id}`);
    return data;
  },

  getStats: async (): Promise<ComplaintStats> => {
    const { data } = await apiClient.get<ComplaintStats>('/complaints/stats');
    return data;
  },

  updateStatus: async (
    id: string,
    payload: UpdateComplaintStatusPayload,
  ): Promise<Complaint> => {
    const { data } = await apiClient.patch<Complaint>(
      `/complaints/${id}/status`,
      payload,
    );
    return data;
  },
};