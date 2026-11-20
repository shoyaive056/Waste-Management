import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { api, STATUSES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  DataTable,
  EmptyState,
  Pagination,
  PriorityBadge,
  SearchBar,
  Spinner,
  StatusBadge,
  fmtDate,
  useToast,
} from './ui';

export default function ComplaintsTable({ title, base, fixed = {}, exportable, hideFilters, compact }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({
    q: '',
    status: '',
    priority: '',
    categoryId: '',
    teamId: '',
    from: '',
    to: '',
    location: '',
    sort: 'newest',
    page: 1,
  });
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v, page: k === 'page' ? v : 1 }));

  useEffect(() => {
    api.categories().then(setCats);
    if (user.role === 'admin') api.teams().then(setTeams);
  }, [user.role]);

  useEffect(() => {
    setData(null);
    api.complaints({ ...f, ...fixed, pageSize: compact ? 5 : 8 }).then(setData);
    // eslint-disable-next-line
  }, [f]);

  const exportCsv = async () => {
    try {
      const all = await api.complaints({ ...f, ...fixed, page: 1, pageSize: 10000 });
      const rows = [
        ['Incident ID', 'Title', 'Citizen', 'Category', 'Address', 'Priority', 'Status', 'Assigned Team', 'Created At'],
      ].concat(
        all.items.map((c) => [
          c.id,
          c.title,
          c.citizenName,
          c.categoryName,
          c.address,
          c.priority,
          c.status,
          c.teamName || 'Unassigned',
          c.createdAt,
        ])
      );
      const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `swms-incidents-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast('Operational data exported to CSV');
    } catch {
      toast('Failed to export CSV', 'error');
    }
  };

  const cols = [
    {
      key: 'id',
      label: 'Incident ID',
      render: (c) => (
        <span className="font-mono text-xs font-bold text-brand-800 bg-brand-50/60 px-2 py-0.5 rounded border border-brand-200/60">
          {c.id}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title & Summary',
      render: (c) => (
        <div className="max-w-[240px]">
          <p className="font-semibold text-slate-900 truncate leading-snug">{c.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{c.categoryName}</p>
        </div>
      ),
    },
    ...(user.role === 'admin'
      ? [
          {
            key: 'citizenName',
            label: 'Reported By',
            render: (c) => <span className="font-medium text-slate-700 text-xs">{c.citizenName || 'Citizen'}</span>,
          },
        ]
      : []),
    {
      key: 'createdAt',
      label: 'Date',
      render: (c) => <span className="text-xs text-slate-600 font-medium">{fmtDate(c.createdAt)}</span>,
    },
    {
      key: 'address',
      label: 'Location / Zone',
      render: (c) => <span className="text-xs text-slate-600 truncate max-w-[150px] inline-block">{c.address}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (c) => <PriorityBadge priority={c.priority} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'action',
      label: 'Action',
      render: () => (
        <span className="text-xs font-bold text-brand-800 hover:text-brand-900 hover:underline">
          View Details →
        </span>
      ),
    },
  ];

  return (
    <Card
      title={title}
      subtitle={compact ? 'Most recent incident filings' : 'Filtered operations registry'}
      action={
        <div className="flex items-center gap-2">
          {!hideFilters && (
            <button
              onClick={() => setFilterExpanded(!filterExpanded)}
              className={`btn-outline text-xs px-2.5 py-1.5 sm:hidden ${filterExpanded ? 'bg-slate-100' : ''}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
          )}
          {exportable && (
            <button className="btn-outline text-xs px-3 py-1.5" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </button>
          )}
        </div>
      }
      className="overflow-hidden [&>div]:p-0"
    >
      {!hideFilters && (
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <SearchBar
                value={f.q}
                onChange={(v) => set('q', v)}
                placeholder="Search by ID, keyword, address, or reporter…"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="input text-xs py-2 w-full sm:w-36"
                value={f.status}
                onChange={(e) => set('status', e.target.value)}
                aria-label="Filter status"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="input text-xs py-2 w-full sm:w-32"
                value={f.priority}
                onChange={(e) => set('priority', e.target.value)}
                aria-label="Filter priority"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Advanced filters row on desktop or expandable on mobile */}
          <div className={`grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5 text-xs ${filterExpanded ? 'grid' : 'hidden sm:grid'}`}>
            <select
              className="input text-xs py-1.5"
              value={f.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              aria-label="Filter category"
            >
              <option value="">All Categories</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {user.role === 'admin' && (
              <select
                className="input text-xs py-1.5"
                value={f.teamId}
                onChange={(e) => set('teamId', e.target.value)}
                aria-label="Filter team"
              >
                <option value="">All Collection Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              className="input text-xs py-1.5"
              value={f.from}
              onChange={(e) => set('from', e.target.value)}
              aria-label="From date"
            />
            <input
              type="date"
              className="input text-xs py-1.5"
              value={f.to}
              onChange={(e) => set('to', e.target.value)}
              aria-label="To date"
            />

            <select
              className="input text-xs py-1.5"
              value={f.sort}
              onChange={(e) => set('sort', e.target.value)}
              aria-label="Sort order"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest Priority</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Table or Card List */}
      {!data ? (
        <Spinner label="Loading records…" />
      ) : (
        <DataTable
          columns={cols}
          rows={data.items}
          onRowClick={(c) => nav(`${base}/${c.id}`)}
          empty={
            <EmptyState
              title="No incidents match criteria"
              text="Adjust search keywords, clear filter tags, or select a broader date range."
            />
          }
        />
      )}

      {data && (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onChange={(p) => set('page', p)}
        />
      )}
    </Card>
  );
}
