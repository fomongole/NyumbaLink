import apiClient from './client';
import { PropertyImage } from '@/types';

export const mediaApi = {
  uploadImages: async (propertyId: string, files: File[]): Promise<PropertyImage[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await apiClient.post<PropertyImage[]>(
      `/properties/${propertyId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  setPrimary: async (propertyId: string, imageId: string): Promise<PropertyImage> => {
    const { data } = await apiClient.patch<PropertyImage>(
      `/properties/${propertyId}/images/${imageId}/set-primary`
    );
    return data;
  },

  deleteImage: async (propertyId: string, imageId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(
      `/properties/${propertyId}/images/${imageId}`
    );
    return data;
  },
};