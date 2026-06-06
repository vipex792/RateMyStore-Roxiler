import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiUsers, FiShoppingBag, FiStar } from 'react-icons/fi';

function AdminDashboard({ showToast }) {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setStats(response.data);
    } catch (err) {
      showToast('Failed to load dashboard stats.', 'error');
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your platform statistics</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          icon={<FiUsers />}
          label="Total Users"
          value={stats.totalUsers}
          delay={0}
        />
        <StatsCard
          icon={<FiShoppingBag />}
          label="Total Stores"
          value={stats.totalStores}
          delay={100}
        />
        <StatsCard
          icon={<FiStar />}
          label="Total Ratings"
          value={stats.totalRatings}
          delay={200}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
