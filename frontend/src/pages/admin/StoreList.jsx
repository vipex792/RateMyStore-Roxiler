import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import FormInput from '../../components/FormInput';
import {
  validateName,
  validateEmail,
  validateAddress,
} from '../../utils/validators';
import { FiSearch, FiPlus, FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiMail } from 'react-icons/fi';

function StoreList({ showToast }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  
  // Sort states
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Inline modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [modalErrors, setModalErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
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

  const fetchStoreOwners = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'store_owner' } });
      setStoreOwners(response.data.users || []);
    } catch (err) {
      // Ignore owner fetch errors
    }
  };

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (isModalOpen) {
      fetchStoreOwners();
    }
  }, [isModalOpen]);

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
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // Add Store modal handlers
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

    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (addressErr) errs.address = addressErr;

    setModalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!validateModal()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
      };
      if (formData.ownerId) {
        payload.owner_id = formData.ownerId;
      }

      await api.post('/stores', payload);
      showToast('Store created successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create store.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side pagination logic
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return stores.slice(startIndex, startIndex + itemsPerPage);
  }, [stores, currentPage]);

  const totalPages = Math.max(Math.ceil(stores.length / itemsPerPage), 1);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Active Registries</h1>
          <p>Supervise active stores, aggregate reviews, and assign owners</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Store
        </button>
      </div>

      {/* Filter panel */}
      <div className="filters-bar" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">Store Name</label>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Search store name..."
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
      </div>

      {/* Stores table wrapper */}
      <div className="data-table-wrapper" style={{ boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Store Name {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortField === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('address')} className="sortable">
                Address {sortField === 'address' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('averageRating')} className="sortable">
                Rating {sortField === 'averageRating' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
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
            ) : paginatedStores.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div className="empty-state" style={{ padding: 0 }}>
                    <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🏪</div>
                    <div className="empty-state-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>No stores registered</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStores.map((store) => (
                <tr key={store.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{store.name}</td>
                  <td>{store.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiMapPin style={{ color: 'var(--text-muted)' }} />
                      <span style={{ maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {store.address || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating value={Math.round(store.averageRating || 0)} readonly size="0.875rem" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--star-gold)' }}>
                        {store.averageRating ? Number(store.averageRating).toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-muted" style={{ fontSize: '10px' }}>
                        ({store.totalRatings || 0})
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {stores.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span className="text-muted" style={{ fontSize: '13px' }}>
            Showing {Math.min(stores.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
            {Math.min(stores.length, currentPage * itemsPerPage)} of {stores.length} stores
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

      {/* Add Store Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Register New Store</h3>
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
                  label="Store Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleModalChange}
                  error={modalErrors.name}
                  placeholder="Enter store name (20-60 characters)"
                  required
                />

                <FormInput
                  label="Store Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleModalChange}
                  error={modalErrors.email}
                  placeholder="Enter store email"
                  required
                />

                <FormInput
                  label="Store Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleModalChange}
                  error={modalErrors.address}
                  placeholder="Enter store address (max 400 characters)"
                  required
                />

                <div className="form-group">
                  <label className="form-label">Store Owner (Optional)</label>
                  <select
                    name="ownerId"
                    className="form-select"
                    value={formData.ownerId}
                    onChange={handleModalChange}
                  >
                    <option value="">No owner assigned</option>
                    {storeOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
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
                  {submitting ? '' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreList;
