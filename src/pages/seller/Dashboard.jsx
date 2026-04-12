import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SellerService from '../../services/sellerService';
import './Dashboard.css';

const SellerDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const [statsData, ordersData] = await Promise.all([
          SellerService.getStats(currentUser.id),
          SellerService.getRecentOrders(currentUser.id, 5)
        ]);
        setStats(statsData);
        setRecentOrders(ordersData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    const map = { pending: 'pending', processing: 'processing', delivered: 'delivered', cancelled: 'cancelled' };
    return map[status] || 'pending';
  };

  if (loading) return <div className="dashboard-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {userData?.name || 'Seller'}!</h1>
        <p>Manage your store and orders</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Total Sales</span>
            <span className="stat-value">GH₵ {stats.totalSales.toLocaleString()}</span>
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
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{stats.pendingOrders}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍅</div>
          <div className="stat-info">
            <span className="stat-label">Products</span>
            <span className="stat-value">{stats.totalProducts}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="empty-state"><p>No orders yet</p></div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(-6)}</td>
                    <td>{order.user?.name || 'Customer'}</td>
                    <td>GH₵ {order.total}</td>
                    <td><span className={`status ${getStatusClass(order.status)}`}>{order.status}</span></td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <a href="/seller/products" className="action-btn">Add Product</a>
            <a href="/seller/orders" className="action-btn">View Orders</a>
            <a href="/seller/earnings" className="action-btn">Withdraw Earnings</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;