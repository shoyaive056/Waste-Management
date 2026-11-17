import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../services/api';
import { CategoryChart, MonthlyChart, PriorityChart, StatusChart } from '../../components/Charts';
import { Card, DataTable, Spinner, StatCard, useToast } from '../../components/ui';
import { CheckCircle2, ClipboardList, Clock, Timer } from 'lucide-react';

export default function Analytics() {
  const toast = useToast(); const [range, setRange] = useState({ from: '', to: '' }); const [s, setS] = useState(null);
  useEffect(() => { setS(null); api.stats(range).then(setS); }, [range]);
  const exportCsv = () => {
    const rows = [['Team', 'Assigned', 'Resolved', 'Resolution rate %'], ...s.teamPerformance.map((t) => [t.team, t.assigned, t.resolved, t.rate]), [], ['Category', 'Complaints'], ...s.byCategory.map((c) => [c.name, c.value]), [], ['Month', 'Received', 'Resolved'], ...s.monthly.map((m) => [m.month, m.received, m.resolved])];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })); a.download = 'waste-statistics.csv'; a.click(); toast('Report exported');
  };
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3"><h1 className="text-2xl font-extrabold">Analytics & reports</h1>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-muted">From<input type="date" className="input mt-1" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
          <label className="text-xs font-semibold text-muted">To<input type="date" className="input mt-1" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
          <button className="btn-outline" disabled={!s} onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</button></div></div>
      {!s ? <Spinner /> : <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Received" value={s.total} icon={ClipboardList} /><StatCard label="Resolved" value={s.resolved} icon={CheckCircle2} tone="bg-green-100 text-green-700" />
          <StatCard label="Pending" value={s.pending} icon={Clock} tone="bg-slate-100 text-slate-600" /><StatCard label="Avg. resolution (days)" value={s.avgDays} icon={Timer} tone="bg-amber-100 text-amber-700" /></div>
        <div className="grid gap-6 lg:grid-cols-2"><Card title="By category"><CategoryChart data={s.byCategory} /></Card><Card title="By priority"><PriorityChart data={s.byPriority} /></Card>
          <Card title="Monthly collection performance"><MonthlyChart data={s.monthly} /></Card><Card title="By status"><StatusChart data={s.byStatus} /></Card></div>
        <Card title="Team performance" className="[&>div]:p-0"><DataTable rows={s.teamPerformance.map((t) => ({ ...t, id: t.team }))} columns={[{ key: 'team', label: 'Team' }, { key: 'assigned', label: 'Assigned' }, { key: 'resolved', label: 'Resolved' }, { key: 'rate', label: 'Resolution rate', render: (t) => `${t.rate}%` }]} /></Card></>}
    </>
  );
}
