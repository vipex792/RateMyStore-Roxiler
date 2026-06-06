import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'store_owner':
        return <Navigate to="/store-owner/dashboard" replace />;
      case 'user':
        return <Navigate to="/stores" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
