import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import '../seller/Dashboard.css';

const AdminDashboard = () => {
  const { userData } = useAuth();
  const [stats] = useState({
    totalSellers: 45,
    totalBuyers: 280,
    totalOrders: 156,
    totalRevenue: 45000
  });

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
            <span className="stat-value">{stats.totalSellers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Buyers</span>
            <span className="stat-value">{stats.totalBuyers}</span>
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
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">GH₵ {stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <a href="/admin/sellers" className="action-card">Manage Sellers</a>
          <a href="/admin/orders" className="action-card">View Orders</a>
          <a href="/admin/categories" className="action-card">Categories</a>
          <a href="/superadmin/settings" className="action-card">Platform Settings</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;