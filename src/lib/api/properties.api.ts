import apiClient from './client';
import {
  Property,
  PropertyStats,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  PropertyFilters,
  PaginatedResponse,
} from '@/types';

export const propertiesApi = {
  getAll: async (filters?: PropertyFilters): Promise<PaginatedResponse<Property>> => {
    const { data } = await apiClient.get<PaginatedResponse<Property>>('/properties', {
      params: filters,
    });
    return data;
  },

  getOne: async (id: string): Promise<Property> => {
    const { data } = await apiClient.get<Property>(`/properties/${id}`);
    return data;
  },

  getStats: async (): Promise<PropertyStats> => {
    const { data } = await apiClient.get<PropertyStats>('/properties/stats');
    return data;
  },

  create: async (payload: CreatePropertyPayload): Promise<Property> => {
    const { data } = await apiClient.post<Property>('/properties', payload);
    return data;
  },

  update: async (id: string, payload: UpdatePropertyPayload): Promise<Property> => {
    const { data } = await apiClient.patch<Property>(`/properties/${id}`, payload);
    return data;
  },

  toggleStatus: async (id: string): Promise<Property> => {
    const { data } = await apiClient.patch<Property>(`/properties/${id}/toggle-status`);
    return data;
  },

  restore: async (id: string): Promise<Property> => {
    const { data } = await apiClient.patch<Property>(`/properties/${id}/restore`);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/properties/${id}`);
    return data;
  },
};