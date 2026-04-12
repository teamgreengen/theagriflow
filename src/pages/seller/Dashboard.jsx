import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import './Dashboard.css';

const SellerDashboard = () => {
  const { userData } = useAuth();
  const [stats] = useState({
    totalSales: 12500,
    totalOrders: 45,
    pendingOrders: 8,
    totalProducts: 24
  });

  const [recentOrders] = useState([
    { id: '1', customer: 'John Doe', product: 'Tomatoes (5kg)', amount: 75, status: 'pending', date: '2026-04-03' },
    { id: '2', customer: 'Mary Smith', product: 'Mangoes (10kg)', amount: 200, status: 'processing', date: '2026-04-02' },
    { id: '3', customer: 'Peter Jones', product: 'Cassava (5kg)', amount: 60, status: 'delivered', date: '2026-04-01' }
  ]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {userData?.name}!</h1>
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
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>GH₵ {order.amount}</td>
                  <td><span className={`status ${order.status}`}>{order.status}</span></td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
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