import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { Landing, About, Contact } from './pages/public/Public';
import { Login, Register } from './pages/auth/Auth';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import { CitizenComplaints, AdminComplaints, TeamTasks, TeamHistory } from './pages/Lists';
import ComplaintDetails from './pages/ComplaintDetails';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import MapPage from './pages/MapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Citizens, Teams, Categories } from './pages/admin/Manage';
import Analytics from './pages/admin/Analytics';
import TeamDashboard from './pages/team/TeamDashboard';

const shared = (base) => (<>
  <Route path="notifications" element={<Notifications base={base} />} />
  <Route path="profile" element={<Profile />} />
  <Route path="map" element={<MapPage />} />
</>);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
      </Route>
      <Route path="/citizen" element={<ProtectedRoute role="citizen" />}><Route element={<DashboardLayout />}>
        <Route index element={<CitizenDashboard />} /><Route path="submit" element={<SubmitComplaint />} />
        <Route path="complaints" element={<CitizenComplaints />} /><Route path="complaints/:id" element={<ComplaintDetails back="/citizen/complaints" />} />
        {shared('/citizen')}</Route></Route>
      <Route path="/admin" element={<ProtectedRoute role="admin" />}><Route element={<DashboardLayout />}>
        <Route index element={<AdminDashboard />} /><Route path="complaints" element={<AdminComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetails back="/admin/complaints" />} />
        <Route path="citizens" element={<Citizens />} /><Route path="teams" element={<Teams />} /><Route path="categories" element={<Categories />} />
        <Route path="analytics" element={<Analytics />} />{shared('/admin')}</Route></Route>
      <Route path="/team" element={<ProtectedRoute role="team" />}><Route element={<DashboardLayout />}>
        <Route index element={<TeamDashboard />} /><Route path="tasks" element={<TeamTasks />} />
        <Route path="tasks/:id" element={<ComplaintDetails back="/team/tasks" />} /><Route path="history" element={<TeamHistory />} />
        {shared('/team')}</Route></Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
