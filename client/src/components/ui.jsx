import { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Inbox, Loader2, Search, XCircle } from 'lucide-react';

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status">
    <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
    <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="flex flex-col items-center gap-3 py-14 text-center px-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Inbox className="h-6 w-6" />
    </div>
    <div className="space-y-1">
      <p className="font-bold text-slate-800 text-base">{title}</p>
      {text && <p className="max-w-sm text-sm text-slate-500 leading-relaxed">{text}</p>}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorBox = ({ message }) => message ? (
  <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/90 p-3.5 text-sm text-rose-800 shadow-xs">
    <XCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
    <span className="font-medium leading-snug">{message}</span>
  </div>
) : null;

const STATUS_STYLE = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
  Assigned: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'In Progress': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Resolved: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-600' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' },
};

export const StatusBadge = ({ status }) => {
  const conf = STATUS_STYLE[status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.bg} ${conf.text} ${conf.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
      {status}
    </span>
  );
};

export const PRIORITY_COLOR = { High: '#DC2626', Medium: '#F97316', Low: '#16A34A' };
const PRIORITY_STYLE = {
  High: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

export const PriorityBadge = ({ priority }) => {
  const conf = PRIORITY_STYLE[priority] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.bg} ${conf.text} ${conf.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
      {priority}
    </span>
  );
};

export const Card = ({ title, action, subtitle, children, className = '' }) => (
  <section className={`card ${className}`}>
    {(title || action) && (
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 bg-white rounded-t-xl">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const StatCard = ({ label, value, icon: Icon, tone = 'text-brand-700 bg-brand-50 border-brand-100' }) => (
  <div className="card flex items-center justify-between p-5 hover:shadow-card-hover transition-all">
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value ?? '–'}</p>
    </div>
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${tone}`}>
      <Icon className="h-6 w-6" />
    </div>
  </div>
);

export const Field = ({ label, error, optional, children }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="label">{label}</label>
      {optional && <span className="text-[11px] text-slate-400 font-medium">Optional</span>}
    </div>
    {children}
    {error && <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>}
  </div>
);

export const SearchBar = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative w-full">
    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
    <input
      className="input pl-10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  </div>
);

export const Pagination = ({ page, pageSize, total, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 rounded-b-xl text-xs font-medium text-slate-600">
      <span>
        Showing <strong className="text-slate-900 font-semibold">{from}</strong> to <strong className="text-slate-900 font-semibold">{to}</strong> of <strong className="text-slate-900 font-semibold">{total}</strong> results
      </span>
      <div className="flex items-center gap-1.5">
        <button
          className="btn-outline px-2.5 py-1 text-xs"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1 inline" /> Previous
        </button>
        <span className="px-2 py-1 text-slate-700 font-semibold">
          Page {page} of {pages}
        </span>
        <button
          className="btn-outline px-2.5 py-1 text-xs"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          Next <ChevronRight className="h-3.5 w-3.5 ml-1 inline" />
        </button>
      </div>
    </div>
  );
};

export const ConfirmationModal = ({ open, title, text, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) => open ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150" role="dialog" aria-modal="true">
    <div className="card w-full max-w-sm p-6 shadow-xl border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button className="btn-outline text-xs" onClick={onCancel}>Cancel</button>
        <button className={danger ? 'btn-danger text-xs' : 'btn-primary text-xs'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
) : null;

export const Modal = ({ open, title, onClose, children }) => open ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150" role="dialog" aria-modal="true">
    <div className="card max-h-[90vh] w-full max-w-lg overflow-hidden shadow-2xl border-slate-200 flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition" aria-label="Close">
          <XCircle className="h-5 w-5" />
        </button>
      </header>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
) : null;

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random();
    setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[70] space-y-2 pointer-events-none" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl border animate-in slide-in-from-bottom-3 duration-200 ${
              t.type === 'error' ? 'bg-rose-700 border-rose-600' : 'bg-brand-900 border-brand-800'
            }`}
          >
            {t.type === 'error' ? <XCircle className="h-4 w-4 text-rose-300 flex-shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const BackLink = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-brand-800 hover:text-brand-900 hover:underline transition">
    <ChevronLeft className="h-4 w-4" />
    {children}
  </Link>
);

export function DataTable({ columns, rows, onRowClick, empty }) {
  if (!rows.length) return empty || <EmptyState title="Nothing to display" text="No records available." />;
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((c) => (
              <th key={c.key} className="th">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, i) => (
            <tr
              key={r.id || i}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'}`}
              onClick={() => onRowClick?.(r)}
            >
              {columns.map((c) => (
                <td key={c.key} className="td">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
