import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AdminService from '../../services/adminService';
import '../seller/Dashboard.css';

const AdminDashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setStats({
        totalSellers: 0,
        totalBuyers: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        verifiedSellers: 0,
        pendingSellers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the Agriflow platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <span className="stat-label">Total Sellers</span>
            <span className="stat-value">{stats?.totalSellers || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Buyers</span>
            <span className="stat-value">{stats?.totalBuyers || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats?.totalOrders || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{stats?.pendingOrders || 0}</span>
          </div>
        </div>
        <div className="stat-card accent">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatCurrency(stats?.totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section">
          <h2>Seller Overview</h2>
          <div className="overview-stats">
            <div className="overview-item">
              <span className="count">{stats?.verifiedSellers || 0}</span>
              <span className="label">Verified Sellers</span>
            </div>
            <div className="overview-item">
              <span className="count pending">{stats?.pendingSellers || 0}</span>
              <span className="label">Pending Approval</span>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <a href="/admin/sellers" className="action-card">
              <span className="action-icon">🏪</span>
              <span>Manage Sellers</span>
              {stats?.pendingSellers > 0 && <span className="badge">{stats.pendingSellers}</span>}
            </a>
            <a href="/admin/orders" className="action-card">
              <span className="action-icon">📦</span>
              <span>View Orders</span>
            </a>
            <a href="/admin/categories" className="action-card">
              <span className="action-icon">📁</span>
              <span>Categories</span>
            </a>
            <a href="/admin/banners" className="action-card">
              <span className="action-icon">🎨</span>
              <span>Banners</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;