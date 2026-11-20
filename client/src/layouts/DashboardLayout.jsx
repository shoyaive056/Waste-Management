import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ClipboardList,
  FilePlus2,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Menu,
  Recycle,
  ShieldCheck,
  Tags,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

const NAV = {
  citizen: [
    ['/citizen', 'Dashboard', LayoutDashboard, true],
    ['/citizen/submit', 'Report Waste', FilePlus2],
    ['/citizen/complaints', 'My Reports', ClipboardList],
    ['/citizen/map', 'Operations Map', Map],
    ['/citizen/notifications', 'Notifications', Bell],
    ['/citizen/profile', 'Account Settings', User],
  ],
  admin: [
    ['/admin', 'Overview', LayoutDashboard, true],
    ['/admin/complaints', 'Incident Management', ClipboardList],
    ['/admin/map', 'Geospatial Map', Map],
    ['/admin/teams', 'Collection Teams', Truck],
    ['/admin/citizens', 'Citizen Directory', Users],
    ['/admin/categories', 'Waste Categories', Tags],
    ['/admin/analytics', 'Analytics & Reports', BarChart3],
    ['/admin/notifications', 'Notifications', Bell],
    ['/admin/profile', 'Account Profile', User],
  ],
  team: [
    ['/team', 'Task Queue', LayoutDashboard, true],
    ['/team/tasks', 'Active Assignments', ListChecks],
    ['/team/map', 'Field Map', Map],
    ['/team/history', 'Completed Tasks', History],
    ['/team/notifications', 'Notifications', Bell],
    ['/team/profile', 'Crew Profile', User],
  ],
};

const ROLE_BADGE = {
  citizen: { label: 'Citizen', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  admin: { label: 'Administrator', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  team: { label: 'Collection Crew', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const base = '/' + user.role;

  const links = (
    <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main Navigation">
      <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
        Navigation
      </div>
      {NAV[user.role].map(([to, label, Icon, end]) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-emerald-900/80 text-white shadow-xs border-l-3 border-emerald-400 pl-2.5'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-emerald-300" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0f2e1b] text-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-emerald-950/60 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md border border-emerald-500/30">
          <Recycle className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">SWMS</span>
            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">PRO</span>
          </div>
          <p className="text-[11px] font-medium text-emerald-200/60 leading-tight">Smart Waste Management</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3">{links}</div>

      {/* User info & Logout footer */}
      <div className="border-t border-emerald-950/60 p-3 bg-[#0b2415]">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 bg-emerald-950/40 border border-emerald-900/40">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white uppercase shadow-xs">
            {user.name ? user.name[0] : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white leading-tight">{user.name}</p>
            <p className="truncate text-[10px] text-emerald-300/80">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            nav('/login');
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-200/80 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64 flex flex-col">
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-emerald-950/40 shadow-lg lg:block z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {ROLE_BADGE[user.role]?.label || 'User'} Console
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secure Operations Portal</span>
          </div>

          <NotificationDropdown base={base} />

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-xs font-bold text-white shadow-xs">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="hidden text-left text-xs leading-tight sm:block">
              <p className="font-bold text-slate-800">{user.name}</p>
              <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold border ${ROLE_BADGE[user.role]?.color}`}>
                {ROLE_BADGE[user.role]?.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        <Outlet />
      </main>
    </div>
  );
}
