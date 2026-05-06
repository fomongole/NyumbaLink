import apiClient from './client';
import {
  District,
  CreateDistrictPayload,
  UpdateDistrictPayload,
} from '@/types';
 
export const districtsApi = {
  getAll: async (): Promise<District[]> => {
    const { data } = await apiClient.get<District[]>('/districts');
    return data;
  },
 
  getOne: async (id: string): Promise<District> => {
    const { data } = await apiClient.get<District>(`/districts/${id}`);
    return data;
  },
 
  create: async (payload: CreateDistrictPayload): Promise<District> => {
    const { data } = await apiClient.post<District>('/districts', payload);
    return data;
  },
 
  update: async (id: string, payload: UpdateDistrictPayload): Promise<District> => {
    const { data } = await apiClient.patch<District>(`/districts/${id}`, payload);
    return data;
  },
 
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/districts/${id}`);
    return data;
  },
};