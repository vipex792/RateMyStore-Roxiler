import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import StatsCard from '../../components/StatsCard';
import { FiSearch, FiMapPin, FiStar, FiShoppingBag, FiCheckSquare, FiChevronLeft, FiChevronRight, FiEdit2, FiX } from 'react-icons/fi';

function UserStoreList({ showToast }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  
  // Sorting states
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal states
  const [ratingModal, setRatingModal] = useState({ isOpen: false, storeId: null, storeName: '', rating: 0 });

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all stores, then sort and paginate client-side to keep stats and search instant
      const response = await api.get('/stores');
      setStores(response.data.stores || []);
    } catch (err) {
      showToast('Failed to load stores.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalStores = stores.length;
    const ratedStores = stores.filter((s) => s.userRating).length;
    
    let sum = 0;
    stores.forEach((s) => {
      if (s.userRating) {
        sum += s.userRating.rating;
      }
    });
    const avgRatingGiven = ratedStores > 0 ? (sum / ratedStores).toFixed(1) : '0.0';

    return {
      totalStores,
      ratedStores,
      avgRatingGiven,
    };
  }, [stores]);

  const handleRatingSubmit = async () => {
    const { storeId, rating } = ratingModal;
    if (rating === 0) {
      showToast('Please select a rating before submitting.', 'warning');
      return;
    }

    try {
      const store = stores.find((s) => s.id === storeId);
      if (store && store.userRating) {
        // Update existing rating
        await api.put(`/ratings/${store.userRating.id}`, { rating });
      } else {
        // Create new rating
        await api.post('/ratings', { store_id: storeId, rating });
      }
      showToast('Rating submitted successfully!', 'success');
      setRatingModal({ isOpen: false, storeId: null, storeName: '', rating: 0 });
      fetchStores();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit rating.';
      showToast(message, 'error');
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const openRateModal = (store) => {
    setRatingModal({
      isOpen: true,
      storeId: store.id,
      storeName: store.name,
      rating: store.userRating?.rating || 0,
    });
  };

  // Filtered & Sorted Stores
  const processedStores = useMemo(() => {
    let result = [...stores];

    // Filter by name
    if (search.name) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.name.toLowerCase())
      );
    }

    // Filter by address
    if (search.address) {
      result = result.filter((s) =>
        s.address.toLowerCase().includes(search.address.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested userRating
      if (sortField === 'userRating') {
        aVal = a.userRating?.rating || 0;
        bVal = b.userRating?.rating || 0;
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return result;
  }, [stores, search, sortField, sortOrder]);

  // Paginated Stores
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedStores.slice(startIndex, startIndex + itemsPerPage);
  }, [processedStores, currentPage]);

  const totalPages = Math.max(Math.ceil(processedStores.length / itemsPerPage), 1);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Store Ratings</h1>
          <p>Explore shops, view overall metrics, and submit your personal ratings</p>
        </div>
        <Link to="/change-password" className="btn btn-secondary">
          Change Password
        </Link>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <StatsCard
          icon={<FiShoppingBag />}
          label="Total Stores"
          value={stats.totalStores}
          delay={0}
        />
        <StatsCard
          icon={<FiCheckSquare />}
          label="My Ratings Submitted"
          value={stats.ratedStores}
          delay={100}
        />
        <StatsCard
          icon={<FiStar />}
          label="My Average Rating"
          value={stats.avgRatingGiven}
          delay={200}
        />
      </div>

      {/* Filters & Search Row */}
      <div className="filters-bar" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <div className="form-group" style={{ flex: 1.5 }}>
          <label className="form-label">Search by Store Name</label>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Search store names..."
              value={search.name}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="form-group" style={{ flex: 1.5 }}>
          <label className="form-label">Search by Location / Address</label>
          <div className="search-input-wrapper">
            <FiMapPin className="search-icon" />
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="Search locations..."
              value={search.address}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Stores Table Listing */}
      <div className="data-table-wrapper" style={{ boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')} className="sortable">
                Store Name {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => toggleSort('address')} className="sortable">
                Address {sortField === 'address' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => toggleSort('averageRating')} className="sortable">
                Overall Rating {sortField === 'averageRating' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => toggleSort('userRating')} className="sortable">
                My Rating {sortField === 'userRating' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={5}>
                    <div className="skeleton-row" style={{ margin: 0, height: '40px' }} />
                  </td>
                </tr>
              ))
            ) : paginatedStores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div className="empty-state" style={{ padding: 0 }}>
                    <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>🏪</div>
                    <div className="empty-state-text" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>No stores matching criteria</div>
                    <p className="text-muted" style={{ margin: '8px 0 0' }}>Try entering different search terms or clearing your queries.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStores.map((store) => (
                <tr key={store.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{store.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiMapPin style={{ color: 'var(--text-muted)' }} />
                      {store.address || 'No address provided'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating value={Math.round(store.averageRating || 0)} readonly size="0.875rem" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--star-gold)' }}>
                        {store.averageRating ? Number(store.averageRating).toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        ({store.totalRatings || 0} reviews)
                      </span>
                    </div>
                  </td>
                  <td>
                    {store.userRating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarRating value={store.userRating.rating} readonly size="0.875rem" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {store.userRating.rating}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '13px' }}>Unrated</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${store.userRating ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => openRateModal(store)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {store.userRating ? <><FiEdit2 /> Edit</> : 'Rate Store'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {processedStores.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span className="text-muted" style={{ fontSize: '13px' }}>
            Showing {Math.min(processedStores.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
            {Math.min(processedStores.length, currentPage * itemsPerPage)} of {processedStores.length} stores
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

      {/* Star Rating Modal popup */}
      {ratingModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Rate Store</h3>
              <button
                className="btn btn-ghost"
                style={{ padding: '6px' }}
                onClick={() => setRatingModal({ isOpen: false, storeId: null, storeName: '', rating: 0 })}
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {ratingModal.storeName}
              </div>
              <p className="text-muted" style={{ marginBottom: '24px', fontSize: '14px' }}>
                Select a star rating to publish your review of this shop.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', transform: 'scale(1.3)', marginBottom: '16px' }}>
                <StarRating
                  value={ratingModal.rating}
                  onChange={(rating) => setRatingModal((prev) => ({ ...prev, rating }))}
                  size="1.75rem"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setRatingModal({ isOpen: false, storeId: null, storeName: '', rating: 0 })}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRatingSubmit}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserStoreList;
