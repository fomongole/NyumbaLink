import apiClient from './client';
import {
  Contact,
  ContactFilters,
  CreateContactPayload,
  UpdateContactPayload,
  PaginatedResponse,
} from '@/types';

export const contactsApi = {
  getAll: async (params?: ContactFilters): Promise<PaginatedResponse<Contact>> => {
    const { data } = await apiClient.get<PaginatedResponse<Contact>>('/contacts', { params });
    return data;
  },

  getOne: async (id: string): Promise<Contact> => {
    const { data } = await apiClient.get<Contact>(`/contacts/${id}`);
    return data;
  },

  create: async (payload: CreateContactPayload): Promise<Contact> => {
    const { data } = await apiClient.post<Contact>('/contacts', payload);
    return data;
  },

  update: async (id: string, payload: UpdateContactPayload): Promise<Contact> => {
    const { data } = await apiClient.patch<Contact>(`/contacts/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/contacts/${id}`);
    return data;
  },
};