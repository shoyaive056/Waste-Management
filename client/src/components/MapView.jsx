import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { PRIORITY_COLOR } from './ui';

const CONAKRY = [9.5370, -13.6785];
// markers: [{id,lat,lng,priority,category,address,status,createdAt}]; onPick enables click-to-select mode.
export default function MapView({ markers = [], picked, onPick, height = 360, detailBase }) {
  const el = useRef(null); const map = useRef(null); const layer = useRef(null); const pin = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    map.current = L.map(el.current).setView(picked ? [picked.lat, picked.lng] : CONAKRY, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    if (onPick) map.current.on('click', (e) => onPick({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }));
    return () => map.current.remove();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    layer.current.clearLayers();
    markers.forEach((m) => {
      const mk = L.circleMarker([m.lat, m.lng], { radius: 9, color: '#fff', weight: 2, fillColor: PRIORITY_COLOR[m.priority], fillOpacity: 0.95 }).addTo(layer.current);
      const box = document.createElement('div');
      box.innerHTML = `<strong>${m.id}</strong><br/>${m.categoryName}<br/>Priority: <b style="color:${PRIORITY_COLOR[m.priority]}">${m.priority}</b><br/>${m.address}<br/>Status: ${m.status}<br/>Reported: ${new Date(m.createdAt).toLocaleDateString('en-GB')}<br/>`;
      if (detailBase) { const b = document.createElement('button'); b.textContent = 'View details'; b.style.cssText = 'margin-top:6px;color:#166534;font-weight:700;cursor:pointer'; b.onclick = () => nav(`${detailBase}/${m.id}`); box.appendChild(b); }
      mk.bindPopup(box);
    });
    if (markers.length && !picked) map.current.fitBounds(markers.map((m) => [m.lat, m.lng]), { padding: [30, 30], maxZoom: 14 });
  }, [markers, picked, detailBase, nav]);

  useEffect(() => {
    pin.current?.remove();
    if (picked) { pin.current = L.circleMarker([picked.lat, picked.lng], { radius: 10, color: '#fff', weight: 3, fillColor: '#166534', fillOpacity: 1 }).addTo(map.current); map.current.setView([picked.lat, picked.lng], Math.max(map.current.getZoom(), 14)); }
  }, [picked]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-lg border border-slate-200" role="region" aria-label="Map of reported waste locations" />;
}
