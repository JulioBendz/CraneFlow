import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSignalR } from '../hooks/useSignalR';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, CheckCircle2, XCircle, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import RoutingMachine from '../components/RoutingMachine';
import { blueDotIcon, originIcon, destinationIcon, carIcon } from '../components/MapIcons';

export default function SocioDashboard() {
  const { userId, name, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  
  // Interactive Map State
  const [origenPos, setOrigenPos] = useState(null); // {lat, lng}
  const [destinoPos, setDestinoPos] = useState(null); // {lat, lng}
  const [mapMode, setMapMode] = useState('origen'); // 'origen' o 'destino'

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ubicacionConductor, setUbicacionConductor] = useState(null);

  // Routig Summaries
  const [routeSummary, setRouteSummary] = useState(null);
  const [trackingSummary, setTrackingSummary] = useState(null);

  // Parse location string from DB: "lat:lng|Address" or just "Address"
  const parseLocData = (str) => {
    if (!str) return { lat: null, lng: null, text: '' };
    const parts = str.split('|');
    if (parts.length === 2 && parts[0].includes(':')) {
       const coords = parts[0].split(':');
       return { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]), text: parts[1] };
    }
    return { lat: null, lng: null, text: str };
  };

  // Click handler map component
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        if (mapMode === 'origen') {
          setOrigenPos(e.latlng);
        } else if (mapMode === 'destino') {
          setDestinoPos(e.latlng);
        }
      },
    });
    return null;
  };

  const { connectToHub, isConnected, joinSocioGroup, on, off } = useSignalR();

  useEffect(() => {
    if (!userId || role !== 'SOCIO') {
      navigate('/');
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    connectToHub();
  }, [connectToHub]);

  useEffect(() => {
    if (isConnected && userId) {
      joinSocioGroup(userId);

      const handleSolicitudActualizada = (solicitudActualizada) => {
        console.log("Actualización recibida:", solicitudActualizada);
        if (solicitud && solicitud.id === solicitudActualizada.id) {
          setSolicitud(solicitudActualizada);
        }
      };

      const handleUbicacion = (lat, lng) => {
        setUbicacionConductor({ lat, lng });
      };

      on('SolicitudActualizada', handleSolicitudActualizada);
      on('RecibirUbicacion', handleUbicacion);

      return () => {
        off('SolicitudActualizada', handleSolicitudActualizada);
        off('RecibirUbicacion', handleUbicacion);
      };
    }
  }, [isConnected, userId, joinSocioGroup, on, off, solicitud]);

  // Obtener Ubicación automáticamente
  useEffect(() => {
    if (!solicitud && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOrigenPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setOrigen("Ubicación Actual (GPS)");
        },
        (err) => {
          console.log("No se pudo obtener GPS, usando Lima como default");
          setOrigenPos({ lat: -12.046374, lng: -77.042793 });
          setError("No se pudo leer tu GPS. Ubica el marcador manualmente.");
        }
      );
    }
  }, [solicitud]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origenPos) {
      setError('Debes colocar el marcador de Origen en el mapa, es obligatorio.');
      return;
    }

    setLoading(true);
    setError('');

    // Format for DB
    const finalOrigen = `${origenPos.lat}:${origenPos.lng}|${origen || 'GPS Marcado'}`;
    const finalDestino = destinoPos ? `${destinoPos.lat}:${destinoPos.lng}|${destino || 'Destino Marcado'}` : destino || 'Sin especificar';

    try {
      const response = await apiClient.post('/SolicitudGrua', {
        idSocio: userId,
        ubicacionOrigen: finalOrigen,
        ubicacionDestino: finalDestino,
        usuarioSolicitante: name
      });

      if (response.success) {
        // Optimistic UI Data
        setSolicitud({
          id: response.data,
          estado: 'Pendiente',
          ubicacionOrigen: finalOrigen,
          ubicacionDestino: finalDestino
        });
      }
    } catch (err) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'Pendiente': return <div className="flex items-center text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full"><Clock size={16} className="mr-2"/> Pendiente</div>;
      case 'Aceptada': return <div className="flex items-center text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full"><CheckCircle2 size={16} className="mr-2"/> Aceptada</div>;
      case 'EnCamino': return <div className="flex items-center text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full"><Navigation size={16} className="mr-2"/> En Camino</div>;
      case 'Finalizada': return <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full"><CheckCircle2 size={16} className="mr-2"/> Finalizada</div>;
      default: return <div className="flex items-center text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full">{estado}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Socio</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Hola, {name}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-400 hover:text-red-300 transition">Salir</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-start">
            <XCircle className="shrink-0 mr-3" />
            <p>{error}</p>
          </div>
        )}

        {!solicitud || solicitud.estado === 'Finalizada' || solicitud.estado === 'Cancelada' ? (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h2 className="text-xl font-semibold text-white mb-6">Solicitar Nueva Grúa</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Origen (Requerido)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-500" size={20} />
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Ej. Av. Principal 123"
                      value={origen}
                      onChange={(e) => setOrigen(e.target.value)}
                      onClick={() => setMapMode('origen')}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Haz click en el mapa con el puntero rojo para trazar la grúa y permitir al conductor trazar la ruta inteligente.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Destino (Opcional)</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 text-slate-500" size={20} />
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Ej. Taller Mecánico, opcional."
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                      onClick={() => setMapMode('destino')}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Haz click en el mapa con el puntero azul para trazar el punto de desembarque de la grúa.</p>
                </div>
              </div>

              {/* INTERACTIVE MAP FOR ROUTING PLANNING */}
              <div className="mt-4 rounded-xl overflow-hidden border-2 border-slate-700 h-64 bg-slate-900 relative">
                {origenPos ? (
                <MapContainer center={[origenPos.lat, origenPos.lng]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker />

                  {/* Marker de Origen Draggeable */}
                  {origenPos && (
                    <Marker 
                      position={origenPos} 
                      draggable={true} 
                      eventHandlers={{ dragend: (e) => setOrigenPos(e.target.getLatLng()) }}
                      icon={originIcon}
                    />
                  )}

                  {/* Marker de Destino Draggeable */}
                  {destinoPos && (
                    <Marker 
                      position={destinoPos} 
                      draggable={true} 
                      eventHandlers={{ dragend: (e) => setDestinoPos(e.target.getLatLng()) }}
                      icon={destinationIcon}
                    />
                  )}

                  {/* Smart Routing via Leaflet Routing Machine si existen ambos */}
                  {(origenPos && destinoPos) && (
                     <RoutingMachine 
                        waypoints={[origenPos, destinoPos]} 
                        onRouteFound={setRouteSummary} 
                        color="#3b82f6" 
                     />
                  )}
                </MapContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-500">
                    <Crosshair className="animate-spin mb-2" size={24} /> Obteniendo GPS...
                  </div>
                )}
                
                {/* Route Summary */}
                {routeSummary && mapMode !== 'origen' && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-indigo-500/50 text-white px-4 py-2 rounded-xl shadow-2xl z-[1000] flex gap-4 text-sm font-bold items-center">
                    <span className="flex items-center text-amber-400"><Clock size={16} className="mr-1"/> {routeSummary.time} min</span>
                    <div className="w-px h-5 bg-slate-600"></div>
                    <span className="flex items-center text-indigo-400"><Navigation size={16} className="mr-1"/> {routeSummary.distance} km</span>
                  </div>
                )}

                {/* Control Panel Over Map */}
                <div className="absolute top-2 right-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg p-2 flex gap-2 z-[1000] shadow-xl">
                   <button type="button" onClick={() => setMapMode('origen')} className={`px-3 py-1.5 text-xs font-bold rounded ${mapMode === 'origen' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>📍 Fijar Origen</button>
                   <button type="button" onClick={() => setMapMode('destino')} className={`px-3 py-1.5 text-xs font-bold rounded ${mapMode === 'destino' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>🏁 Fijar Destino</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-lg shadow-blue-500/20 flex justify-center items-center"
              >
                {loading ? 'Procesando...' : !isConnected ? 'Conectando servicio...' : 'Solicitar Grúa Ahora'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden mt-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Solicitud Activa #{solicitud.id}</h2>
                <p className="text-sm text-slate-400 mt-1">Sigue el estado de tu servicio en tiempo real</p>
              </div>
              {getStatusBadge(solicitud.estado)}
            </div>

            {solicitud.estado !== 'Pendiente' && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-6">
                <p className="text-sm text-slate-400 mb-1">Conductor Asignado</p>
                <div className="flex items-center mt-2">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mr-3">
                    {solicitud.nombreConductor ? solicitud.nombreConductor[0] : 'C'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{solicitud.nombreConductor || 'Conductor asignado'}</p>
                    <p className="text-sm text-slate-400">Placa: <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded">{solicitud.placaGrua || '---'}</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Origen</p>
                  <p className="text-white font-medium">{parseLocData(solicitud.ubicacionOrigen).text}</p>
                </div>
              </div>
              <div className="w-0.5 h-6 bg-slate-700 ml-4"></div>
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                  <Navigation size={16} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Destino</p>
                  <p className="text-white font-medium">{parseLocData(solicitud.ubicacionDestino).text}</p>
                </div>
              </div>
            </div>

            {(solicitud.estado === 'Aceptada' || solicitud.estado === 'EnCamino') && (
              <div className="mt-6 mb-6 rounded-xl overflow-hidden border border-slate-700 h-64 bg-slate-800">
                {!ubicacionConductor ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-500">
                    <Clock className="animate-spin mb-2" size={24} />
                    <p className="text-sm">Esperando GPS del conductor...</p>
                  </div>
                ) : (
                  <MapContainer center={[ubicacionConductor.lat, ubicacionConductor.lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <Marker position={[ubicacionConductor.lat, ubicacionConductor.lng]} icon={carIcon}>
                      <Popup>La grúa de {solicitud.nombreConductor} está aquí.</Popup>
                    </Marker>
                    
                    {parseLocData(solicitud.ubicacionOrigen).lat && (
                      <Marker position={[parseLocData(solicitud.ubicacionOrigen).lat, parseLocData(solicitud.ubicacionOrigen).lng]} icon={originIcon}>
                        <Popup>Tu ubicación de origen.</Popup>
                      </Marker>
                    )}

                    {parseLocData(solicitud.ubicacionDestino).lat && (
                      <Marker position={[parseLocData(solicitud.ubicacionDestino).lat, parseLocData(solicitud.ubicacionDestino).lng]} icon={destinationIcon}>
                        <Popup>Destino Final.</Popup>
                      </Marker>
                    )}

                    {/* Trazado Inteligente Completo: Conductor -> Socio -> Destino */}
                    {parseLocData(solicitud.ubicacionDestino).lat ? (
                       <RoutingMachine 
                          waypoints={[
                            ubicacionConductor, 
                            {lat: parseLocData(solicitud.ubicacionOrigen).lat, lng: parseLocData(solicitud.ubicacionOrigen).lng},
                             {lat: parseLocData(solicitud.ubicacionDestino).lat, lng: parseLocData(solicitud.ubicacionDestino).lng}
                          ]}
                          onRouteFound={setTrackingSummary}
                          color="#10b981"
                       />
                    ) : (
                       <RoutingMachine 
                          waypoints={[
                            ubicacionConductor, 
                            {lat: parseLocData(solicitud.ubicacionOrigen).lat, lng: parseLocData(solicitud.ubicacionOrigen).lng}
                          ]}
                          onRouteFound={setTrackingSummary}
                          color="#10b981"
                       />
                    )}
                  </MapContainer>
                )}
                
                {/* Tracking Route Summary */}
                {trackingSummary && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-emerald-500/50 text-white px-4 py-2 rounded-xl shadow-2xl z-[1000] flex gap-4 text-sm font-bold items-center">
                    <span className="flex items-center text-amber-400"><Clock size={16} className="mr-1.5"/> ETA: {trackingSummary.time} min</span>
                    <div className="w-px h-5 bg-slate-600"></div>
                    <span className="flex items-center text-emerald-400"><Navigation size={16} className="mr-1.5"/> {trackingSummary.distance} km</span>
                  </div>
                )}
              </div>
            )}
            
            {(solicitud.estado === 'Aceptada' || solicitud.estado === 'EnCamino') && (
              <button
                onClick={() => setSolicitud({...solicitud, estado: 'Finalizada'})} // MOCK logic for testing UI easily
                className="mt-8 w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg px-4 py-2 transition-colors border border-slate-600"
              >
                Simular Finalización (Solo Demo)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
