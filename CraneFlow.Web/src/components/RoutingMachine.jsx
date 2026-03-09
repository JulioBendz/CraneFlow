import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

export default function RoutingMachine({ waypoints, onRouteFound, color = '#3b82f6' }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  
  const onRouteFoundRef = useRef(onRouteFound);
  useEffect(() => { onRouteFoundRef.current = onRouteFound; }, [onRouteFound]);

  // Prevenir loop infinito comparando contenido real:
  const waypointsJSON = JSON.stringify(waypoints);

  useEffect(() => {
    const parsedWaypoints = JSON.parse(waypointsJSON);
    if (!parsedWaypoints || parsedWaypoints.length < 2) return;
    const validWaypoints = parsedWaypoints.filter(wp => wp && wp.lat && wp.lng);
    if (validWaypoints.length < 2) return;

    if (!routingControlRef.current) {
      delete L.Icon.Default.prototype._getIconUrl;
      const control = L.Routing.control({
        waypoints: validWaypoints.map(wp => L.latLng(wp.lat, wp.lng)),
        routeWhileDragging: false,
        addWaypoints: false, // Evita puntos arrastrables en la línea azul
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false, 
        lineOptions: { styles: [{ color: color, opacity: 0.9, weight: 6 }] },
        createMarker: () => null
      }).addTo(map);

      control.on('routesfound', function(e) {
        if (e.routes && e.routes.length > 0 && onRouteFoundRef.current) {
          const summary = e.routes[0].summary;
          onRouteFoundRef.current({
            distance: (summary.totalDistance / 1000).toFixed(1),
            time: Math.round(summary.totalTime / 60)
          });
        }
      });
      routingControlRef.current = control;
    } else {
      routingControlRef.current.setWaypoints(validWaypoints.map(wp => L.latLng(wp.lat, wp.lng)));
    }
  }, [map, waypointsJSON, color]);

  useEffect(() => {
    return () => {
      if (routingControlRef.current) {
        try { 
          // OSRM backend can be slow, if component unmounts quickly, it throws removeLayer error. 
          if (map && map.removeControl) {
             // Nullify the map reference inside control to prevent async callbacks from drawing
             const ctrl = routingControlRef.current;
             map.removeControl(ctrl); 
             ctrl._map = null;
          }
        } catch(e) {
          console.log("Safe unmount routing", e);
        }
        routingControlRef.current = null; // FIX REACT 18 STRICT MODE BUG: Must nullify ref so it regenerates on remount
      }
    };
  }, [map]);

  return null;
}
