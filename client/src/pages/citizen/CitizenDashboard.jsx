import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Clock, FilePlus2, Loader2, Bell, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ComplaintsTable from '../../components/ComplaintsTable';
import { Card, Spinner, StatCard, fmtDateTime } from '../../components/ui';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [s, setS] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.stats().then(setS);
    api.notifications().then((n) => setNotes(n.slice(0, 5)));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Citizen Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-emerald-100/80 max-w-xl">
            Report municipal waste issues, track resolution timelines, and help keep your community clean.
          </p>
        </div>

        <Link
          to="/citizen/submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900 shrink-0"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>Report Waste Issue</span>
        </Link>
      </div>

      {/* KPI Stats */}
      {!s ? (
        <div className="py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Submitted"
            value={s.total}
            icon={ClipboardList}
            tone="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Pending Review"
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
            label="Resolved"
            value={s.resolved}
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-700"
          />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <ComplaintsTable
            title="Recent Incident Reports"
            base="/citizen/complaints"
            hideFilters
            compact
          />
        </div>

        <div className="space-y-6">
          <Card
            title="Latest Updates"
            action={
              <Link
                to="/citizen/notifications"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {notes.length ? (
              <ul className="divide-y divide-slate-100 -my-2">
                {notes.map((n) => (
                  <li key={n.id} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read ? 'bg-slate-300' : 'bg-emerald-500 ring-2 ring-emerald-200'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-snug ${n.read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
                          {n.text}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-600">
                          {fmtDateTime(n.at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-slate-600">
                <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">No updates yet</p>
                <p className="text-xs text-slate-600">Notifications on your reports will appear here.</p>
              </div>
            )}
          </Card>

          {/* Quick Notice Card */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-emerald-950">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-emerald-900">Emergency & Hazardous Waste</p>
                <p className="text-emerald-800/90 leading-relaxed">
                  For immediate chemical spills, biohazards, or blocked drainage emergencies, please mark severity as &ldquo;High&rdquo; and specify the landmark clearly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
