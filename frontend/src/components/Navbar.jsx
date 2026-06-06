import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiStar } from 'react-icons/fi';

function Navbar({ onMenuToggle }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'store_owner': return 'store_owner';
      default: return 'user';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'store_owner': return 'Owner';
      default: return 'User';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <button className="navbar-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
          <FiMenu />
        </button>
        {!(user.role === 'admin' || user.role === 'store_owner') && (
          <>
            <div className="logo-icon"><FiStar /></div>
            <span>RateMyStore</span>
          </>
        )}
      </div>

      <div className="navbar-portal-banner">
        {user.role === 'admin' && (
          <span className="portal-badge badge-admin">ADMINISTRATION PORTAL</span>
        )}
        {user.role === 'store_owner' && (
          <span className="portal-badge badge-owner">STORE OWNER PORTAL</span>
        )}
        {user.role === 'user' && (
          <span className="portal-badge badge-user">CUSTOMER PORTAL</span>
        )}
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="navbar-user-name">{user.name}</span>
          <span className={`navbar-role-badge ${getRoleBadgeClass(user.role)}`}>
            {getRoleLabel(user.role)}
          </span>
        </div>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
