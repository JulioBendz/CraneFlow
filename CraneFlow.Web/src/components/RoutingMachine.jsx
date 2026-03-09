import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

export default function RoutingMachine({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;
    if (!start.lat || !start.lng || !end.lat || !end.lng) return;

    // Fix leaflet marker icon issue in React
    delete L.Icon.Default.prototype._getIconUrl;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, // Ocultar el panel de instrucciones textual
      createMarker: () => null // Usaremos nuestros propios marcadores React-Leaflet
    }).addTo(map);

    return () => {
      try {
        map.removeControl(routingControl);
      } catch (e) {
        // En desmontaje rápido puede fallar
      }
    };
  }, [map, start, end]);

  return null;
}
