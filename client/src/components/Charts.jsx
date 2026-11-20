import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PRIORITY_COLOR } from './ui';

const BRAND_PALETTE = ['#166534', '#15803D', '#22C55E', '#10B981', '#34D399', '#059669', '#047857', '#065F46'];

const STATUS_COLOR = {
  Pending: '#F59E0B',
  Approved: '#3B82F6',
  Assigned: '#6366F1',
  'In Progress': '#10B981',
  Resolved: '#16A34A',
  Rejected: '#E11D48',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs space-y-1">
      {label && <p className="font-bold text-slate-800 border-b border-slate-100 pb-1">{label}</p>}
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            {entry.name}:
          </span>
          <span className="font-extrabold text-slate-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const Box = ({ children, height = 260 }) => (
  <div style={{ height, width: '100%' }} className="relative">
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

export const CategoryChart = ({ data }) => (
  <Box height={280}>
    <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
      <CartesianGrid horizontal={false} stroke="#F1F5F9" />
      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="value" name="Incidents" fill="#15803D" radius={[0, 6, 6, 0]}>
        {(data || []).map((_, i) => (
          <Cell key={`cat-${i}`} fill={BRAND_PALETTE[i % BRAND_PALETTE.length]} />
        ))}
      </Bar>
    </BarChart>
  </Box>
);

export const StatusChart = ({ data }) => (
  <Box height={260}>
    <PieChart>
      <Pie
        data={(data || []).filter((d) => d.value > 0)}
        dataKey="value"
        nameKey="name"
        innerRadius={55}
        outerRadius={85}
        paddingAngle={3}
      >
        {(data || []).map((d) => (
          <Cell key={d.name} fill={STATUS_COLOR[d.name] || '#94A3B8'} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend
        verticalAlign="bottom"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
      />
    </PieChart>
  </Box>
);

export const PriorityChart = ({ data }) => (
  <Box height={260}>
    <PieChart>
      <Pie
        data={(data || []).filter((d) => d.value > 0)}
        dataKey="value"
        nameKey="name"
        innerRadius={45}
        outerRadius={80}
        paddingAngle={4}
      >
        {(data || []).map((d) => (
          <Cell key={d.name} fill={PRIORITY_COLOR[d.name] || '#94A3B8'} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend
        verticalAlign="bottom"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
      />
    </PieChart>
  </Box>
);

export const MonthlyChart = ({ data }) => (
  <Box height={270}>
    <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
      <CartesianGrid stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
      <Tooltip content={<CustomTooltip />} />
      <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
      <Line
        type="monotone"
        dataKey="received"
        name="Received"
        stroke="#F59E0B"
        strokeWidth={2.5}
        dot={{ r: 3, fill: '#F59E0B' }}
        activeDot={{ r: 5 }}
      />
      <Line
        type="monotone"
        dataKey="resolved"
        name="Resolved"
        stroke="#15803D"
        strokeWidth={2.5}
        dot={{ r: 3, fill: '#15803D' }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  </Box>
);

export const ResolvedPendingChart = ({ s }) => (
  <Box height={260}>
    <BarChart
      data={[
        { name: 'Resolved', value: s.resolved, fill: '#16A34A' },
        { name: 'Pending Review', value: s.pending, fill: '#F59E0B' },
        { name: 'Active In-Field', value: s.inProgress, fill: '#3B82F6' },
      ]}
      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
    >
      <CartesianGrid vertical={false} stroke="#F1F5F9" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="value" name="Incidents" radius={[6, 6, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <Cell key={`res-${i}`} fill={['#15803D', '#F59E0B', '#3B82F6'][i]} />
        ))}
      </Bar>
    </BarChart>
  </Box>
);
