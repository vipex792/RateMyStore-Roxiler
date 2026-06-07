import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import StarRating from '../../components/StarRating';
import { BarChart, LineChart } from '../../components/SvgCharts';
import { FiStar, FiUsers, FiTrendingUp, FiDownload, FiCalendar, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function StoreOwnerDashboard({ showToast }) {
  const [dashboardData, setDashboardData] = useState({
    store: null,
    averageRating: 0,
    totalRatings: 0,
    ratings: [],
  });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and pagination states
  const [filterRating, setFilterRating] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
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
      setSortOrder('desc'); // Default to desc for ratings and dates
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    const ratings = dashboardData.ratings || [];
    if (ratings.length === 0) {
      showToast('No ratings available to export.', 'warning');
      return;
    }

    const headers = ['User Name', 'User Email', 'Rating', 'Date Submitted'];
    const rows = ratings.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      r.rating,
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ratings_${dashboardData.store?.name || 'store'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV report downloaded successfully.', 'success');
  };

  // Filter and Sort processing
  const filteredRatings = useMemo(() => {
    let result = [...(dashboardData.ratings || [])];

    // Filter by rating score
    if (filterRating) {
      result = result.filter((r) => r.rating === parseInt(filterRating));
    }

    return result;
  }, [dashboardData.ratings, filterRating]);

  // Paginated ratings
  const paginatedRatings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRatings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRatings, currentPage]);

  const totalPages = Math.max(Math.ceil(filteredRatings.length / itemsPerPage), 1);

  // Chart Data compilation
  const distributionData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 1 star to 5 star
    (dashboardData.ratings || []).forEach((r) => {
      const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
      counts[idx]++;
    });
    return counts;
  }, [dashboardData.ratings]);

  const trendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    // Generate last 6 months keys
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyMap[key] = 0;
    }

    // Populate data
    (dashboardData.ratings || []).forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key]++;
      }
    });

    return Object.keys(monthlyMap).map((key) => ({
      label: key,
      value: monthlyMap[key],
    }));
  }, [dashboardData.ratings]);

  if (loading && !dashboardData.store) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>{dashboardData.store?.name || 'Store Dashboard'}</h1>
          <p>Analytics, rating trends, and reviews overview</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <FiDownload /> Export to CSV
        </button>
      </div>

      {/* Prominent Average Rating Panel */}
      <div className="avg-rating-display" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', background: 'var(--bg-secondary)', marginBottom: '32px' }}>
        <div className="avg-rating-value" style={{ color: 'var(--text-accent)' }}>
          {dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : '0.0'}
        </div>
        <div className="avg-rating-stars">
          <StarRating value={Math.round(dashboardData.averageRating || 0)} readonly size="2rem" />
        </div>
        <div className="avg-rating-label">Overall Store Rating (Based on {dashboardData.totalRatings} user reviews)</div>
      </div>

      {/* Analytics Metric Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatsCard
          icon={<FiStar />}
          label="Average Store Rating"
          value={dashboardData.averageRating ? Number(dashboardData.averageRating).toFixed(1) : '0.0'}
          delay={0}
        />
        <StatsCard
          icon={<FiUsers />}
          label="Total Ratings Received"
          value={dashboardData.totalRatings}
          delay={100}
        />
        <StatsCard
          icon={<FiTrendingUp />}
          label="Reputation Index"
          value={dashboardData.averageRating >= 4.0 ? 'Excellent' : dashboardData.averageRating >= 3.0 ? 'Stable' : 'Attention Required'}
          delay={200}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <BarChart
          data={distributionData}
          labels={['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']}
          title="Rating Distribution"
          color="var(--accent-purple)"
        />
        <LineChart
          data={trendData}
          title="Monthly Ratings Volatility"
          color="var(--accent-blue)"
        />
      </div>

      {/* Reviews Table section */}
      <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customer Reviews</h3>

          {/* Filtering Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiFilter className="text-muted" />
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ padding: '8px 32px 8px 12px', minWidth: '150px' }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="data-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  User Name {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  User Email {sortField === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('rating')} className="sortable">
                  Rating {sortField === 'rating' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Date Submitted {sortField === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRatings.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>⭐</div>
                      <div className="empty-state-text" style={{ fontSize: '1.1rem', fontWeight: 600 }}>No ratings match this score filter</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRatings.map((rating) => (
                  <tr key={rating.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rating.name}</td>
                    <td>{rating.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarRating value={rating.rating} readonly size="0.875rem" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--star-gold)' }}>
                          {rating.rating}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar className="text-muted" />
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reviews Pagination */}
        {filteredRatings.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <span className="text-muted" style={{ fontSize: '13px' }}>
              Showing {Math.min(filteredRatings.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filteredRatings.length, currentPage * itemsPerPage)} of {filteredRatings.length} reviews
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
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;
