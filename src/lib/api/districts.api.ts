import apiClient from './client';
import { District } from '@/types';

export const districtsApi = {
  getAll: async (): Promise<District[]> => {
    const { data } = await apiClient.get<District[]>('/districts');
    return data;
  },
};