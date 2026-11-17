import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Clock, FilePlus2, Loader } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ComplaintsTable from '../../components/ComplaintsTable';
import { Card, Spinner, StatCard, fmtDateTime } from '../../components/ui';

export default function CitizenDashboard() {
  const { user } = useAuth(); const [s, setS] = useState(null); const [notes, setNotes] = useState([]);
  useEffect(() => { api.stats().then(setS); api.notifications().then((n) => setNotes(n.slice(0, 4))); }, []);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Hello, {user.name.split(' ')[0]}</h1><p className="text-sm text-muted">Here is where your reports stand.</p></div>
        <Link to="/citizen/submit" className="btn-primary"><FilePlus2 className="h-4 w-4" />Report waste</Link></div>
      {!s ? <Spinner /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total reports" value={s.total} icon={ClipboardList} /><StatCard label="Pending" value={s.pending} icon={Clock} tone="bg-slate-100 text-slate-600" />
        <StatCard label="In progress" value={s.inProgress} icon={Loader} tone="bg-amber-100 text-amber-700" /><StatCard label="Resolved" value={s.resolved} icon={CheckCircle2} tone="bg-green-100 text-green-700" /></div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ComplaintsTable title="Recent complaints" base="/citizen/complaints" hideFilters compact /></div>
        <Card title="Latest updates">{notes.length ? <ul className="space-y-3 text-sm">{notes.map((n) => <li key={n.id}><p className={n.read ? '' : 'font-semibold'}>{n.text}</p><p className="text-xs text-muted">{fmtDateTime(n.at)}</p></li>)}</ul> : <p className="text-sm text-muted">No updates yet.</p>}</Card>
      </div>
    </>
  );
}
