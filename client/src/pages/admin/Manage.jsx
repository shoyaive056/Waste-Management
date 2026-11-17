import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Card, ConfirmationModal, DataTable, Field, Modal, SearchBar, Spinner, fmtDate, useToast } from '../../components/ui';

const Pill = ({ on, yes = 'Active', no = 'Inactive' }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${on ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{on ? yes : no}</span>;

export function Citizens() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [q, setQ] = useState(''); const [target, setTarget] = useState(null);
  const load = () => api.citizens().then(setRows); useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;
  const shown = rows.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <><h1 className="text-2xl font-extrabold">Citizens</h1>
      <Card className="[&>div]:p-0"><div className="border-b border-slate-100 p-4"><SearchBar value={q} onChange={setQ} placeholder="Search by name or email" /></div>
        <DataTable rows={shown} columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'reports', label: 'Reports' }, { key: 'createdAt', label: 'Joined', render: (u) => fmtDate(u.createdAt) },
          { key: 'active', label: 'Status', render: (u) => <Pill on={u.active} /> }, { key: 'a', label: 'Action', render: (u) => <button className="font-semibold text-brand" onClick={() => setTarget(u)}>{u.active ? 'Deactivate' : 'Activate'}</button> }]} /></Card>
      <ConfirmationModal open={!!target} danger={target?.active} title={`${target?.active ? 'Deactivate' : 'Activate'} ${target?.name}?`} text={target?.active ? 'They will no longer be able to log in.' : 'They will be able to log in again.'} confirmLabel={target?.active ? 'Deactivate' : 'Activate'}
        onCancel={() => setTarget(null)} onConfirm={async () => { await api.toggleCitizen(target.id); toast('Account updated'); setTarget(null); load(); }} /></>
  );
}

const teamSchema = z.object({ name: z.string().min(3, 'Enter a team name'), leader: z.string().min(2, 'Enter the team leader'), phone: z.string().min(7, 'Enter a phone number'), email: z.string().email('Enter a valid email'), area: z.string().min(2, 'Enter the service area') });
function TeamForm({ team, onDone }) {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(teamSchema), defaultValues: team || {} });
  return (
    <form className="space-y-3" noValidate onSubmit={handleSubmit(async (d) => { await api.saveTeam({ ...team, ...d, available: team ? team.available : true }); toast(team ? 'Team updated' : 'Team created'); onDone(); })}>
      {[['name', 'Team name'], ['leader', 'Team leader'], ['phone', 'Contact number'], ['email', 'Email'], ['area', 'Service area']].map(([k, l]) => <Field key={k} label={l} error={errors[k]?.message}><input className="input" {...register(k)} /></Field>)}
      {!team && <p className="text-xs text-muted">A login is created for the leader with the temporary password Team@1234.</p>}
      <button className="btn-primary w-full" disabled={isSubmitting}>{team ? 'Save team' : 'Create team'}</button></form>
  );
}
export function Teams() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [edit, setEdit] = useState(undefined);
  const load = () => api.teams().then(setRows); useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;
  return (
    <><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Collection teams</h1><button className="btn-primary" onClick={() => setEdit(null)}><Plus className="h-4 w-4" />New team</button></div>
      <Card className="[&>div]:p-0"><DataTable rows={rows} columns={[{ key: 'name', label: 'Team' }, { key: 'leader', label: 'Leader' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'area', label: 'Service area' },
        { key: 'available', label: 'Availability', render: (t) => <Pill on={t.available} yes="Available" no="Unavailable" /> },
        { key: 'a', label: 'Actions', render: (t) => <span className="flex gap-3 font-semibold text-brand"><button onClick={() => setEdit(t)}>Edit</button><button onClick={async () => { await api.saveTeam({ ...t, available: !t.available }); toast('Availability updated'); load(); }}>{t.available ? 'Deactivate' : 'Activate'}</button></span> }]} /></Card>
      <Modal open={edit !== undefined} title={edit ? 'Edit team' : 'New collection team'} onClose={() => setEdit(undefined)}>{edit !== undefined && <TeamForm team={edit} onDone={() => { setEdit(undefined); load(); }} />}</Modal></>
  );
}

export function Categories() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [name, setName] = useState('');
  const load = () => api.categories().then(setRows); useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;
  return (
    <><h1 className="text-2xl font-extrabold">Waste categories</h1>
      <Card title="Add a category" className="max-w-xl"><form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!name.trim()) return; await api.addCategory(name.trim()); setName(''); toast('Category added'); load(); }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Medical waste" aria-label="Category name" /><button className="btn-primary">Add</button></form></Card>
      <Card className="max-w-xl [&>div]:p-0"><DataTable rows={rows} columns={[{ key: 'name', label: 'Category' }, { key: 'active', label: 'Status', render: (c) => <Pill on={c.active} /> },
        { key: 'a', label: 'Action', render: (c) => <button className="font-semibold text-brand" onClick={async () => { await api.toggleCategory(c.id); load(); }}>{c.active ? 'Disable' : 'Enable'}</button> }]} /></Card></>
  );
}
