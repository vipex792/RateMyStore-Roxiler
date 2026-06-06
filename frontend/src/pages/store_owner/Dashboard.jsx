import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import StarRating from '../../components/StarRating';
import DataTable from '../../components/DataTable';
import { FiStar, FiUsers, FiTrendingUp } from 'react-icons/fi';

function StoreOwnerDashboard({ showToast }) {
  const [dashboardData, setDashboardData] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratings: [],
  });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchDashboard = useCallback(async () => {
    try {
      const params = {
        sortBy: sortField,
        sortOrder: sortOrder,
      };
      const response = await api.get('/dashboard/store-owner', { params });
      setDashboardData(response.data);
    } catch (err) {
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const columns = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (val) => (
        <StarRating value={val} readonly size="1rem" />
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString(),
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
          <h1>Store Dashboard</h1>
          <p>Monitor your store's performance</p>
        </div>
      </div>

      {/* Prominent Average Rating Display */}
      <div className="avg-rating-display">
        <div className="avg-rating-value">
          {dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : '0.0'}
        </div>
        <div className="avg-rating-stars">
          <StarRating
            value={Math.round(dashboardData.averageRating || 0)}
            readonly
            size="2rem"
          />
        </div>
        <div className="avg-rating-label">Average Store Rating</div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon={<FiStar />}
          label="Average Rating"
          value={dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : '0.0'}
          delay={0}
        />
        <StatsCard
          icon={<FiUsers />}
          label="Total Ratings"
          value={dashboardData.totalRatings}
          delay={100}
        />
        <StatsCard
          icon={<FiTrendingUp />}
          label="Rating Status"
          value={dashboardData.averageRating >= 4 ? '★ Great' : dashboardData.averageRating >= 3 ? '◉ Good' : '◎ Needs Work'}
          delay={200}
        />
      </div>

      {/* Ratings Table */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>User Ratings</h3>
        <DataTable
          columns={columns}
          data={dashboardData.ratings || []}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;
