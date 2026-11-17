import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PRIORITY_COLOR } from './ui';

const GREENS = ['#166534', '#22C55E', '#15803D', '#86EFAC', '#4ADE80', '#BBF7D0', '#065F46', '#34D399'];
const STATUS_COLOR = { Pending: '#94A3B8', Approved: '#3B82F6', Assigned: '#6366F1', 'In Progress': '#F59E0B', Resolved: '#16A34A', Rejected: '#DC2626' };
const Box = ({ children }) => <div className="h-64"><ResponsiveContainer>{children}</ResponsiveContainer></div>;

export const CategoryChart = ({ data }) => <Box><BarChart data={data} layout="vertical" margin={{ left: 30 }}><CartesianGrid horizontal={false} stroke="#E2E8F0" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" name="Complaints" fill="#166534" radius={[0, 4, 4, 0]} /></BarChart></Box>;
export const StatusChart = ({ data }) => <Box><PieChart><Pie data={data.filter((d) => d.value)} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>{data.map((d) => <Cell key={d.name} fill={STATUS_COLOR[d.name]} />)}</Pie><Tooltip /><Legend /></PieChart></Box>;
export const PriorityChart = ({ data }) => <Box><PieChart><Pie data={data.filter((d) => d.value)} dataKey="value" nameKey="name" outerRadius={85}>{data.map((d) => <Cell key={d.name} fill={PRIORITY_COLOR[d.name]} />)}</Pie><Tooltip /><Legend /></PieChart></Box>;
export const MonthlyChart = ({ data }) => <Box><LineChart data={data}><CartesianGrid stroke="#E2E8F0" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line dataKey="received" name="Received" stroke="#F59E0B" strokeWidth={2} /><Line dataKey="resolved" name="Resolved" stroke="#166534" strokeWidth={2} /></LineChart></Box>;
export const ResolvedPendingChart = ({ s }) => <Box><BarChart data={[{ name: 'Resolved', value: s.resolved }, { name: 'Pending', value: s.pending }, { name: 'Active', value: s.inProgress }]}><CartesianGrid vertical={false} stroke="#E2E8F0" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" name="Complaints" radius={[4, 4, 0, 0]}>{[0, 1, 2].map((i) => <Cell key={i} fill={GREENS[[0, 3, 1][i]]} />)}</Bar></BarChart></Box>;
