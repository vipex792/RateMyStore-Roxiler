import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { FiArrowLeft, FiUser, FiMail, FiMapPin, FiShield } from 'react-icons/fi';

function UserDetail({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data.user);
    } catch (err) {
      showToast('Failed to load user details.', 'error');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'store_owner': return 'Store Owner';
      default: return 'Normal User';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/users')}>
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1>User Details</h1>
            <p>Viewing profile information</p>
          </div>
        </div>
      </div>

      <div className="glass-card-static user-detail-card">
        <div className="user-detail-grid">
          <div className="detail-item">
            <span className="detail-label"><FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />Name</span>
            <span className="detail-value">{user.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label"><FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} />Email</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label"><FiMapPin style={{ marginRight: '6px', verticalAlign: 'middle' }} />Address</span>
            <span className="detail-value">{user.address}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label"><FiShield style={{ marginRight: '6px', verticalAlign: 'middle' }} />Role</span>
            <span className="detail-value">
              <span className={`navbar-role-badge ${user.role}`}>
                {getRoleLabel(user.role)}
              </span>
            </span>
          </div>
        </div>

        {/* If store_owner, show their store's average rating */}
        {user.role === 'store_owner' && user.store && (
          <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ marginBottom: 'var(--space-md)' }}>Store Rating</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <StarRating value={Math.round(user.store.averageRating || 0)} readonly />
              <span className="star-rating-value" style={{ fontSize: 'var(--font-size-xl)' }}>
                {user.store.averageRating ? Number(user.store.averageRating).toFixed(1) : 'N/A'}
              </span>
            </div>
            {user.store.name && (
              <p className="text-sm text-muted" style={{ marginTop: 'var(--space-sm)' }}>
                Store: {user.store.name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
