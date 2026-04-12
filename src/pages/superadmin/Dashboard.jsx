import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';

const SuperAdminDashboard = () => {
  const { userData } = useAuth();
  const [stats] = useState({
    totalUsers: 380,
    totalSellers: 45,
    totalAdmins: 5,
    totalRiders: 28,
    totalOrders: 450,
    platformRevenue: 125000,
    commissionRate: 10
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <p>Platform-wide management and analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <span className="stat-label">Sellers</span>
            <span className="stat-value">{stats.totalSellers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-info">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{stats.totalAdmins}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚴</div>
          <div className="stat-info">
            <span className="stat-label">Riders</span>
            <span className="stat-value">{stats.totalRiders}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Platform Revenue</span>
            <span className="stat-value">GH₵ {stats.platformRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <a href="/superadmin/admins" className="action-card">Manage Admins</a>
          <a href="/superadmin/settings" className="action-card">Platform Settings</a>
          <a href="/admin" className="action-card">Admin Panel</a>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;