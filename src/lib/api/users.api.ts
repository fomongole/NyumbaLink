import apiClient from './client';
import {
  User,
  CreateAdminPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '@/types';

export const usersApi = {
  getAll: async (): Promise<Omit<User, 'password'>[]> => {
    const { data } = await apiClient.get('/users');
    return data;
  },

  getMe: async (): Promise<Omit<User, 'password'>> => {
    const { data } = await apiClient.get('/users/me');
    return data;
  },

  createAdmin: async (payload: CreateAdminPayload): Promise<User> => {
    const { data } = await apiClient.post('/users', payload);
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<Omit<User, 'password'>> => {
    const { data } = await apiClient.patch('/users/me', payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.patch('/users/me/password', payload);
    return data;
  },

  toggleActive: async (id: string): Promise<Omit<User, 'password'>> => {
    const { data } = await apiClient.patch(`/users/${id}/toggle-active`);
    return data;
  },
};