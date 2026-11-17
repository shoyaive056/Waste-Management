import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { api, STATUSES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, DataTable, EmptyState, Pagination, PriorityBadge, SearchBar, Spinner, StatusBadge, fmtDate, useToast } from './ui';

// Reusable list with server-style search, filters, sorting and pagination.
// base = route prefix for the details page. fixed = filters always applied (e.g. team history).
export default function ComplaintsTable({ title, base, fixed = {}, exportable, hideFilters, compact }) {
  const { user } = useAuth(); const nav = useNavigate(); const toast = useToast();
  const [f, setF] = useState({ q: '', status: '', priority: '', categoryId: '', teamId: '', from: '', to: '', location: '', sort: 'newest', page: 1 });
  const [data, setData] = useState(null); const [cats, setCats] = useState([]); const [teams, setTeams] = useState([]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v, page: k === 'page' ? v : 1 }));
  useEffect(() => { api.categories().then(setCats); if (user.role === 'admin') api.teams().then(setTeams); }, [user.role]);
  useEffect(() => { setData(null); api.complaints({ ...f, ...fixed, pageSize: compact ? 5 : 8 }).then(setData); // eslint-disable-next-line
  }, [f]);

  const exportCsv = async () => {
    const all = await api.complaints({ ...f, ...fixed, page: 1, pageSize: 10000 });
    const rows = [['ID', 'Title', 'Citizen', 'Category', 'Address', 'Priority', 'Status', 'Team', 'Created']].concat(all.items.map((c) => [c.id, c.title, c.citizenName, c.categoryName, c.address, c.priority, c.status, c.teamName || '', c.createdAt]));
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'complaints.csv'; a.click(); toast('CSV exported');
  };
  const cols = [
    { key: 'id', label: 'ID', render: (c) => <span className="font-semibold text-brand">{c.id}</span> },
    { key: 'title', label: 'Title', render: (c) => <span className="line-clamp-1 max-w-[220px]">{c.title}</span> },
    { key: 'categoryName', label: 'Category' },
    ...(user.role === 'admin' ? [{ key: 'citizenName', label: 'Citizen' }] : []),
    { key: 'createdAt', label: 'Date', render: (c) => fmtDate(c.createdAt) },
    { key: 'address', label: 'Location' },
    { key: 'priority', label: 'Priority', render: (c) => <PriorityBadge priority={c.priority} /> },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'a', label: 'Action', render: () => <span className="font-semibold text-brand">View</span> },
  ];
  const sel = (k, opts, ph) => <select className="input" value={f[k]} onChange={(e) => set(k, e.target.value)} aria-label={ph}><option value="">{ph}</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;

  return (
    <Card title={title} action={exportable && <button className="btn-outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</button>} className="overflow-hidden [&>div]:p-0">
      {!hideFilters && (
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2"><SearchBar value={f.q} onChange={(v) => set('q', v)} placeholder="Search by ID, title, citizen, category or address" /></div>
          {sel('status', STATUSES.map((s) => [s, s]), 'All statuses')}
          {sel('priority', ['High', 'Medium', 'Low'].map((s) => [s, s]), 'All priorities')}
          {sel('categoryId', cats.map((c) => [c.id, c.name]), 'All categories')}
          {user.role === 'admin' && sel('teamId', teams.map((t) => [t.id, t.name]), 'All teams')}
          <input className="input" placeholder="Location / area" value={f.location} onChange={(e) => set('location', e.target.value)} aria-label="Location" />
          <input type="date" className="input" value={f.from} onChange={(e) => set('from', e.target.value)} aria-label="From date" />
          <input type="date" className="input" value={f.to} onChange={(e) => set('to', e.target.value)} aria-label="To date" />
          {sel('sort', [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['priority', 'Highest priority']], 'Sort')}
        </div>)}
      {!data ? <Spinner /> : <DataTable columns={cols} rows={data.items} onRowClick={(c) => nav(`${base}/${c.id}`)}
        empty={<EmptyState title="No complaints match" text="Try clearing a filter or searching with different words." />} />}
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={(p) => set('page', p)} />}
    </Card>
  );
}
