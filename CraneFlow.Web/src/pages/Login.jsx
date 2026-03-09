import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Car, User, ShieldAlert } from 'lucide-react';

import apiClient from '../api/apiClient';

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('SOCIO');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const resp = await apiClient.post('/Auth/login', {
        nombre: name,
        role: role
      });

      if (resp.success) {
        const generatedId = resp.data.id; // El verdadero ID en la BD
        const placa = resp.data.placa || '';
        login(generatedId, role, name, placa);

        if (role === 'SOCIO') {
          navigate('/socio');
        } else if (role === 'CONDUCTOR') {
          navigate('/conductor');
        } else if (role === 'ADMINISTRADOR') {
          navigate('/admin');
        }
      }
    } catch (e) {
      alert("Error al iniciar sesión: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">CraneFlow</h1>
          <p className="text-slate-400">Ingreso al sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tu Nombre</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ingresar como:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole('SOCIO')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  role === 'SOCIO'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <User size={20} className="mb-2" />
                <span className="text-sm font-medium">Socio</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('CONDUCTOR')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  role === 'CONDUCTOR'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Car size={20} className="mb-2" />
                <span className="text-sm font-medium">Conductor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMINISTRADOR')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  role === 'ADMINISTRADOR'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <ShieldAlert size={20} className="mb-2" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-lg shadow-blue-500/30"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
