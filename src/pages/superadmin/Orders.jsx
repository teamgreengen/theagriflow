import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminOrders = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('payment') || '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await SuperAdminService.getAllOrders(filters);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await SuperAdminService.updateOrderStatus(orderId, newStatus);
      await SuperAdminService.logAction(currentUser?.id, 'update_order_status', 'orders', orderId, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert('Failed to update order: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };
    return colors[status] || 'pending';
  };

  const exportToCSV = async () => {
    const data = await SuperAdminService.exportOrders(filters);
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export.csv`;
    a.click();
  };

  return (
    <div className="orders-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Order Management</h1>
          <p>View and manage all platform orders</p>
        </div>
        <button className="export-btn" onClick={exportToCSV}>📥 Export</button>
      </div>

      <div className="filters-bar">
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filters.paymentStatus} onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}>
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <input 
          type="date" 
          value={filters.dateFrom} 
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          placeholder="From date"
        />
        <input 
          type="date" 
          value={filters.dateTo} 
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          placeholder="To date"
        />
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><p>No orders found</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Seller</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
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
                      className={`status-select ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.paymentStatus}`}>
                      {order.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td className="date">{formatDate(order.created_at)}</td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedOrder(order)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="order-details">
              <div className="detail-section">
                <h4>Customer Info</h4>
                <p><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
              </div>
              <div className="detail-section">
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.region}</p>
              </div>
              <div className="detail-section">
                <h4>Order Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="order-totals">
                  <p><span>Subtotal:</span> <span>{formatCurrency(selectedOrder.subtotal)}</span></p>
                  <p><span>Delivery:</span> <span>{formatCurrency(selectedOrder.deliveryFee)}</span></p>
                  <p><strong>Total:</strong> <strong>{formatCurrency(selectedOrder.total)}</strong></p>
                </div>
              </div>
              <div className="detail-section timeline">
                <h4>Order Timeline</h4>
                <div className="timeline-item">
                  <span className="dot active"></span>
                  <span>Created - {formatDate(selectedOrder.created_at)}</span>
                </div>
                {selectedOrder.status !== 'pending' && (
                  <div className="timeline-item">
                    <span className="dot"></span>
                    <span>Status: {selectedOrder.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminOrders;