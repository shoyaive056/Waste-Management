import { Link } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import ComplaintsTable from '../components/ComplaintsTable';

export const CitizenComplaints = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Reported Incidents
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Track resolution milestones and review active or past waste reports.
        </p>
      </div>

      <Link to="/citizen/submit" className="btn-primary self-start sm:self-auto">
        <FilePlus2 className="h-4 w-4" />
        <span>Report Waste</span>
      </Link>
    </div>

    <ComplaintsTable title="Your Reported Incidents" base="/citizen/complaints" />
  </div>
);

export const AdminComplaints = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200/80 pb-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Incident Management Registry
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Review, triage, prioritize, and dispatch municipal waste collection incidents across all city sectors.
      </p>
    </div>

    <ComplaintsTable title="Master Incident Log" base="/admin/complaints" exportable />
  </div>
);

export const TeamTasks = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200/80 pb-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Assigned Field Tasks
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Active collection orders dispatched to your team requiring site arrival or cleanup completion.
      </p>
    </div>

    <ComplaintsTable
      title="Active Work Orders"
      base="/team/tasks"
      fixed={{ statusIn: ['Assigned', 'In Progress'] }}
    />
  </div>
);

export const TeamHistory = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200/80 pb-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Task Completion History
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Archive of successfully resolved and verified municipal waste collection tasks.
      </p>
    </div>

    <ComplaintsTable
      title="Resolved Work Orders"
      base="/team/tasks"
      fixed={{ statusIn: ['Resolved'] }}
    />
  </div>
);
