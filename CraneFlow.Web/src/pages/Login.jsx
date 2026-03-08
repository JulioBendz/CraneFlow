import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Car, User } from 'lucide-react';

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('SOCIO');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Simulate an ID assignment
    const generatedId = Math.floor(Math.random() * 1000) + 1;
    login(generatedId, role, name);

    if (role === 'SOCIO') {
      navigate('/socio');
    } else {
      navigate('/conductor');
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Rendimiento como:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('SOCIO')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  role === 'SOCIO'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <User size={24} className="mb-2" />
                <span className="font-medium">Socio</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('CONDUCTOR')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  role === 'CONDUCTOR'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Car size={24} className="mb-2" />
                <span className="font-medium">Conductor</span>
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
