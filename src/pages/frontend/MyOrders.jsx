import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrderService } from '../../services/supabaseService';
import { useAuth } from '../../context/SupabaseAuthContext';
import './MyOrders.css';

const MyOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackOrders = [
    {
      id: 'ORD-001',
      created_at: '2024-01-15',
      status: 'delivered',
      total: 180,
      items: [
        { name: 'Organic Tomatoes', quantity: 2, price: 15 },
        { name: 'Fresh Mangoes', quantity: 3, price: 18 }
      ]
    },
    {
      id: 'ORD-002',
      created_at: '2024-01-20',
      status: 'shipped',
      total: 95,
      items: [
        { name: 'Local Rice (5kg)', quantity: 1, price: 65 },
        { name: 'Palm Oil (1L)', quantity: 1, price: 25 }
      ]
    },
    {
      id: 'ORD-003',
      created_at: '2024-01-22',
      status: 'pending',
      total: 45,
      items: [
        { name: 'Green Peppers', quantity: 5, price: 8 }
      ]
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setOrders(fallbackOrders);
        setLoading(false);
        return;
      }

      try {
        const data = await OrderService.getByUser(currentUser.id);
        
        if (data && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(fallbackOrders);
        }
      } catch (error) {
        console.log('Using fallback orders:', error.message);
        setOrders(fallbackOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Payment',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) return <div className="my-orders-page"><div className="loading">Loading orders...</div></div>;

  return (
    <div className="my-orders-page">
      <div className="container">
        <h1>My Orders</h1>
        
        <div className="orders-summary">
          <div className="summary-card">
            <span className="icon">📦</span>
            <div>
              <span className="count">{orders.filter(o => o.status === 'pending').length}</span>
              <span className="label">Pending</span>
            </div>
          </div>
          <div className="summary-card">
            <span className="icon">🚚</span>
            <div>
              <span className="count">{orders.filter(o => o.status === 'shipped').length}</span>
              <span className="label">Shipped</span>
            </div>
          </div>
          <div className="summary-card">
            <span className="icon">✅</span>
            <div>
              <span className="count">{orders.filter(o => o.status === 'delivered').length}</span>
              <span className="label">Delivered</span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/products" className="shop-btn">Browse Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <span>Order #{order.id}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">GH₵ {item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <span className="total-amount">GH₵ {order.total || order.subtotal}</span>
                  </div>
                  <Link to={`/order-tracking?order=${order.id}`} className="track-btn">
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;