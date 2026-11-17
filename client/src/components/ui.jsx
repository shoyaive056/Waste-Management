import { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Inbox, Loader2, Search, XCircle } from 'lucide-react';

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>
);
export const EmptyState = ({ title, text, action }) => (
  <div className="flex flex-col items-center gap-2 py-14 text-center">
    <Inbox className="h-10 w-10 text-slate-300" /><p className="font-semibold">{title}</p>
    {text && <p className="max-w-sm text-sm text-muted">{text}</p>}{action}
  </div>
);
export const ErrorBox = ({ message }) => message ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div> : null;

const STATUS_STYLE = {
  Pending: 'bg-slate-100 text-slate-700', Approved: 'bg-blue-100 text-blue-700', Assigned: 'bg-indigo-100 text-indigo-700',
  'In Progress': 'bg-amber-100 text-amber-800', Resolved: 'bg-green-100 text-green-800', Rejected: 'bg-red-100 text-red-700',
};
export const StatusBadge = ({ status }) => <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>;
export const PRIORITY_COLOR = { High: '#DC2626', Medium: '#F97316', Low: '#16A34A' };
const PRIORITY_STYLE = { High: 'bg-red-100 text-red-700', Medium: 'bg-orange-100 text-orange-700', Low: 'bg-green-100 text-green-700' };
export const PriorityBadge = ({ priority }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[priority]}`}>{priority}</span>;

export const Card = ({ title, action, children, className = '' }) => (
  <section className={`card ${className}`}>
    {(title || action) && <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><h2 className="font-bold">{title}</h2>{action}</header>}
    <div className="p-5">{children}</div>
  </section>
);
export const StatCard = ({ label, value, icon: Icon, tone = 'text-brand bg-brand-50' }) => (
  <div className="card flex items-center gap-4 p-4">
    <div className={`rounded-lg p-3 ${tone}`}><Icon className="h-5 w-5" /></div>
    <div><p className="text-sm text-muted">{label}</p><p className="text-2xl font-extrabold">{value ?? '–'}</p></div>
  </div>
);
export const Field = ({ label, error, children }) => (
  <div><label className="label">{label}</label>{children}{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>
);
export const SearchBar = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
    <input className="input pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} /></div>
);
export const Pagination = ({ page, pageSize, total, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-muted">
      <span>{total} result{total === 1 ? '' : 's'}</span>
      <div className="flex items-center gap-2">
        <button className="btn-outline px-2 py-1" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <span>Page {page} of {pages}</span>
        <button className="btn-outline px-2 py-1" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
};
export const ConfirmationModal = ({ open, title, text, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) => open ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
    <div className="card w-full max-w-sm p-5"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted">{text}</p>
      <div className="mt-4 flex justify-end gap-2"><button className="btn-outline" onClick={onCancel}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button></div></div>
  </div>) : null;
export const Modal = ({ open, title, onClose, children }) => open ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
    <div className="card max-h-[90vh] w-full max-w-lg overflow-auto"><header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
      <h3 className="font-bold">{title}</h3><button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close"><XCircle className="h-5 w-5" /></button></header>
      <div className="p-5">{children}</div></div>
  </div>) : null;

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random(); setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>{children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${t.type === 'error' ? 'bg-red-600' : 'bg-brand'}`}>
            {t.type === 'error' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{t.message}</div>))}
      </div>
    </ToastCtx.Provider>
  );
}
export const BackLink = ({ to, children }) => <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"><ChevronLeft className="h-4 w-4" />{children}</Link>;

export function DataTable({ columns, rows, onRowClick, empty }) {
  if (!rows.length) return empty || <EmptyState title="Nothing to show" />;
  return (
    <div className="overflow-x-auto"><table className="w-full">
      <thead className="bg-slate-50"><tr>{columns.map((c) => <th key={c.key} className="th">{c.label}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r) => (
          <tr key={r.id} className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} onClick={() => onRowClick?.(r)}>
            {columns.map((c) => <td key={c.key} className="td">{c.render ? c.render(r) : r[c.key]}</td>)}</tr>))}
      </tbody></table></div>
  );
}
