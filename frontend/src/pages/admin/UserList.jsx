import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import FormInput from '../../components/FormInput';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../../utils/validators';
import { FiSearch, FiX, FiPlus, FiChevronLeft, FiChevronRight, FiMapPin, FiMail, FiShield } from 'react-icons/fi';

function UserList({ showToast }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  
  // Sort states
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Inline modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [modalErrors, setModalErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        sortBy: sortField,
        sortOrder: sortOrder,
      };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;

      const response = await api.get('/users', { params });
      setUsers(response.data.users || []);
    } catch (err) {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, filters, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to page 1 on filter
  };

  // Add User Form Change Handlers
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (modalErrors[name]) {
      setModalErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateModal = () => {
    const errs = {};
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const addressErr = validateAddress(formData.address);
    const passErr = validatePassword(formData.password);

    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (addressErr) errs.address = addressErr;
    if (passErr) errs.password = passErr;

    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!validateModal()) return;

    setSubmitting(true);
    try {
      await api.post('/users', formData);
      showToast('User created successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', address: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Process data client-side for pagination (filtering and sorting done by server endpoints already)
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [users, currentPage]);

  const totalPages = Math.max(Math.ceil(users.length / itemsPerPage), 1);

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'store_owner': return 'Store Owner';
      default: return 'User';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>User Directory</h1>
          <p>Browse, manage and register corporate access roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add User
        </button>
      </div>

      {/* Advanced Filter Panel */}
      <div className="filters-bar" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Search name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="search-input-wrapper">
            <FiMail className="search-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              name="email"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search email..."
              value={filters.email}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <div className="search-input-wrapper">
            <FiMapPin className="search-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              name="address"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search location..."
              value={filters.address}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            name="role"
            className="form-select"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User / Customer</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>
      </div>

      {/* Users DataTable wrapper */}
      <div className="data-table-wrapper" style={{ boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortField === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('address')} className="sortable">
                Address {sortField === 'address' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Role {sortField === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={4}>
                    <div className="skeleton-row" style={{ margin: 0, height: '40px' }} />
                  </td>
                </tr>
              ))
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div className="empty-state" style={{ padding: 0 }}>
                    <div className="empty-state-icon" style={{ fontSize: '2rem' }}>👥</div>
                    <div className="empty-state-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>No users found</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="clickable-row"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiMapPin style={{ color: 'var(--text-muted)' }} />
                      <span style={{ maxWidth: '240px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.address || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`navbar-role-badge ${user.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiShield style={{ fontSize: '10px' }} /> {getRoleLabel(user.role)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination wrapper */}
      {users.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span className="text-muted" style={{ fontSize: '13px' }}>
            Showing {Math.min(users.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
            {Math.min(users.length, currentPage * itemsPerPage)} of {users.length} users
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Register New User</h3>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px' }}
                onClick={() => setIsModalOpen(false)}
              >
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="modal-body">
                <FormInput
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleModalChange}
                  error={modalErrors.name}
                  placeholder="Enter full name (20-60 characters)"
                  required
                />

                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleModalChange}
                  error={modalErrors.email}
                  placeholder="Enter email address"
                  required
                />

                <FormInput
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleModalChange}
                  error={modalErrors.address}
                  placeholder="Enter address (max 400 characters)"
                  required
                />

                <FormInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleModalChange}
                  error={modalErrors.password}
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  required
                />

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleModalChange}
                  >
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? '' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
