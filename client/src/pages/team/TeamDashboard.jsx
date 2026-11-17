import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Loader } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ComplaintsTable from '../../components/ComplaintsTable';
import { Spinner, StatCard } from '../../components/ui';

export default function TeamDashboard() {
  const { user } = useAuth(); const [s, setS] = useState(null);
  useEffect(() => { api.stats().then(setS); }, []);
  return (
    <><div><h1 className="text-2xl font-extrabold">Hello, {user.name.split(' ')[0]}</h1><p className="text-sm text-muted">Your team's tasks at a glance.</p></div>
      {!s ? <Spinner /> : <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Assigned to your team" value={s.total} icon={ClipboardList} />
        <StatCard label="Open tasks" value={s.inProgress} icon={Loader} tone="bg-amber-100 text-amber-700" /><StatCard label="Completed" value={s.resolved} icon={CheckCircle2} tone="bg-green-100 text-green-700" /></div>}
      <ComplaintsTable title="Open tasks" base="/team/tasks" fixed={{ statusIn: ['Assigned', 'In Progress'], sort: 'priority' }} hideFilters compact /></>
  );
}
