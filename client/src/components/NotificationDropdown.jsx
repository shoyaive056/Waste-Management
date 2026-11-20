import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Inbox } from 'lucide-react';
import { api } from '../services/api';
import { fmtDateTime } from './ui';

export default function NotificationDropdown({ base }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = () => api.notifications().then(setItems);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const detail = (n) =>
    n.complaintId
      ? `${base}/${base === '/team' ? 'tasks' : 'complaints'}/${n.complaintId}`
      : `${base}/notifications`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        aria-label={`Notifications, ${unread} unread`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in fade-in zoom-in-75">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2.5 w-84 max-w-[92vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
              {unread > 0 && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
                onClick={() => api.markAllRead().then(load)}
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {items.slice(0, 6).map((n) => (
              <li key={n.id}>
                <Link
                  to={detail(n)}
                  onClick={() => {
                    api.markRead(n.id).then(load);
                    setOpen(false);
                  }}
                  className={`group flex items-start gap-3 px-4 py-3 text-sm transition ${
                    n.read
                      ? 'bg-white hover:bg-slate-50/80 text-slate-600'
                      : 'bg-emerald-50/40 hover:bg-emerald-50/70 text-slate-900'
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition ${
                      n.read ? 'bg-slate-300' : 'bg-emerald-600 ring-2 ring-emerald-200'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`line-clamp-2 leading-snug ${n.read ? 'font-normal text-slate-600' : 'font-semibold text-slate-900'}`}>
                      {n.text}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-600">{fmtDateTime(n.at)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500 transition mt-0.5" />
                </Link>
              </li>
            ))}
            {!items.length && (
              <li className="flex flex-col items-center justify-center px-4 py-8 text-center text-slate-600">
                <Inbox className="h-8 w-8 text-slate-300 mb-1" />
                <p className="text-sm font-medium text-slate-700">All caught up</p>
                <p className="text-xs text-slate-600">No new notifications at this time.</p>
              </li>
            )}
          </ul>

          <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-center">
            <Link
              to={`${base}/notifications`}
              onClick={() => setOpen(false)}
              className="block rounded-md py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
