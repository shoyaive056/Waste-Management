import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Inbox, MailOpen } from 'lucide-react';
import { api } from '../services/api';
import { Card, EmptyState, Spinner, fmtDateTime } from '../components/ui';

export default function Notifications({ base }) {
  const [items, setItems] = useState(null);

  const load = () => api.notifications().then(setItems);

  useEffect(() => {
    load();
  }, []);

  const unreadCount = items ? items.filter((n) => !n.read).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Real-time updates regarding incident progress, crew dispatch, and administrative notes.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn-outline self-start sm:self-auto text-xs"
            onClick={() => api.markAllRead().then(load)}
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            Mark all as read
          </button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {!items ? (
          <div className="py-16">
            <Spinner />
          </div>
        ) : !items.length ? (
          <div className="py-12">
            <EmptyState
              title="No notifications"
              text="Updates regarding your reported complaints and dispatched operations will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => {
              const targetUrl = n.complaintId
                ? `${base}/${base === '/team' ? 'tasks' : 'complaints'}/${n.complaintId}`
                : null;

              return (
                <li
                  key={n.id}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition ${
                    n.read ? 'bg-white hover:bg-slate-50/70' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition ${
                        n.read ? 'bg-slate-300' : 'bg-emerald-600 ring-4 ring-emerald-100'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                        {n.text}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 font-medium">
                        {fmtDateTime(n.at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pl-6 sm:pl-0">
                    {!n.read && (
                      <button
                        onClick={() => api.markRead(n.id).then(load)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <MailOpen className="h-3.5 w-3.5 text-slate-600" />
                        Mark read
                      </button>
                    )}
                    {targetUrl && (
                      <Link
                        to={targetUrl}
                        onClick={() => api.markRead(n.id)}
                        className="btn-primary py-1 px-3 text-xs"
                      >
                        <span>View incident</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
