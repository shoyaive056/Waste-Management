import { Link, NavLink, Outlet } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { HOME, useAuth } from '../contexts/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();
  const l = ({ isActive }) => `text-sm font-semibold ${isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'}`;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-brand"><Recycle className="h-6 w-6" /><span className="text-lg font-extrabold">Smart Waste</span></Link>
          <nav className="flex items-center gap-5" aria-label="Public">
            <NavLink to="/about" className={l}>About</NavLink><NavLink to="/contact" className={l}>Contact</NavLink>
            {user ? <Link to={HOME[user.role]} className="btn-primary">Open dashboard</Link> : <><NavLink to="/login" className={l}>Log in</NavLink><Link to="/register" className="btn-primary">Sign up</Link></>}
          </nav></div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-muted">SE331 Capstone · Daffodil International University · Department of Software Engineering</footer>
    </div>
  );
}
