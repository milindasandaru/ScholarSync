import { create } from 'zustand';

type Role = 'student' | 'lecturer';

interface AuthStore {
  role: Role;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: 'student',
  setRole: (role) => set({ role }),
}));

interface NotificationStore {
  message: string | null;
  type: 'success' | 'error';
  showNotification: (message: string, type?: 'success' | 'error') => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  message: null,
  type: 'success',
  showNotification: (message, type = 'success') => set({ message, type }),
  clearNotification: () => set({ message: null }),
}));
