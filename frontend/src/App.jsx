import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUserList from './pages/admin/UserList';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminAddUser from './pages/admin/AddUser';
import AdminStoreList from './pages/admin/StoreList';
import AdminAddStore from './pages/admin/AddStore';

import UserStoreList from './pages/user/StoreList';

import StoreOwnerDashboard from './pages/store_owner/Dashboard';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import { useState } from 'react';

function AppLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasSidebar = user && (user.role === 'admin' || user.role === 'store_owner');

  return (
    <div className={`app-layout ${hasSidebar ? 'has-sidebar' : ''} role-${user?.role || 'guest'}`}>
      {hasSidebar && (
        <Sidebar
          role={user.role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-area">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, isAuthenticated } = useAuth();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'store_owner': return '/store-owner/dashboard';
      case 'user': return '/stores';
      default: return '/login';
    }
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Login showToast={showToast} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Signup showToast={showToast} />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <ForgotPassword showToast={showToast} />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout>
                <AdminDashboard showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout>
                <AdminUserList showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout>
                <AdminUserDetail showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout>
                <AdminAddUser showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout>
                <AdminStoreList showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-store"
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout>
                <AdminAddStore showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Normal User Routes */}
        <Route
          path="/stores"
          element={
            <ProtectedRoute roles={['user']}>
              <AppLayout>
                <UserStoreList showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Store Owner Routes */}
        <Route
          path="/store-owner/dashboard"
          element={
            <ProtectedRoute roles={['store_owner']}>
              <AppLayout>
                <StoreOwnerDashboard showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Change Password — accessible to normal users and store owners */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute roles={['user', 'store_owner']}>
              <AppLayout>
                <ChangePassword showToast={showToast} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? getDefaultRedirect() : '/login'} replace />} />
      </Routes>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default App;
