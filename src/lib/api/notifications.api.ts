import apiClient from './client';
import { BroadcastNotificationPayload } from '@/types';

export const notificationsApi = {
  broadcast: async (payload: BroadcastNotificationPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/notifications/broadcast', payload);
    return data;
  },
};