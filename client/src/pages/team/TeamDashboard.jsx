import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, HardHat, Loader2, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ComplaintsTable from '../../components/ComplaintsTable';
import { Card, Spinner, StatCard } from '../../components/ui';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [s, setS] = useState(null);

  useEffect(() => {
    api.stats().then(setS);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
            <HardHat className="h-3.5 w-3.5 text-emerald-400" />
            Field Operations Dispatch
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome, Crew Leader {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Review prioritized collection work orders, record on-site cleanups, and maintain urban hygiene standards.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm self-start sm:self-auto border border-white/10">
          <Truck className="h-5 w-5 text-emerald-400" />
          <div className="text-xs">
            <p className="font-semibold text-white">Active Duty</p>
            <p className="text-emerald-200">Municipal Waste Fleet</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      {!s ? (
        <div className="py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Assigned to Your Crew"
            value={s.total}
            icon={ClipboardList}
            tone="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Open / In Progress"
            value={s.inProgress}
            icon={Loader2}
            tone="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Resolved & Cleared"
            value={s.resolved}
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-700"
          />
        </div>
      )}

      {/* Field Protocols Card */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-emerald-950">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 text-xs">
            <p className="font-semibold text-emerald-900">Standard Operating Protocol</p>
            <p className="text-emerald-800/90 leading-relaxed">
              Upon arriving at an assigned incident site, mark the status as &ldquo;In Progress&rdquo;. Once waste removal is fully verified, submit operational remarks and complete the task.
            </p>
          </div>
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <ComplaintsTable
        title="Active Work Orders (Prioritized)"
        base="/team/tasks"
        fixed={{ statusIn: ['Assigned', 'In Progress'], sort: 'priority' }}
        hideFilters
        compact
      />
    </div>
  );
}
