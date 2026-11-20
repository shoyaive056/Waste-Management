import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Truck,
  User,
  AlertTriangle,
} from 'lucide-react';
import { api, STATUSES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import {
  BackLink,
  Card,
  EmptyState,
  ErrorBox,
  PriorityBadge,
  Spinner,
  StatusBadge,
  fmtDateTime,
  useToast,
} from '../components/ui';

export default function ComplaintDetails({ back }) {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [c, setC] = useState(null);
  const [teams, setTeams] = useState([]);
  const [err, setErr] = useState('');
  const [loadErr, setLoadErr] = useState('');
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [note, setNote] = useState('');
  const [team, setTeam] = useState('');

  const load = useCallback(
    () => api.complaint(id).then(setC).catch((e) => setLoadErr(e.message)),
    [id]
  );

  useEffect(() => {
    load();
    if (user.role === 'admin') {
      api.teams().then(setTeams);
    }
  }, [load, user.role]);

  const run = async (fn, msg) => {
    try {
      setErr('');
      setC(await fn());
      toast(msg);
      setRemarks('');
      setNote('');
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loadErr) {
    return (
      <div className="space-y-4">
        <BackLink to={back}>Back</BackLink>
        <EmptyState title="Unable to open incident report" text={loadErr} />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="py-20">
        <Spinner />
      </div>
    );
  }

  const mine = user.role === 'team' && c.teamId === user.teamId;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="space-y-3">
        <BackLink to={back}>Back to Incident List</BackLink>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Incident #{c.id}
              </span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {c.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="h-4 w-4 text-slate-600" />
            <span>Reported {fmtDateTime(c.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Details, Map, Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Incident Overview Card */}
          <Card title="Incident Details">
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                <dt className="text-xs font-medium text-slate-600">Waste Category</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{c.categoryName}</dd>
              </div>

              <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                <dt className="text-xs font-medium text-slate-600">Reported By</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-600" />
                  {c.citizenName}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                <dt className="text-xs font-medium text-slate-600">Assigned Crew</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-slate-600" />
                  {c.teamName || 'Unassigned'}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                <dt className="text-xs font-medium text-slate-600">Citizen Contact</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-600" />
                  {c.contact}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                <dt className="text-xs font-medium text-slate-600">Location Address</dt>
                <dd className="mt-0.5 font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  <span>{c.address}</span>
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                <dt className="text-xs font-medium text-slate-600">GPS Coordinates</dt>
                <dd className="mt-0.5 font-mono text-xs font-semibold text-slate-900">
                  {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Description</h3>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {c.description}
              </p>
            </div>

            {c.photo && (
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Site Photograph</h3>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5">
                  <img
                    src={c.photo}
                    alt="Waste site condition"
                    className="max-h-80 w-full object-contain"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Location Map Card */}
          <Card title="Incident Location Map">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <MapView markers={[c]} height={280} />
            </div>
          </Card>

          {/* Progress Timeline */}
          <Card title="Progress & Audit Timeline">
            <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
              <ol className="space-y-6">
                {c.history.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 ring-4 ring-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={h.to} />
                        <span className="text-xs text-slate-600 font-medium">
                          {fmtDateTime(h.at)}
                        </span>
                        <span className="text-xs text-slate-600">by {h.byName}</span>
                      </div>
                      {h.remarks && (
                        <p className="mt-1 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100">
                          &ldquo;{h.remarks}&rdquo;
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Administrative Controls */}
        <div className="space-y-6">
          <ErrorBox message={err} />

          {/* Admin Management Controls */}
          {user.role === 'admin' && (
            <>
              {/* Status Update Card */}
              <Card title="Update Incident Status">
                <div className="space-y-3">
                  <select
                    className="input text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="New status"
                  >
                    <option value="">Select new status...</option>
                    {STATUSES.filter((s) => s !== c.status && s !== 'Assigned').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input text-sm"
                    placeholder="Operator remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <button
                    className="btn-primary w-full"
                    disabled={!status}
                    onClick={() =>
                      run(
                        () => api.setStatus(c.id, status, remarks),
                        `Status updated to ${status}`
                      )
                    }
                  >
                    Update Status
                  </button>
                </div>
              </Card>

              {/* Assign Team Card */}
              <Card title="Assign Collection Crew">
                <div className="space-y-3">
                  <select
                    className="input text-sm"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    aria-label="Team"
                  >
                    <option value="">Select team...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.available ? '' : '(Unavailable)'}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-primary w-full"
                    disabled={!team}
                    onClick={() =>
                      run(
                        () => api.assign(c.id, team),
                        c.teamId ? 'Task reassigned to new crew' : 'Crew assigned successfully'
                      )
                    }
                  >
                    {c.teamId ? 'Reassign Crew' : 'Assign Crew'}
                  </button>
                </div>
              </Card>

              {/* Priority Override Card */}
              <Card title="Priority Override">
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    System suggestion:{' '}
                    <span className="font-semibold text-slate-700">{c.suggestedPriority}</span>
                    . Override based on field inspection if necessary.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['High', 'Medium', 'Low'].map((p) => (
                      <button
                        key={p}
                        className={c.priority === p ? 'btn-primary py-1.5 text-xs' : 'btn-outline py-1.5 text-xs'}
                        onClick={() =>
                          c.priority !== p &&
                          run(() => api.setPriority(c.id, p), `Priority set to ${p}`)
                        }
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Assigned Team Actions */}
          {mine && (
            <Card title="Field Crew Operations">
              <div className="space-y-3">
                <textarea
                  className="input text-sm"
                  placeholder="Field remarks, arrival notes, or disposal logs..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
                {c.status === 'Assigned' && (
                  <button
                    className="btn-primary w-full"
                    onClick={() => run(() => api.setStatus(c.id, 'In Progress', remarks), 'Task started')}
                  >
                    Start Cleanup (In Progress)
                  </button>
                )}
                {c.status === 'In Progress' && (
                  <button
                    className="btn-primary w-full bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => run(() => api.setStatus(c.id, 'Resolved', remarks), 'Task completed')}
                  >
                    Mark Cleanup Completed
                  </button>
                )}
                {!['Assigned', 'In Progress'].includes(c.status) && (
                  <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-600 border border-slate-100">
                    This work order is <span className="font-semibold">{c.status.toLowerCase()}</span>. No further field updates required.
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Operational Notes (Staff & Admin) */}
          {user.role !== 'citizen' && (
            <Card title="Internal Dispatch Notes">
              <div className="space-y-3">
                <ul className="space-y-2 text-xs">
                  {c.notes.map((n) => (
                    <li
                      key={n.id}
                      className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 space-y-1"
                    >
                      <p className="text-slate-800">{n.text}</p>
                      <p className="text-[11px] text-slate-600">
                        {n.byName} · {fmtDateTime(n.at)}
                      </p>
                    </li>
                  ))}
                  {!c.notes.length && (
                    <li className="text-center py-3 text-slate-600">
                      No internal notes recorded yet.
                    </li>
                  )}
                </ul>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <textarea
                    className="input text-sm"
                    placeholder="Log operational notes for crew or dispatchers..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                  <button
                    className="btn-outline w-full text-xs"
                    disabled={!note.trim()}
                    onClick={() =>
                      run(() => api.addNote(c.id, note.trim()), 'Operational note recorded')
                    }
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Add Internal Note</span>
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
