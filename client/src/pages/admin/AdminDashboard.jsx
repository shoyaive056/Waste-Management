import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Truck,
  Users,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import MapView from '../../components/MapView';
import ComplaintsTable from '../../components/ComplaintsTable';
import {
  CategoryChart,
  MonthlyChart,
  PriorityChart,
  ResolvedPendingChart,
  StatusChart,
} from '../../components/Charts';
import { Card, Spinner, StatCard } from '../../components/ui';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [pts, setPts] = useState([]);

  useEffect(() => {
    api.stats().then(setS);
    api.complaints({ pageSize: 10000 }).then((r) => setPts(r.items));
  }, []);

  if (!s) {
    return (
      <div className="py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live Operations Feed
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Operations Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time urban waste monitoring, field crew dispatch telemetry, and incident analytics.
          </p>
        </div>
      </div>

      {/* 8-Metric KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Incidents"
          value={s.total}
          icon={ClipboardList}
          tone="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Geocoded Locations"
          value={pts.length}
          icon={MapPin}
          tone="bg-slate-100 text-slate-700"
        />
        <StatCard
          label="Pending Triage"
          value={s.pending}
          icon={Clock}
          tone="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="In Progress"
          value={s.inProgress}
          icon={Loader2}
          tone="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Resolved Incidents"
          value={s.resolved}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Collection Fleets"
          value={s.teamsTotal}
          icon={Truck}
          tone="bg-indigo-50 text-indigo-700"
        />
        <StatCard
          label="Active Crews on Duty"
          value={s.teamsActive}
          icon={UserCheck}
          tone="bg-teal-50 text-teal-700"
        />
        <StatCard
          label="Registered Citizens"
          value={s.citizensTotal}
          icon={Users}
          tone="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Citywide Incident Map */}
      <Card title="Citywide Incident Geolocation">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <MapView markers={pts} height={400} detailBase="/admin/complaints" />
        </div>
      </Card>

      {/* Visual Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Incidents by Waste Category">
          <CategoryChart data={s.byCategory} />
        </Card>

        <Card title="Incident Status Distribution">
          <StatusChart data={s.byStatus} />
        </Card>

        <Card title="Monthly Inflow & Resolution Volume">
          <MonthlyChart data={s.monthly} />
        </Card>

        <Card title="Priority Breakdown">
          <PriorityChart data={s.byPriority} />
        </Card>

        <Card title="Resolution Efficiency vs. Backlog" className="lg:col-span-2">
          <ResolvedPendingChart s={s} />
        </Card>
      </div>

      {/* Recent Incidents Table */}
      <ComplaintsTable
        title="Recent Incident Feed"
        base="/admin/complaints"
        hideFilters
        compact
      />
    </div>
  );
}
