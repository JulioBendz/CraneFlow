import { create } from 'zustand';

// Estado global liviano para la sesión actual
export const useAuthStore = create((set) => ({
  userId: null,
  role: null, // "SOCIO" o "CONDUCTOR"
  name: '',
  placa: '',
  login: (userId, role, name, placa = '') => set({ userId, role, name, placa }),
  logout: () => set({ userId: null, role: null, name: '', placa: '' }),
}));
