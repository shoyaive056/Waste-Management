import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Clock, Loader, MapPin, Truck, Users, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import MapView from '../../components/MapView';
import ComplaintsTable from '../../components/ComplaintsTable';
import { CategoryChart, MonthlyChart, PriorityChart, ResolvedPendingChart, StatusChart } from '../../components/Charts';
import { Card, Spinner, StatCard } from '../../components/ui';

export default function AdminDashboard() {
  const [s, setS] = useState(null); const [pts, setPts] = useState([]);
  useEffect(() => { api.stats().then(setS); api.complaints({ pageSize: 10000 }).then((r) => setPts(r.items)); }, []);
  if (!s) return <Spinner />;
  return (
    <>
      <div><h1 className="text-2xl font-extrabold">Dashboard</h1><p className="text-sm text-muted">Live overview of waste complaints across the city.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={s.total} icon={ClipboardList} /><StatCard label="Waste locations" value={pts.length} icon={MapPin} />
        <StatCard label="Pending" value={s.pending} icon={Clock} tone="bg-slate-100 text-slate-600" /><StatCard label="In progress" value={s.inProgress} icon={Loader} tone="bg-amber-100 text-amber-700" />
        <StatCard label="Resolved" value={s.resolved} icon={CheckCircle2} tone="bg-green-100 text-green-700" /><StatCard label="Collection teams" value={s.teamsTotal} icon={Truck} />
        <StatCard label="Active teams" value={s.teamsActive} icon={UserCheck} /><StatCard label="Citizens" value={s.citizensTotal} icon={Users} /></div>
      <Card title="Waste location map"><MapView markers={pts} height={380} detailBase="/admin/complaints" /></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Complaints by category"><CategoryChart data={s.byCategory} /></Card><Card title="Complaints by status"><StatusChart data={s.byStatus} /></Card>
        <Card title="Monthly trend"><MonthlyChart data={s.monthly} /></Card><Card title="Priority distribution"><PriorityChart data={s.byPriority} /></Card>
        <Card title="Resolved vs pending" className="lg:col-span-2"><ResolvedPendingChart s={s} /></Card></div>
      <ComplaintsTable title="Recent complaints" base="/admin/complaints" hideFilters compact />
    </>
  );
}
