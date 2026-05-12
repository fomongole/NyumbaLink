import Cookies from 'js-cookie';
import apiClient from './client';
import { AuthResponse, LoginCredentials } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);

    if (data.accessToken) {
      Cookies.set('token', data.accessToken, { expires: 7 });
      // Stamp the login time so middleware can enforce an absolute session ceiling
      Cookies.set('loginTimestamp', Date.now().toString(), { expires: 7 });
    }

    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    Cookies.remove('token');
    Cookies.remove('user');
    Cookies.remove('loginTimestamp');
  },
};