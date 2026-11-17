import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, ClipboardList, FilePlus2, History, LayoutDashboard, ListChecks, LogOut, Map, Menu, Recycle, Tags, Truck, User, Users, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

const NAV = {
  citizen: [['/citizen', 'Dashboard', LayoutDashboard, true], ['/citizen/submit', 'Report waste', FilePlus2], ['/citizen/complaints', 'My complaints', ClipboardList], ['/citizen/map', 'Map', Map], ['/citizen/notifications', 'Notifications', Bell], ['/citizen/profile', 'Profile', User]],
  admin: [['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/complaints', 'All complaints', ClipboardList], ['/admin/map', 'Waste map', Map], ['/admin/teams', 'Collection teams', Truck], ['/admin/citizens', 'Citizens', Users], ['/admin/categories', 'Waste categories', Tags], ['/admin/analytics', 'Analytics & reports', BarChart3], ['/admin/notifications', 'Notifications', Bell], ['/admin/profile', 'Profile', User]],
  team: [['/team', 'Dashboard', LayoutDashboard, true], ['/team/tasks', 'Assigned tasks', ListChecks], ['/team/map', 'Task map', Map], ['/team/history', 'Task history', History], ['/team/notifications', 'Notifications', Bell], ['/team/profile', 'Profile', User]],
};
const ROLE_LABEL = { citizen: 'Citizen', admin: 'Administrator', team: 'Collection team' };

export default function DashboardLayout() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false); const nav = useNavigate();
  const base = '/' + user.role;
  const links = (
    <nav className="flex-1 space-y-1 px-3" aria-label="Main">
      {NAV[user.role].map(([to, label, Icon, end]) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-white text-brand' : 'text-green-50 hover:bg-white/10'}`}>
          <Icon className="h-4 w-4" />{label}</NavLink>))}
    </nav>
  );
  const side = (
    <div className="flex h-full flex-col bg-brand py-5">
      <div className="mb-6 flex items-center gap-2 px-6 text-white"><Recycle className="h-6 w-6" /><span className="text-lg font-extrabold">Smart Waste</span></div>
      {links}
      <button onClick={() => { logout(); nav('/login'); }} className="mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-green-50 hover:bg-white/10"><LogOut className="h-4 w-4" />Log out</button>
    </div>
  );
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-64">{side}</aside></div>}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        <p className="hidden text-sm text-muted lg:block">{ROLE_LABEL[user.role]} workspace</p>
        <div className="flex items-center gap-3"><NotificationDropdown base={base} />
          <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{user.name[0]}</div>
            <div className="hidden text-sm leading-tight sm:block"><p className="font-semibold">{user.name}</p><p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p></div></div></div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6"><Outlet /></main>
    </div>
  );
}
