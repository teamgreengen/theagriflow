import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AdminService from '../../services/adminService';
import './Orders.css';

const AdminOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter) filters.status = filter;
      const data = await AdminService.getAllOrders(filters);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await AdminService.updateOrderStatus(orderId, status);
      await AdminService.logAction(currentUser?.id, 'update_order_status', 'orders', orderId, { status });
      loadOrders();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };
    return classes[status] || 'pending';
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>All Orders</h1>
      </div>

      <div className="filters-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-table-wrapper">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><p>No orders found</p></div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Seller</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">{order.orderNumber || order.id.slice(0, 8)}</td>
                  <td>{order.user?.name || order.user?.email || 'N/A'}</td>
                  <td>{order.seller?.name || 'N/A'}</td>
                  <td className="amount">{formatCurrency(order.total)}</td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`status-select ${getStatusClass(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <button className="view-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;