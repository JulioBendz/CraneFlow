import L from 'leaflet';

export const blueDotIcon = new L.DivIcon({
  className: 'bg-blue-600 border-2 border-white rounded-full shadow-md w-5 h-5',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export const carIcon = new L.DivIcon({
  className: 'bg-transparent text-3xl flex items-center justify-center drop-shadow-xl',
  html: '🚐', 
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

export const originIcon = new L.DivIcon({
  className: 'bg-emerald-500 rounded-full shadow-lg border-2 border-white w-5 h-5 animate-pulse',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export const destinationIcon = new L.DivIcon({
  className: 'bg-purple-600 rounded-full shadow-lg border-2 border-white w-5 h-5',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});
