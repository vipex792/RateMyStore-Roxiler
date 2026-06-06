import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import StarRating from '../../components/StarRating';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

function StoreList({ showToast }) {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });

  const fetchStores = useCallback(async () => {
    try {
      const params = {
        sortBy: sortField,
        sortOrder: sortOrder,
      };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const response = await api.get('/stores', { params });
      setStores(response.data.stores || []);
    } catch (err) {
      showToast('Failed to load stores.', 'error');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, filters, showToast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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
    { key: 'name', label: 'Store Name', sortable: true },
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
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating value={Math.round(val || 0)} readonly size="1rem" />
          <span className="star-rating-value">{val ? Number(val).toFixed(1) : 'N/A'}</span>
        </div>
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
          <h1>Stores</h1>
          <p>Manage all registered stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/add-store')}>
          + Add Store
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
      </div>

      <DataTable
        columns={columns}
        data={stores}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      />
    </div>
  );
}

export default StoreList;
