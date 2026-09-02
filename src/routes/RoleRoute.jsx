import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles = [] }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    const redirectPath = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
