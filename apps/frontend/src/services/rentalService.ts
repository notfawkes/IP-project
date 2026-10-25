import { api } from '@/lib/api';
import { Rental, ReturnRecord } from '@/types';

export const rentalService = {
  getMyRentals: async (): Promise<Rental[]> => {
    return api.get<Rental[]>('/rentals/me');
  },

  getAllRentals: async (status?: string): Promise<Rental[]> => {
    const query = status ? `?status=${status}` : '';
    return api.get<Rental[]>(`/admin/rentals${query}`);
  },

  getOverdueRentals: async (): Promise<Rental[]> => {
    return api.get<Rental[]>('/admin/rentals/overdue');
  },

  issueRental: async (rentalId: number): Promise<Rental> => {
    return api.post<Rental>(`/admin/rentals/${rentalId}/issue`);
  },

  recordReturn: async (
    rentalId: number,
    data: { returnCondition: string; notes?: string }
  ): Promise<ReturnRecord> => {
    return api.post<ReturnRecord>(`/rentals/${rentalId}/return`, data);
  },

  getMyReturns: async (): Promise<ReturnRecord[]> => {
    return api.get<ReturnRecord[]>('/returns/me');
  },
};
