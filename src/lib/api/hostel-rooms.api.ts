import apiClient from './client';
import {
  HostelRoom,
  HostelRoomStats,
  CreateHostelRoomPayload,
  UpdateHostelRoomPayload,
  UpdateRoomStatusPayload,
} from '@/types';
 
export const hostelRoomsApi = {
  getAll: async (propertyId: string): Promise<HostelRoom[]> => {
    const { data } = await apiClient.get<HostelRoom[]>(
      `/properties/${propertyId}/rooms`,
    );
    return data;
  },
 
  getStats: async (propertyId: string): Promise<HostelRoomStats> => {
    const { data } = await apiClient.get<HostelRoomStats>(
      `/properties/${propertyId}/rooms/stats`,
    );
    return data;
  },
 
  getOne: async (propertyId: string, roomId: string): Promise<HostelRoom> => {
    const { data } = await apiClient.get<HostelRoom>(
      `/properties/${propertyId}/rooms/${roomId}`,
    );
    return data;
  },
 
  create: async (
    propertyId: string,
    payload: CreateHostelRoomPayload,
  ): Promise<HostelRoom> => {
    const { data } = await apiClient.post<HostelRoom>(
      `/properties/${propertyId}/rooms`,
      payload,
    );
    return data;
  },
 
  update: async (
    propertyId: string,
    roomId: string,
    payload: UpdateHostelRoomPayload,
  ): Promise<HostelRoom> => {
    const { data } = await apiClient.patch<HostelRoom>(
      `/properties/${propertyId}/rooms/${roomId}`,
      payload,
    );
    return data;
  },
 
  updateStatus: async (
    propertyId: string,
    roomId: string,
    payload: UpdateRoomStatusPayload,
  ): Promise<HostelRoom> => {
    const { data } = await apiClient.patch<HostelRoom>(
      `/properties/${propertyId}/rooms/${roomId}/status`,
      payload,
    );
    return data;
  },
 
  delete: async (
    propertyId: string,
    roomId: string,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(
      `/properties/${propertyId}/rooms/${roomId}`,
    );
    return data;
  },
};