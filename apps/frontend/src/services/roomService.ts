import { api } from '@/lib/api';
import { Equipment, KanbanData, Room } from '@/types';

export const roomService = {
  getRoomById: async (roomId: number): Promise<Room> => {
    return api.get<Room>(`/rooms/${roomId}`);
  },

  getRoomEquipment: async (roomId: number): Promise<Equipment[]> => {
    return api.get<Equipment[]>(`/rooms/${roomId}/equipment`);
  },

  getRoomKanban: async (roomId: number): Promise<KanbanData> => {
    return api.get<KanbanData>(`/rooms/${roomId}/kanban`);
  },

  confirmRoom: async (roomId: number): Promise<Room> => {
    return api.post<Room>(`/rooms/${roomId}/confirm`);
  },

  updateRoom: async (
    roomId: number,
    data: { roomName?: string; labType?: string; isConfirmed?: boolean }
  ): Promise<Room> => {
    return api.patch<Room>(`/rooms/${roomId}`, data);
  },
};
