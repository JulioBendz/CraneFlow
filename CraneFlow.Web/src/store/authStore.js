import { create } from 'zustand';

// Estado global liviano para la sesión actual
export const useAuthStore = create((set) => ({
  userId: null,
  role: null, // "SOCIO" o "CONDUCTOR"
  name: '',
  login: (userId, role, name) => set({ userId, role, name }),
  logout: () => set({ userId: null, role: null, name: '' }),
}));
