import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, STATUSES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import { BackLink, Card, EmptyState, ErrorBox, PriorityBadge, Spinner, StatusBadge, fmtDateTime, useToast } from '../components/ui';

export default function ComplaintDetails({ back }) {
  const { id } = useParams(); const { user } = useAuth(); const toast = useToast();
  const [c, setC] = useState(null); const [teams, setTeams] = useState([]); const [err, setErr] = useState(''); const [loadErr, setLoadErr] = useState('');
  const [status, setStatus] = useState(''); const [remarks, setRemarks] = useState(''); const [note, setNote] = useState(''); const [team, setTeam] = useState('');
  const load = useCallback(() => api.complaint(id).then(setC).catch((e) => setLoadErr(e.message)), [id]);
  useEffect(() => { load(); if (user.role === 'admin') api.teams().then(setTeams); }, [load, user.role]);
  const run = async (fn, msg) => { try { setErr(''); setC(await fn()); toast(msg); setRemarks(''); setNote(''); } catch (e) { setErr(e.message); } };

  if (loadErr) return <><BackLink to={back}>Back</BackLink><EmptyState title="Can't open this complaint" text={loadErr} /></>;
  if (!c) return <Spinner />;
  const mine = user.role === 'team' && c.teamId === user.teamId;
  return (
    <>
      <BackLink to={back}>Back to list</BackLink>
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-extrabold">{c.title}</h1><StatusBadge status={c.status} /><PriorityBadge priority={c.priority} /></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={`Complaint ${c.id}`}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[['Category', c.categoryName], ['Reported by', c.citizenName], ['Submitted', fmtDateTime(c.createdAt)], ['Assigned team', c.teamName || 'Not assigned'], ['Address', c.address], ['Contact', c.contact], ['Coordinates', `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`], ['Reported severity', c.severity]].map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-semibold capitalize">{v}</dd></div>)}
            </dl>
            <p className="mt-4 text-sm text-slate-700">{c.description}</p>
            {c.photo && <img src={c.photo} alt="Waste site" className="mt-4 max-h-72 rounded-lg" />}
          </Card>
          <Card title="Location"><MapView markers={[c]} height={260} /></Card>
          <Card title="Progress timeline">
            <ol className="relative space-y-4 border-l-2 border-brand-100 pl-5">
              {c.history.map((h, i) => <li key={i}><span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-brand" />
                <div className="flex flex-wrap items-center gap-2"><StatusBadge status={h.to} /><span className="text-xs text-muted">{fmtDateTime(h.at)} · {h.byName}</span></div>
                {h.remarks && <p className="mt-1 text-sm text-slate-700">{h.remarks}</p>}</li>)}
            </ol>
          </Card>
        </div>
        <div className="space-y-6">
          <ErrorBox message={err} />
          {user.role === 'admin' && (<>
            <Card title="Manage complaint"><div className="space-y-3">
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="New status"><option value="">Change status…</option>{STATUSES.filter((s) => s !== c.status && s !== 'Assigned').map((s) => <option key={s}>{s}</option>)}</select>
              <input className="input" placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <button className="btn-primary w-full" disabled={!status} onClick={() => run(() => api.setStatus(c.id, status, remarks), `Status changed to ${status}`)}>Update status</button></div></Card>
            <Card title="Assign collection team"><div className="space-y-3">
              <select className="input" value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team"><option value="">Choose team…</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}{t.available ? '' : ' (unavailable)'}</option>)}</select>
              <button className="btn-primary w-full" disabled={!team} onClick={() => run(() => api.assign(c.id, team), c.teamId ? 'Task reassigned' : 'Team assigned')}>{c.teamId ? 'Reassign' : 'Assign'}</button></div></Card>
            <Card title="Priority"><p className="mb-2 text-xs text-muted">Rule-based suggestion: {c.suggestedPriority}. Override if needed.</p>
              <div className="flex gap-2">{['High', 'Medium', 'Low'].map((p) => <button key={p} className={c.priority === p ? 'btn-primary flex-1' : 'btn-outline flex-1'} onClick={() => c.priority !== p && run(() => api.setPriority(c.id, p), `Priority set to ${p}`)}>{p}</button>)}</div></Card>
          </>)}
          {mine && (
            <Card title="Update task"><div className="space-y-3">
              <textarea className="input" placeholder="Collection notes" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              {c.status === 'Assigned' && <button className="btn-primary w-full" onClick={() => run(() => api.setStatus(c.id, 'In Progress', remarks), 'Task started')}>Mark in progress</button>}
              {c.status === 'In Progress' && <button className="btn-primary w-full" onClick={() => run(() => api.setStatus(c.id, 'Resolved', remarks), 'Task completed')}>Mark completed</button>}
              {!['Assigned', 'In Progress'].includes(c.status) && <p className="text-sm text-muted">This task is {c.status.toLowerCase()}. No further updates needed.</p>}</div></Card>)}
          {user.role !== 'citizen' && (
            <Card title="Notes"><ul className="mb-3 space-y-2 text-sm">{c.notes.map((n) => <li key={n.id} className="rounded-lg bg-slate-50 p-2"><p>{n.text}</p><p className="text-xs text-muted">{n.byName} · {fmtDateTime(n.at)}</p></li>)}{!c.notes.length && <li className="text-muted">No notes yet.</li>}</ul>
              <textarea className="input" placeholder="Add a note" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn-outline mt-2 w-full" disabled={!note.trim()} onClick={() => run(() => api.addNote(c.id, note.trim()), 'Note added')}>Add note</button></Card>)}
        </div>
      </div>
    </>
  );
}
