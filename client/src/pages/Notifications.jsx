import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card, EmptyState, Spinner, fmtDateTime } from '../components/ui';

export default function Notifications({ base }) {
  const [items, setItems] = useState(null);
  const load = () => api.notifications().then(setItems);
  useEffect(() => { load(); }, []);
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Notifications</h1><button className="btn-outline" onClick={() => api.markAllRead().then(load)}>Mark all as read</button></div>
      <Card>{!items ? <Spinner /> : !items.length ? <EmptyState title="No notifications yet" text="Updates about your complaints will appear here." /> :
        <ul className="-my-3 divide-y divide-slate-100">{items.map((n) => (
          <li key={n.id} className="flex items-start justify-between gap-3 py-3">
            <div><p className={n.read ? 'text-sm' : 'text-sm font-bold'}>{!n.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-500" />}{n.text}</p><p className="text-xs text-muted">{fmtDateTime(n.at)}</p></div>
            <div className="flex gap-3 text-sm font-semibold text-brand">{n.complaintId && <Link to={`${base}/${base === '/team' ? 'tasks' : 'complaints'}/${n.complaintId}`} onClick={() => api.markRead(n.id)}>Open</Link>}
              {!n.read && <button onClick={() => api.markRead(n.id).then(load)}>Mark read</button>}</div></li>))}</ul>}</Card>
    </>
  );
}
