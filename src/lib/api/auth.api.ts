import Cookies from 'js-cookie';
import apiClient from './client';
import { AuthResponse, LoginCredentials } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);

    // Store the token in a cookie so the request interceptor can attach it
    if (data.accessToken) {
      Cookies.set('token', data.accessToken, { expires: 7 });
    }

    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    Cookies.remove('token');
    Cookies.remove('user');
  },
};