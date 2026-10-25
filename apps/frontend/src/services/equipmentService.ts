import { api } from '@/lib/api';
import { Equipment, EquipmentAvailability } from '@/types';

export const equipmentService = {
  getEquipmentById: async (id: number): Promise<Equipment> => {
    return api.get<Equipment>(`/equipment/${id}`);
  },

  createEquipment: async (
    roomId: number,
    data: {
      name: string;
      category: string;
      description?: string;
      modelNumber?: string;
      departmentId: number;
      trackingMode: string;
      totalQuantity: number;
      condition?: string;
      maintenanceStatus?: string;
    }
  ): Promise<Equipment> => {
    return api.post<Equipment>(`/rooms/${roomId}/equipment`, data);
  },

  updateEquipment: async (
    id: number,
    data: Partial<{
      name: string;
      category: string;
      description: string;
      modelNumber: string;
      totalQuantity: number;
      condition: string;
      maintenanceStatus: string;
    }>
  ): Promise<Equipment> => {
    return api.patch<Equipment>(`/equipment/${id}`, data);
  },

  getAvailability: async (id: number): Promise<EquipmentAvailability> => {
    return api.get<EquipmentAvailability>(`/equipment/${id}/availability`);
  },
};
