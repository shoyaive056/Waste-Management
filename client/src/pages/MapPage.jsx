import { useEffect, useState } from 'react';
import { Filter, Layers, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import { Card, EmptyState, PRIORITY_COLOR, Spinner } from '../components/ui';

// Admin sees all, citizen sees own, team sees assigned tasks (scoping is done by the API).
export default function MapPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [pr, setPr] = useState('');

  useEffect(() => {
    api
      .complaints({
        pageSize: 10000,
        statusIn: user.role === 'team' ? ['Assigned', 'In Progress'] : undefined,
      })
      .then((r) => setItems(r.items));
  }, [user.role]);

  const shown = items?.filter((c) => !pr || c.priority === pr) || [];
  const base = user.role === 'team' ? '/team/tasks' : `/${user.role}/complaints`;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Waste Incident Map
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time geospatial distribution of municipal waste incidents, reports, and active collection zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Indicators */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs">
            <span className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">Priority:</span>
            {Object.entries(PRIORITY_COLOR).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: v }} />
                <span>{k}</span>
              </span>
            ))}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              className="input w-auto text-xs py-1.5 pl-3 pr-8"
              value={pr}
              onChange={(e) => setPr(e.target.value)}
              aria-label="Priority filter"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <Card className="overflow-hidden p-0 border border-slate-200 shadow-sm">
        {!items ? (
          <div className="py-24">
            <Spinner />
          </div>
        ) : !shown.length ? (
          <div className="py-16">
            <EmptyState
              title="No locations found"
              text="There are no incident coordinates matching the selected filter."
            />
          </div>
        ) : (
          <div className="relative">
            <MapView markers={shown} height={600} detailBase={base} />
            <div className="absolute bottom-4 left-4 z-[400] rounded-lg border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm">
              Displaying {shown.length} {shown.length === 1 ? 'incident' : 'incidents'}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
