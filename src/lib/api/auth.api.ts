import apiClient from './client';
import { AuthResponse, LoginCredentials } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Server now sets the httpOnly cookie; response only contains { user: ... }
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    // Server clears the httpOnly cookie and blacklists the token
    await apiClient.post('/auth/logout');
  },
};