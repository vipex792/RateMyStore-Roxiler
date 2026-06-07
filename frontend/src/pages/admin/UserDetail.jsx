import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { FiArrowLeft, FiUser, FiMail, FiMapPin, FiShield, FiShoppingBag, FiInfo } from 'react-icons/fi';

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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fade-in">
      {/* Header with back navigation */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>
            <FiArrowLeft /> Back to Users
          </button>
          <div>
            <h1>User Profile</h1>
            <p>Admin security and identity details</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Profile Card Summary */}
        <div className="glass-card-static" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--accent-gradient-subtle)',
              border: '2px solid var(--border-accent)',
              color: 'var(--text-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            {getInitials(user.name)}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user.name}</h2>
          <span className={`navbar-role-badge ${user.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <FiShield /> {getRoleLabel(user.role)}
          </span>
          <p className="text-sm" style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
            User ID: {user.id}
          </p>
        </div>

        {/* Detailed profile properties */}
        <div className="glass-card-static" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <FiInfo style={{ color: 'var(--text-accent)' }} /> Contact & Identity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="detail-item">
              <span className="detail-label"><FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Full Name</span>
              <span className="detail-value" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label"><FiMail style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Email Address</span>
              <span className="detail-value" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label"><FiMapPin style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Location / Address</span>
              <span className="detail-value" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.address || 'Not registered'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Owned Store Reputation profile if user is a Store Owner */}
      {user.role === 'store_owner' && user.store && (
        <div className="glass-card-static" style={{ marginTop: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <FiShoppingBag style={{ color: '#10b981' }} /> Owned Store Reputation Profile
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center' }}>
            <div>
              <div className="detail-item" style={{ marginBottom: '16px' }}>
                <span className="detail-label">Store Name</span>
                <span className="detail-value" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.store.name}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Store Address</span>
                <span className="detail-value" style={{ fontSize: '14px' }}>
                  <FiMapPin style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {user.store.address || 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span className="detail-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Store Review Aggregation</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--star-gold)', lineHeight: 1 }}>
                  {user.store.averageRating ? Number(user.store.averageRating).toFixed(1) : '0.0'}
                </div>
                <div>
                  <StarRating value={Math.round(user.store.averageRating || 0)} readonly size="1.1rem" />
                  <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                    {user.store.totalRatings || 0} user reviews submitted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetail;
