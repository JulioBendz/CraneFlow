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

export const pickingOriginIcon = new L.DivIcon({
  className: 'bg-transparent flex items-center justify-center',
  html: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 drop-shadow-lg text-emerald-500">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
         </svg>`, 
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

export const pickingDestinationIcon = new L.DivIcon({
  className: 'bg-transparent flex items-center justify-center',
  html: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 drop-shadow-lg text-indigo-500">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
         </svg>`, 
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});
