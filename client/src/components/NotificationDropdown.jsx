import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { api } from '../services/api';
import { fmtDateTime } from './ui';

export default function NotificationDropdown({ base }) {
  const [open, setOpen] = useState(false); const [items, setItems] = useState([]); const ref = useRef(null);
  const load = () => api.notifications().then(setItems);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);
  useEffect(() => { const h = (e) => !ref.current?.contains(e.target) && setOpen(false); document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const unread = items.filter((n) => !n.read).length;
  const detail = (n) => (n.complaintId ? `${base}/${base === '/team' ? 'tasks' : 'complaints'}/${n.complaintId}` : `${base}/notifications`);
  return (
    <div className="relative" ref={ref}>
      <button className="relative rounded-lg p-2 hover:bg-slate-100" onClick={() => setOpen(!open)} aria-label={`Notifications, ${unread} unread`}>
        <Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="card absolute right-0 z-40 mt-2 w-80 max-w-[90vw] overflow-hidden shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2"><b className="text-sm">Notifications</b>
            <button className="text-xs font-semibold text-brand" onClick={() => api.markAllRead().then(load)}>Mark all read</button></div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-auto">
            {items.slice(0, 6).map((n) => (
              <li key={n.id}><Link to={detail(n)} onClick={() => { api.markRead(n.id).then(load); setOpen(false); }} className={`block px-4 py-3 text-sm hover:bg-slate-50 ${n.read ? '' : 'bg-brand-50'}`}>
                <p className={n.read ? '' : 'font-semibold'}>{n.text}</p><p className="text-xs text-muted">{fmtDateTime(n.at)}</p></Link></li>))}
            {!items.length && <li className="px-4 py-6 text-center text-sm text-muted">You're all caught up.</li>}
          </ul>
          <Link to={`${base}/notifications`} onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-2 text-center text-sm font-semibold text-brand">View all</Link>
        </div>)}
    </div>
  );
}
