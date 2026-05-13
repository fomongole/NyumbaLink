import apiClient from './client';
import {
  University,
  CreateUniversityPayload,
  UpdateUniversityPayload,
} from '@/types';

export const universitiesApi = {
  getAll: async (): Promise<University[]> => {
    const { data } = await apiClient.get<University[]>('/universities');
    return data;
  },

  getOne: async (id: string): Promise<University> => {
    const { data } = await apiClient.get<University>(`/universities/${id}`);
    return data;
  },

  create: async (payload: CreateUniversityPayload): Promise<University> => {
    const { data } = await apiClient.post<University>('/universities', payload);
    return data;
  },

  update: async (id: string, payload: UpdateUniversityPayload): Promise<University> => {
    const { data } = await apiClient.patch<University>(`/universities/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/universities/${id}`);
    return data;
  },
};