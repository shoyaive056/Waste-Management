import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Mail, Phone, Plus, Shield, Tag, Truck, User, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import {
  Card,
  ConfirmationModal,
  DataTable,
  Field,
  Modal,
  SearchBar,
  Spinner,
  fmtDate,
  useToast,
} from '../../components/ui';

const Pill = ({ on, yes = 'Active', no = 'Inactive' }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
      on
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
        : 'bg-slate-100 text-slate-600 border border-slate-200'
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-600' : 'bg-slate-600'}`}
    />
    {on ? yes : no}
  </span>
);

export function Citizens() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);

  const load = () => api.citizens().then(setRows);
  useEffect(() => {
    load();
  }, []);

  if (!rows) return <Spinner />;

  const shown = rows.filter((u) =>
    `${u.name} ${u.email} ${u.phone || ''}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Citizen Directory
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage registered municipal platform users, report submission history, and account active states.
        </p>
      </div>

      <Card className="[&>div]:p-0">
        <div className="border-b border-slate-100 p-4">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search citizens by name, email, or phone..."
          />
        </div>
        <DataTable
          rows={shown}
          columns={[
            {
              key: 'name',
              label: 'Citizen Name',
              render: (u) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {u.name[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-slate-900">{u.name}</span>
                </div>
              ),
            },
            {
              key: 'email',
              label: 'Email Address',
              render: (u) => <span className="text-slate-600 font-mono text-xs">{u.email}</span>,
            },
            {
              key: 'phone',
              label: 'Contact',
              render: (u) => <span className="text-slate-700">{u.phone || '—'}</span>,
            },
            {
              key: 'reports',
              label: 'Incidents Reported',
              render: (u) => (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {u.reports}
                </span>
              ),
            },
            {
              key: 'createdAt',
              label: 'Registration Date',
              render: (u) => <span className="text-xs text-slate-600">{fmtDate(u.createdAt)}</span>,
            },
            {
              key: 'active',
              label: 'Status',
              render: (u) => <Pill on={u.active} />,
            },
            {
              key: 'a',
              label: 'Action',
              render: (u) => (
                <button
                  className={`text-xs font-semibold transition ${
                    u.active
                      ? 'text-rose-600 hover:text-rose-700'
                      : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                  onClick={() => setTarget(u)}
                >
                  {u.active ? 'Deactivate' : 'Activate'}
                </button>
              ),
            },
          ]}
        />
      </Card>

      <ConfirmationModal
        open={!!target}
        danger={target?.active}
        title={`${target?.active ? 'Deactivate' : 'Activate'} Account for ${target?.name}?`}
        text={
          target?.active
            ? 'Deactivated citizens cannot log in or submit new waste complaints.'
            : 'Activated citizens can sign in and report municipal waste issues.'
        }
        confirmLabel={target?.active ? 'Deactivate Account' : 'Activate Account'}
        onCancel={() => setTarget(null)}
        onConfirm={async () => {
          await api.toggleCitizen(target.id);
          toast(`Citizen account ${target.active ? 'deactivated' : 'activated'}`);
          setTarget(null);
          load();
        }}
      />
    </div>
  );
}

const teamSchema = z.object({
  name: z.string().min(3, 'Enter a team name'),
  leader: z.string().min(2, 'Enter the team leader name'),
  phone: z.string().min(7, 'Enter a contact number'),
  email: z.string().email('Enter a valid email address'),
  area: z.string().min(2, 'Enter the designated service area'),
});

function TeamForm({ team, onDone }) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: team || {},
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit(async (d) => {
        await api.saveTeam({ ...team, ...d, available: team ? team.available : true });
        toast(team ? 'Collection crew updated' : 'Collection crew registered');
        onDone();
      })}
    >
      <div className="space-y-3">
        {[
          ['name', 'Team / Fleet Name', 'e.g., Zone 4 Rapid Response Unit'],
          ['leader', 'Crew Leader Name', 'Full name of the designated crew supervisor'],
          ['phone', 'Direct Contact Phone', 'Mobile number for operational dispatch'],
          ['email', 'Official Team Email', 'Login email for portal access'],
          ['area', 'Designated Service Zone', 'e.g., Sector 7, North Ward'],
        ].map(([k, l, p]) => (
          <Field key={k} label={l} error={errors[k]?.message}>
            <input className="input" {...register(k)} placeholder={p} />
          </Field>
        ))}
      </div>

      {!team && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-950">
          <p className="font-semibold text-emerald-900">Crew Authentication Notice</p>
          <p className="mt-0.5 text-emerald-800/90 leading-relaxed">
            A secure crew leader login will be provisioned using this email address with the temporary password <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold">Team@1234</code>.
          </p>
        </div>
      )}

      <div className="pt-2">
        <button className="btn-primary w-full py-2.5" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving Crew...'
            : team
            ? 'Save Crew Changes'
            : 'Register Collection Crew'}
        </button>
      </div>
    </form>
  );
}

export function Teams() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(undefined);

  const load = () => api.teams().then(setRows);
  useEffect(() => {
    load();
  }, []);

  if (!rows) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Collection Fleets & Crews
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Configure municipal cleanup crews, zone allocations, leader contacts, and dispatch availability.
          </p>
        </div>

        <button className="btn-primary self-start sm:self-auto" onClick={() => setEdit(null)}>
          <Plus className="h-4 w-4" />
          <span>New Collection Crew</span>
        </button>
      </div>

      <Card className="[&>div]:p-0">
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'name',
              label: 'Team Name',
              render: (t) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-900">{t.name}</span>
                </div>
              ),
            },
            {
              key: 'leader',
              label: 'Crew Leader',
              render: (t) => <span className="font-medium text-slate-800">{t.leader}</span>,
            },
            {
              key: 'phone',
              label: 'Contact',
              render: (t) => <span className="text-slate-700">{t.phone}</span>,
            },
            {
              key: 'email',
              label: 'Email',
              render: (t) => <span className="text-xs font-mono text-slate-600">{t.email}</span>,
            },
            {
              key: 'area',
              label: 'Assigned Service Zone',
              render: (t) => (
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {t.area}
                </span>
              ),
            },
            {
              key: 'available',
              label: 'Status',
              render: (t) => <Pill on={t.available} yes="Available" no="On Dispatch" />,
            },
            {
              key: 'a',
              label: 'Actions',
              render: (t) => (
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button
                    className="text-emerald-700 hover:text-emerald-800 transition"
                    onClick={() => setEdit(t)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${
                      t.available
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-emerald-700 hover:text-emerald-800'
                    } transition`}
                    onClick={async () => {
                      await api.saveTeam({ ...t, available: !t.available });
                      toast(`Fleet availability updated to ${!t.available ? 'Available' : 'Unavailable'}`);
                      load();
                    }}
                  >
                    {t.available ? 'Mark Busy' : 'Mark Available'}
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={edit !== undefined}
        title={edit ? `Edit Crew: ${edit.name}` : 'Register New Collection Crew'}
        onClose={() => setEdit(undefined)}
      >
        {edit !== undefined && (
          <TeamForm
            team={edit}
            onDone={() => {
              setEdit(undefined);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export function Categories() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [name, setName] = useState('');

  const load = () => api.categories().then(setRows);
  useEffect(() => {
    load();
  }, []);

  if (!rows) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Waste Categories & Classification
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage waste incident categories used for public reporting, hazard triage, and AI priority calculation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Category Card */}
        <Card title="Add Classification Category">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              await api.addCategory(name.trim());
              setName('');
              toast('Waste category added successfully');
              load();
            }}
          >
            <Field label="Category Title">
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Medical / Biohazard Waste"
                aria-label="Category name"
              />
            </Field>

            <button className="btn-primary w-full" disabled={!name.trim()}>
              <Plus className="h-4 w-4" />
              <span>Add Waste Category</span>
            </button>
          </form>
        </Card>

        {/* Existing Categories Table */}
        <div className="lg:col-span-2">
          <Card className="[&>div]:p-0" title="Active Waste Categories">
            <DataTable
              rows={rows}
              columns={[
                {
                  key: 'name',
                  label: 'Category Name',
                  render: (c) => (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-slate-900">{c.name}</span>
                    </div>
                  ),
                },
                {
                  key: 'slug',
                  label: 'Slug Code',
                  render: (c) => (
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.slug}
                    </span>
                  ),
                },
                {
                  key: 'active',
                  label: 'State',
                  render: (c) => <Pill on={c.active} yes="Active" no="Disabled" />,
                },
                {
                  key: 'a',
                  label: 'Action',
                  render: (c) => (
                    <button
                      className={`text-xs font-semibold transition ${
                        c.active
                          ? 'text-rose-600 hover:text-rose-700'
                          : 'text-emerald-700 hover:text-emerald-800'
                      }`}
                      onClick={async () => {
                        await api.toggleCategory(c.id);
                        toast(`Category ${c.active ? 'disabled' : 'enabled'}`);
                        load();
                      }}
                    >
                      {c.active ? 'Disable' : 'Enable'}
                    </button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
