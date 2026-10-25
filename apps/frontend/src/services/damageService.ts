import { api } from '@/lib/api';
import { DamageReport } from '@/types';

export const damageService = {
  createReport: async (data: {
    equipmentId: number;
    category: string;
    description: string;
    rentalId?: number;
    photoUrl?: string;
  }): Promise<DamageReport> => {
    return api.post<DamageReport>('/damage-reports', data);
  },

  getMyReports: async (): Promise<DamageReport[]> => {
    return api.get<DamageReport[]>('/damage-reports/me');
  },

  getAllReports: async (): Promise<DamageReport[]> => {
    return api.get<DamageReport[]>('/admin/damage-reports');
  },

  updateStatus: async (reportId: number, status: string): Promise<DamageReport> => {
    return api.patch<DamageReport>(`/admin/damage-reports/${reportId}?status=${status}`);
  },
};
