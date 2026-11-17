import { Link } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import ComplaintsTable from '../components/ComplaintsTable';

export const CitizenComplaints = () => (
  <><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">My complaints</h1>
    <Link to="/citizen/submit" className="btn-primary"><FilePlus2 className="h-4 w-4" />Report waste</Link></div>
  <ComplaintsTable title="Your reports" base="/citizen/complaints" /></>
);
export const AdminComplaints = () => (
  <><h1 className="text-2xl font-extrabold">All complaints</h1><ComplaintsTable title="Complaint management" base="/admin/complaints" exportable /></>
);
export const TeamTasks = () => (
  <><h1 className="text-2xl font-extrabold">Assigned tasks</h1>
  <ComplaintsTable title="Active tasks" base="/team/tasks" fixed={{ statusIn: ['Assigned', 'In Progress'] }} /></>
);
export const TeamHistory = () => (
  <><h1 className="text-2xl font-extrabold">Task history</h1>
  <ComplaintsTable title="Completed tasks" base="/team/tasks" fixed={{ statusIn: ['Resolved'] }} /></>
);
