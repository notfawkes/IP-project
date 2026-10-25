import { api } from '@/lib/api';
import { Photo } from '@/types';

export const photoService = {
  uploadPhoto: async (
    roomId: number,
    file: File | Blob,
    caption?: string,
    isPrimary?: boolean
  ): Promise<Photo> => {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, 'capture.jpg');
    }

    if (caption) {
      formData.append('caption', caption);
    }
    if (isPrimary !== undefined) {
      formData.append('isPrimary', String(isPrimary));
    }

    return api.post<Photo>(`/admin/rooms/${roomId}/photos`, formData);
  },

  getRoomPhotos: async (roomId: number): Promise<Photo[]> => {
    return api.get<Photo[]>(`/rooms/${roomId}/photos`);
  },

  deletePhoto: async (photoId: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/admin/photos/${photoId}`);
  },

  setPrimaryPhoto: async (photoId: number): Promise<Photo> => {
    return api.post<Photo>(`/admin/photos/${photoId}/primary`);
  },
};
