import apiClient from './client';
import { Landlord, CreateLandlordPayload, UpdateLandlordPayload } from '@/types';

export const landlordsApi = {
  getAll: async (): Promise<Landlord[]> => {
    const { data } = await apiClient.get<Landlord[]>('/landlords');
    return data;
  },

  getOne: async (id: string): Promise<Landlord> => {
    const { data } = await apiClient.get<Landlord>(`/landlords/${id}`);
    return data;
  },

  create: async (payload: CreateLandlordPayload): Promise<Landlord> => {
    const { data } = await apiClient.post<Landlord>('/landlords', payload);
    return data;
  },

  update: async (id: string, payload: UpdateLandlordPayload): Promise<Landlord> => {
    const { data } = await apiClient.patch<Landlord>(`/landlords/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/landlords/${id}`);
    return data;
  },
};