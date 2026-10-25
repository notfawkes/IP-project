import { api } from '@/lib/api';
import { Department, Room } from '@/types';

export const departmentService = {
  getAllDepartments: async (): Promise<Department[]> => {
    return api.get<Department[]>('/departments');
  },

  getDepartmentById: async (id: number): Promise<Department> => {
    return api.get<Department>(`/departments/${id}`);
  },

  addRoom: async (
    departmentId: number,
    data: { roomNumber: string; roomName?: string; labType?: string; isConfirmed?: boolean }
  ): Promise<Room> => {
    return api.post<Room>(`/departments/${departmentId}/rooms`, data);
  },
};
