import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, ClipboardList, Clock, Download, Timer, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { CategoryChart, MonthlyChart, PriorityChart, StatusChart } from '../../components/Charts';
import { Card, DataTable, Spinner, StatCard, useToast } from '../../components/ui';

export default function Analytics() {
  const toast = useToast();
  const [range, setRange] = useState({ from: '', to: '' });
  const [s, setS] = useState(null);

  useEffect(() => {
    setS(null);
    api.stats(range).then(setS);
  }, [range]);

  const exportCsv = () => {
    if (!s) return;
    const rows = [
      ['Team Performance Summary'],
      ['Team', 'Assigned', 'Resolved', 'Resolution Rate (%)'],
      ...s.teamPerformance.map((t) => [t.team, t.assigned, t.resolved, `${t.rate}%`]),
      [],
      ['Incidents by Category'],
      ['Category', 'Count'],
      ...s.byCategory.map((c) => [c.name, c.value]),
      [],
      ['Monthly Performance Trend'],
      ['Month', 'Received', 'Resolved'],
      ...s.monthly.map((m) => [m.month, m.received, m.resolved]),
    ];

    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
    );
    a.download = `swms-operations-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('Operational report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Range Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Analytics & Executive Reports
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Historical incident volume, resolution turnaround SLAs, and collection crew performance metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs text-xs">
            <span className="font-semibold text-slate-600 px-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-600" />
              Range:
            </span>
            <input
              type="date"
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              aria-label="Start Date"
            />
            <span className="text-slate-600 font-medium">to</span>
            <input
              type="date"
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              aria-label="End Date"
            />
          </div>

          <button
            className="btn-outline text-xs"
            disabled={!s}
            onClick={exportCsv}
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {!s ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Key SLA Indicators */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Incidents Received"
              value={s.total}
              icon={ClipboardList}
              tone="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              label="Successfully Cleared"
              value={s.resolved}
              icon={CheckCircle2}
              tone="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              label="Pending Backlog"
              value={s.pending}
              icon={Clock}
              tone="bg-amber-50 text-amber-700"
            />
            <StatCard
              label="Avg. Turnaround (Days)"
              value={s.avgDays}
              icon={Timer}
              tone="bg-blue-50 text-blue-700"
            />
          </div>

          {/* Analytics Visual Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Incidents by Waste Category">
              <CategoryChart data={s.byCategory} />
            </Card>

            <Card title="Priority Breakdown">
              <PriorityChart data={s.byPriority} />
            </Card>

            <Card title="Monthly Inflow & Resolution Volume">
              <MonthlyChart data={s.monthly} />
            </Card>

            <Card title="Status Distribution">
              <StatusChart data={s.byStatus} />
            </Card>
          </div>

          {/* Collection Team Performance Table */}
          <Card title="Collection Crew Efficiency & SLA Compliance" className="[&>div]:p-0">
            <DataTable
              rows={s.teamPerformance.map((t) => ({ ...t, id: t.team }))}
              columns={[
                {
                  key: 'team',
                  label: 'Collection Crew',
                  render: (t) => <span className="font-semibold text-slate-900">{t.team}</span>,
                },
                {
                  key: 'assigned',
                  label: 'Work Orders Assigned',
                  render: (t) => <span className="font-medium text-slate-700">{t.assigned}</span>,
                },
                {
                  key: 'resolved',
                  label: 'Resolved & Verified',
                  render: (t) => (
                    <span className="font-medium text-emerald-700">{t.resolved}</span>
                  ),
                },
                {
                  key: 'rate',
                  label: 'Resolution Rate',
                  render: (t) => (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, t.rate))}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {t.rate}%
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
