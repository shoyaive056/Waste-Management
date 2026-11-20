import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { PRIORITY_COLOR } from './ui';

const CONAKRY = [9.5370, -13.6785];

export default function MapView({ markers = [], picked, onPick, height = 380, detailBase }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const pin = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: true }).setView(
      picked ? [picked.lat, picked.lng] : CONAKRY,
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    layer.current = L.layerGroup().addTo(map.current);

    if (onPick) {
      map.current.on('click', (e) => {
        onPick({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) });
      });
    }

    return () => {
      map.current?.remove();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();

    markers.forEach((m) => {
      const color = PRIORITY_COLOR[m.priority] || '#16A34A';
      const mk = L.circleMarker([m.lat, m.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).addTo(layer.current);

      const box = document.createElement('div');
      box.className = 'p-1 text-slate-800 font-sans';
      box.innerHTML = `
        <div style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:2px;">${m.id}</div>
        <div style="font-size:11px; font-weight:600; color:#15803d; margin-bottom:4px;">${m.categoryName || 'General Waste'}</div>
        <div style="font-size:11px; color:#475569; margin-bottom:2px;"><strong>Priority:</strong> <span style="color:${color}; font-weight:700;">${m.priority}</span></div>
        <div style="font-size:11px; color:#475569; margin-bottom:2px;"><strong>Status:</strong> ${m.status}</div>
        <div style="font-size:11px; color:#475569; margin-bottom:4px;"><strong>Location:</strong> ${m.address}</div>
        <div style="font-size:10px; color:#94a3b8;">Reported: ${new Date(m.createdAt).toLocaleDateString('en-GB')}</div>
      `;

      if (detailBase) {
        const b = document.createElement('button');
        b.textContent = 'View Incident Details →';
        b.style.cssText =
          'margin-top:8px; display:block; width:100%; text-align:center; background:#166534; color:#ffffff; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px; border:none; cursor:pointer;';
        b.onclick = () => nav(`${detailBase}/${m.id}`);
        box.appendChild(b);
      }

      mk.bindPopup(box);
    });

    if (markers.length && !picked && map.current) {
      map.current.fitBounds(
        markers.map((m) => [m.lat, m.lng]),
        { padding: [35, 35], maxZoom: 14 }
      );
    }
  }, [markers, picked, detailBase, nav]);

  useEffect(() => {
    pin.current?.remove();
    if (picked && map.current) {
      pin.current = L.circleMarker([picked.lat, picked.lng], {
        radius: 11,
        color: '#ffffff',
        weight: 3,
        fillColor: '#166534',
        fillOpacity: 1,
      }).addTo(map.current);
      map.current.setView([picked.lat, picked.lng], Math.max(map.current.getZoom(), 14));
    }
  }, [picked]);

  return (
    <div
      ref={el}
      style={{ height }}
      className="z-0 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner"
      role="region"
      aria-label="Geospatial operations map"
    />
  );
}
