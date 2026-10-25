import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';

export const authService = {
  login: async (
    emailOrData: string | { email: string; password: string },
    maybePassword?: string
  ): Promise<AuthResponse> => {
    const payload =
      typeof emailOrData === 'string'
        ? { email: emailOrData, password: maybePassword! }
        : emailOrData;
    const res = await api.post<AuthResponse>('/auth/login', payload);
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('tcet_auth_token', res.token);
      localStorage.setItem('tcet_auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    departmentId?: number;
    studyingYear?: string;
    role: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('tcet_auth_token', res.token);
      localStorage.setItem('tcet_auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tcet_auth_token');
        localStorage.removeItem('tcet_auth_user');
      }
    }
  },

  getMe: async (): Promise<User> => {
    const user = await api.get<User>('/auth/me');
    if (typeof window !== 'undefined') {
      localStorage.setItem('tcet_auth_user', JSON.stringify(user));
    }
    return user;
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem('tcet_auth_user');
    if (!item) return null;
    try {
      return JSON.parse(item) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('tcet_auth_token');
  },
};
