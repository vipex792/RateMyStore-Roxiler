import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import { FiSearch } from 'react-icons/fi';

function UserList({ showToast }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
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
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => (
        <span style={{ maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className={`navbar-role-badge ${val}`}>
          {val === 'store_owner' ? 'Owner' : val === 'admin' ? 'Admin' : 'User'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/add-user')}>
          + Add User
        </button>
      </div>

      <div className="filters-bar">
        <div className="form-group">
          <label className="form-label">Name</label>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Filter by name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="text"
            name="email"
            className="form-input"
            placeholder="Filter by email..."
            value={filters.email}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className="form-input"
            placeholder="Filter by address..."
            value={filters.address}
            onChange={handleFilterChange}
          />
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
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
      />
    </div>
  );
}

export default UserList;
