import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSignalR } from '../hooks/useSignalR';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Truck, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { carIcon } from '../components/MapIcons';

export default function AdminDashboard() {
  const { userId, name, role, logout } = useAuthStore();
  const navigate = useNavigate();

  // { [idConductor]: { lat, lng, nombre, placa, estado, lastUpdate } }
  const [flota, setFlota] = useState({});

  const { connectToHub, isConnected, joinAdminGroup, on, off } = useSignalR();

  useEffect(() => {
    if (!userId || role !== 'ADMINISTRADOR') {
      navigate('/');
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    connectToHub();
  }, [connectToHub]);

  useEffect(() => {
    if (isConnected && userId) {
      joinAdminGroup();

      const handleUbicacionGlobal = (data) => {
        // data: { idConductor, nombre, placa, lat, lng, estado, lastUpdate }
        setFlota((prev) => ({
          ...prev,
          [data.idConductor]: data
        }));
      };

      on('RecibirUbicacionGlobal', handleUbicacionGlobal);

      return () => {
        off('RecibirUbicacionGlobal', handleUbicacionGlobal);
      };
    }
  }, [isConnected, userId, joinAdminGroup, on, off]);

  const conductoresTotales = Object.keys(flota).length;
  const conductoresEnViaje = Object.values(flota).filter(c => c.estado === 'Aceptada' || c.estado === 'EnCamino').length;

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-200">
      
      {/* Sidebar Panel */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col z-10 shadow-2xl relative">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500/20 text-purple-400 p-2 rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Centro de Control</h1>
              <p className="text-xs text-slate-400 font-medium">Torre Admin: {name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">
              <Truck size={18} className="text-slate-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{conductoresTotales}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unidades Activas</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">
              <Activity size={18} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-400">{conductoresEnViaje}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">En Servicio</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 flex items-center">
            <Users size={14} className="mr-2"/> Radar de Unidades
          </h2>
          
          {Object.values(flota).length === 0 ? (
            <div className="text-center px-4 py-8 border border-dashed border-slate-700 rounded-xl">
              <p className="text-sm text-slate-500">Esperando señal GPS de la flota...</p>
            </div>
          ) : (
            Object.values(flota).map(c => (
              <div key={c.idConductor} className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 p-4 rounded-xl transition-all cursor-default">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm text-white">{c.nombre}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    c.estado === 'Aceptada' || c.estado === 'EnCamino' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  }`}>
                    {c.estado === 'Aceptada' || c.estado === 'EnCamino' ? 'EN RUTA' : 'LIBRE'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="bg-slate-800 border border-slate-600 px-2 py-1 rounded text-xs font-mono text-slate-300">
                     {c.placa || 'N/A'}
                   </div>
                   <div className="text-[10px] text-slate-500 flex items-center">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                     En línea
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            className="w-full text-sm font-bold bg-slate-900 hover:bg-slate-950 text-slate-400 hover:text-red-400 py-3 rounded-lg border border-slate-700 transition"
          >
            Cerrar Sesión Visual
          </button>
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 relative bg-slate-950">
        {!isConnected && (
           <div className="absolute inset-0 z-[2000] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Activity className="text-purple-500 animate-spin mb-4" size={48} />
              <h2 className="text-xl font-bold text-white mb-1">Iniciando Monitor Táctico</h2>
              <p className="text-slate-400">Conectando a satélites de la flota CraneFlow...</p>
           </div>
        )}

        <MapContainer 
          center={[-12.046374, -77.042793]} // Lima referencial
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Tile Oscuro para modo Admin (Opcional, usando CartoDB Dark Matter si está disponible o OSM por defecto modificado con CSS filter) */}
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-dark"
          />

          {Object.values(flota).map(c => (
            <Marker key={c.idConductor} position={[c.lat, c.lng]} icon={carIcon}>
              <Popup className="admin-popup">
                 <div className="font-sans">
                   <h3 className="font-bold text-slate-800">{c.nombre}</h3>
                   <p className="text-xs text-slate-500 font-mono mb-2">{c.placa}</p>
                   {c.estado === 'Aceptada' || c.estado === 'EnCamino' ? (
                     <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold">Rescatando Vehículo</span>
                   ) : (
                     <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold">Patrullando</span>
                   )}
                 </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Connection Status Overaly */}
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
           <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></div>
           <span className="text-xs font-bold text-slate-300">
             {isConnected ? 'ENLACE SATELITAL ACTIVO' : 'PÉRDIDA DE SEÑAL'}
           </span>
        </div>
      </div>
    </div>
  );
}
