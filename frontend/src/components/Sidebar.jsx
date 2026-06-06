import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiShoppingBag,
  FiPlusCircle,
  FiStar,
  FiLock,
} from 'react-icons/fi';

function Sidebar({ role, isOpen, onClose }) {
  const adminLinks = [
    { to: '/admin/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/add-user', icon: <FiUserPlus />, label: 'Add User' },
    { to: '/admin/stores', icon: <FiShoppingBag />, label: 'Stores' },
    { to: '/admin/add-store', icon: <FiPlusCircle />, label: 'Add Store' },
  ];

  const storeOwnerLinks = [
    { to: '/store-owner/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/change-password', icon: <FiLock />, label: 'Change Password' },
  ];

  const links = role === 'admin' ? adminLinks : storeOwnerLinks;
  const sectionLabel = role === 'admin' ? 'Administration' : 'Store Management';

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <FiStar />
          </div>
          <span className="sidebar-logo">RateMyStore</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{sectionLabel}</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
