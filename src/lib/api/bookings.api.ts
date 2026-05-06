import apiClient from './client';
import {
  Booking,
  BookingStats,
  BookingFilters,
  CreateBookingPayload,
  ConfirmBookingPayload,
  CancelBookingPayload,
  PaginatedResponse,
} from '@/types';
 
export const bookingsApi = {
  getAll: async (filters?: BookingFilters): Promise<PaginatedResponse<Booking>> => {
    const { data } = await apiClient.get<PaginatedResponse<Booking>>('/bookings', {
      params: filters,
    });
    return data;
  },
 
  getOne: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
  },
 
  getStats: async (): Promise<BookingStats> => {
    const { data } = await apiClient.get<BookingStats>('/bookings/stats');
    return data;
  },
 
  // Public — called by mobile app, but admin dashboard can also submit test bookings
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await apiClient.post<Booking>('/bookings', payload);
    return data;
  },
 
  confirm: async (id: string, payload?: ConfirmBookingPayload): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/confirm`, payload ?? {});
    return data;
  },
 
  cancel: async (id: string, payload?: CancelBookingPayload): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/cancel`, payload ?? {});
    return data;
  },
 
  complete: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/complete`);
    return data;
  },
};