import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import { Card, EmptyState, PRIORITY_COLOR, Spinner } from '../components/ui';

// Admin sees all, citizen sees own, team sees assigned tasks (scoping is done by the API).
export default function MapPage() {
  const { user } = useAuth(); const [items, setItems] = useState(null); const [pr, setPr] = useState('');
  useEffect(() => { api.complaints({ pageSize: 10000, statusIn: user.role === 'team' ? ['Assigned', 'In Progress'] : undefined }).then((r) => setItems(r.items)); }, [user.role]);
  const shown = items?.filter((c) => !pr || c.priority === pr) || [];
  const base = user.role === 'team' ? '/team/tasks' : `/${user.role}/complaints`;
  return (
    <><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">Waste map</h1>
      <div className="flex items-center gap-4 text-sm">{Object.entries(PRIORITY_COLOR).map(([k, v]) => <span key={k} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: v }} />{k}</span>)}
        <select className="input w-auto" value={pr} onChange={(e) => setPr(e.target.value)} aria-label="Priority filter"><option value="">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select></div></div>
      <Card>{!items ? <Spinner /> : !shown.length ? <EmptyState title="No locations to show" /> : <MapView markers={shown} height={560} detailBase={base} />}</Card></>
  );
}
