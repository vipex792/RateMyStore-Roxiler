import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import Navbar from '../../components/Navbar';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function UserStoreList({ showToast }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });

  const fetchStores = useCallback(async () => {
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;

      const response = await api.get('/stores', { params });
      setStores(response.data.stores || []);
    } catch (err) {
      showToast('Failed to load stores.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleRating = async (storeId, rating) => {
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
      // Refresh stores to update ratings
      fetchStores();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit rating.';
      showToast(message, 'error');
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

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
          <h1>Browse Stores</h1>
          <p>Discover and rate stores near you</p>
        </div>
        <Link to="/change-password" className="btn btn-secondary">
          Change Password
        </Link>
      </div>

      <div className="filters-bar">
        <div className="form-group">
          <label className="form-label">Search by Name</label>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Search store name..."
              value={search.name}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Search by Address</label>
          <div className="search-input-wrapper">
            <FiMapPin className="search-icon" />
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="Search by address..."
              value={search.address}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-text">No stores found</div>
          <p className="text-muted">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((store, index) => (
            <div
              key={store.id}
              className="store-card"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="store-card-header">
                <div>
                  <div className="store-card-name">{store.name}</div>
                  <div className="store-card-address">
                    <FiMapPin style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {store.address}
                  </div>
                </div>
              </div>

              <div className="store-card-rating-section">
                <div className="store-card-rating-row">
                  <span className="store-card-rating-label">Overall Rating</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating value={Math.round(store.averageRating || 0)} readonly size="1rem" />
                    <span className="star-rating-value">
                      {store.averageRating ? Number(store.averageRating).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="store-card-rating-row" style={{ marginBottom: 0 }}>
                  <span className="store-card-rating-label">Your Rating</span>
                  <StarRating
                    value={store.userRating?.rating || 0}
                    onChange={(rating) => handleRating(store.id, rating)}
                    size="1.25rem"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserStoreList;
