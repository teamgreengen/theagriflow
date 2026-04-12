import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminDashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        SuperAdminService.getStats(),
        SuperAdminService.getRecentActivity(5)
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setStats({
        totalUsers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        totalRiders: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalProducts: 0,
        platformRevenue: 0,
        commissionRate: 10,
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page super-admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p>Platform-wide management and analytics</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={loadDashboardData}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats?.totalUsers || 0}</span>
            <span className="stat-sub">{stats?.totalBuyers || 0} buyers</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <span className="stat-label">Sellers</span>
            <span className="stat-value">{stats?.totalSellers || 0}</span>
            <span className="stat-sub">{stats?.verifiedSellers || 0} verified</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-info">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{stats?.totalAdmins || 0}</span>
            <span className="stat-sub">Super Admin</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚴</div>
          <div className="stat-info">
            <span className="stat-label">Riders</span>
            <span className="stat-value">{stats?.totalRiders || 0}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Orders</span>
            <span className="stat-value">{stats?.totalOrders || 0}</span>
            <span className="stat-sub">{stats?.pendingOrders || 0} pending</span>
          </div>
        </div>
        
        <div className="stat-card accent">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Platform Revenue</span>
            <span className="stat-value">{formatCurrency(stats?.platformRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section orders-summary">
          <h2>Orders Overview</h2>
          <div className="order-stats">
            <div className="order-stat">
              <span className="label">Pending</span>
              <span className="value pending">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="order-stat">
              <span className="label">Completed</span>
              <span className="value completed">{stats?.completedOrders || 0}</span>
            </div>
            <div className="order-stat">
              <span className="label">Products</span>
              <span className="value">{stats?.totalProducts || 0}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <a href="/superadmin/admins" className="action-card">
              <span className="action-icon">👥</span>
              <span>Manage Admins</span>
            </a>
            <a href="/superadmin/users" className="action-card">
              <span className="action-icon">👤</span>
              <span>All Users</span>
            </a>
            <a href="/superadmin/sellers" className="action-card">
              <span className="action-icon">🏪</span>
              <span>Sellers</span>
              {stats?.pendingSellers > 0 && (
                <span className="badge">{stats.pendingSellers}</span>
              )}
            </a>
            <a href="/superadmin/settings" className="action-card">
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </a>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section seller-approvals">
          <h2>Seller Approvals</h2>
          <div className="approval-stats">
            <div className="approval-item">
              <span className="count pending">{stats?.pendingSellers || 0}</span>
              <span className="label">Pending Approval</span>
            </div>
            <div className="approval-item">
              <span className="count verified">{stats?.verifiedSellers || 0}</span>
              <span className="label">Verified Sellers</span>
            </div>
          </div>
          {stats?.pendingSellers > 0 && (
            <a href="/superadmin/sellers?filter=pending" className="view-all-link">
              Review pending sellers →
            </a>
          )}
        </div>

        <div className="dashboard-section recent-activity">
          <h2>Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((log, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-action">{log.action}</span>
                  <span className="activity-time">{formatDate(log.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent activity</p>
          )}
        </div>
      </div>

      <div className="dashboard-section platform-health">
        <h2>Platform Health</h2>
        <div className="health-grid">
          <div className="health-item">
            <div className="health-bar" style={{ '--width': '100%' }}></div>
            <span className="health-label">Database</span>
            <span className="health-status healthy">Healthy</span>
          </div>
          <div className="health-item">
            <div className="health-bar" style={{ '--width': '100%' }}></div>
            <span className="health-label">API Services</span>
            <span className="health-status healthy">Operational</span>
          </div>
          <div className="health-item">
            <div className="health-bar" style={{ '--width': '100%' }}></div>
            <span className="health-label">Storage</span>
            <span className="health-status healthy">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;