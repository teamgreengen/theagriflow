import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SellerService from '../../services/sellerService';
import './Orders.css';

const SellerOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [currentUser, filter]);

  const loadOrders = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const filters = filter ? { status: filter } : {};
      const data = await SellerService.getAllOrders(currentUser.id, filters);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await SellerService.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    const map = { pending: 'pending', processing: 'processing', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled' };
    return map[status] || 'pending';
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
      </div>

      <div className="orders-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><p>No orders found</p></div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id.slice(-6)}</td>
                  <td>{order.user?.name || 'Customer'}</td>
                  <td>{order.items?.map(i => i.name).join(', ') || 'Items'}</td>
                  <td className="order-amount">GH₵ {order.total}</td>
                  <td><span className={`status ${getStatusClass(order.status)}`}>{order.status}</span></td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {order.status === 'pending' && (
                      <button className="accept-btn" onClick={() => updateStatus(order.id, 'processing')}>Accept</button>
                    )}
                    {order.status === 'processing' && (
                      <button className="complete-btn" onClick={() => updateStatus(order.id, 'delivered')}>Mark Ready</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;