import { api } from '@/lib/api';
import { DashboardSummary } from '@/types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    return api.get<DashboardSummary>('/admin/dashboard/summary');
  },
};
