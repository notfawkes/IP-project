import { api } from '@/lib/api';
import { RentalRequest } from '@/types';

export const requestService = {
  createRequest: async (data: {
    equipmentId: number;
    requestedQuantity: number;
    startTime: string;
    endTime: string;
    purpose: string;
    assetId?: string;
  }): Promise<RentalRequest> => {
    return api.post<RentalRequest>('/requests', data);
  },

  getMyRequests: async (): Promise<RentalRequest[]> => {
    return api.get<RentalRequest[]>('/requests/me');
  },

  getAllRequests: async (status?: string): Promise<RentalRequest[]> => {
    const query = status ? `?status=${status}` : '';
    return api.get<RentalRequest[]>(`/admin/requests${query}`);
  },

  approveRequest: async (requestId: number): Promise<RentalRequest> => {
    return api.post<RentalRequest>(`/admin/requests/${requestId}/approve`);
  },

  rejectRequest: async (requestId: number, reason: string): Promise<RentalRequest> => {
    return api.post<RentalRequest>(`/admin/requests/${requestId}/reject`, { reason });
  },
};
