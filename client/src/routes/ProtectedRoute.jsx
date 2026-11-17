import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { HOME, useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui';

// Frontend guard only (UX). The backend must enforce the same rules on every API call.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (user.role !== role) return <Navigate to={HOME[user.role]} replace />;
  return <Outlet />;
}
