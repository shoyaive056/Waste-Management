import { Link, NavLink, Outlet } from 'react-router-dom';
import { Recycle, ShieldCheck, ArrowRight } from 'lucide-react';
import { HOME, useAuth } from '../contexts/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();
  const navLinkStyle = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? 'text-brand-800' : 'text-slate-600 hover:text-brand-700'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top Banner / Announcement */}
      <div className="bg-[#0f2e1b] px-4 py-2 text-center text-xs font-medium text-emerald-100 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
          <ShieldCheck className="h-3 w-3" /> Live Operations
        </span>
        <span>Digital Environmental & Waste Operations Platform for Modern Cities</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 shadow-xs border border-brand-600/30">
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-brand-800 transition">
                Smart Waste Management
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Municipal Operations Platform
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6" aria-label="Public Navigation">
            <NavLink to="/about" className={navLinkStyle}>About</NavLink>
            <NavLink to="/contact" className={navLinkStyle}>Contact</NavLink>

            <div className="h-5 w-px bg-slate-200" />

            {user ? (
              <Link to={HOME[user.role]} className="btn-primary text-xs sm:text-sm">
                Open Dashboard <ArrowRight className="h-4 w-4 ml-1 inline" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-800 transition">
                  Sign In
                </NavLink>
                <Link to="/register" className="btn-primary text-xs sm:text-sm">
                  Register Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Enterprise Platform Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800 text-white">
                <Recycle className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-900">SWMS Enterprise</span>
            </div>
            <p className="text-xs text-slate-500 text-center sm:text-right">
              © {new Date().getFullYear()} Smart Waste Management System. All rights reserved. Environmental Operations & Logistics Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
