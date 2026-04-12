import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import supabase from '../../config/supabase';
import DeliveryService from '../../services/deliveryService';
import './OrderTracking.css';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get('order');
  const [orderId, setOrderId] = useState(orderParam || '');
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderParam) {
      setOrderId(orderParam);
      trackOrder(orderParam);
    } else {
      setLoading(false);
    }
  }, [orderParam]);

  const trackOrder = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      const deliveryData = await DeliveryService.getByOrder(id);
      setDelivery(deliveryData);
      
    } catch (err) {
      console.error('Order not found:', err);
      setError('Order not found. Please check the order ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    trackOrder(orderId);
  };

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
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const getDeliveryStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      accepted: '#3b82f6',
      picked_up: '#8b5cf6',
      in_transit: '#06b6d4',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getDeliveryStatusLabel = (status) => {
    const labels = {
      pending: 'Waiting for Rider',
      accepted: 'Rider Assigned',
      picked_up: 'Picked Up',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const getTrackingSteps = (status) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📦' },
      { status: 'processing', label: 'Seller Processing', icon: '📋' },
      { status: 'shipped', label: 'Shipped', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex
    }));
  };

  const getDeliveryTimeline = (status) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📦' },
      { status: 'accepted', label: 'Rider Assigned', icon: '👤' },
      { status: 'picked_up', label: 'Picked Up', icon: '📍' },
      { status: 'in_transit', label: 'In Transit', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const statusOrder = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="container">
          <div className="loading">Loading order...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <div className="container">
        <h1>Track Your Order</h1>
        
        <div className="order-search">
          <form onSubmit={handleTrack}>
            <input
              type="text"
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button type="submit">Track</button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="order-details">
            <div className="order-header">
              <div>
                <span className="order-id">Order #{order.id.slice(-6)}</span>
                <span className="order-date">Placed on {formatDate(order.created_at)}</span>
              </div>
              <span 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="tracking-timeline">
              {getTrackingSteps(order.status).map((step, index) => (
                <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                  <div className="timeline-dot">
                    {step.completed && <span>✓</span>}
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-status">{step.label}</span>
                    <span className="timeline-icon">{step.icon}</span>
                  </div>
                  {index < getTrackingSteps(order.status).length - 1 && (
                    <div className={`timeline-line ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>

            {delivery && (
              <div className="delivery-section">
                <h2>🚚 Delivery Status</h2>
                <div className="delivery-status-card">
                  <span 
                    className="delivery-badge"
                    style={{ backgroundColor: getDeliveryStatusColor(delivery.status) }}
                  >
                    {getDeliveryStatusLabel(delivery.status)}
                  </span>
                </div>

                <div className="delivery-timeline">
                  {getDeliveryTimeline(delivery.status).map((step, index) => (
                    <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                      <div className="timeline-dot">
                        {step.completed && <span>✓</span>}
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-status">{step.label}</span>
                        <span className="timeline-icon">{step.icon}</span>
                      </div>
                      {index < getDeliveryTimeline(delivery.status).length - 1 && (
                        <div className={`timeline-line ${step.completed ? 'completed' : ''}`}></div>
                      )}
                    </div>
                  ))}
                </div>

                {delivery.rider && (
                  <div className="rider-info">
                    <h3>Your Rider</h3>
                    <div className="rider-details">
                      <div className="rider-avatar">👤</div>
                      <div className="rider-text">
                        <strong>{delivery.rider.name || 'Assigned Rider'}</strong>
                        {delivery.rider.phone && <p>📞 {delivery.rider.phone}</p>}
                        {delivery.rider.email && <p>✉️ {delivery.rider.email}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="delivery-address">
                  <h3>Delivery Address</h3>
                  <p>{delivery.deliveryAddress || order.delivery?.address || 'Customer Address'}</p>
                  {delivery.deliveryPhone && <p>📞 {delivery.deliveryPhone}</p>}
                </div>
              </div>
            )}

            <div className="order-items">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>x{item.quantity}</td>
                      <td>GH₵ {item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>GH₵ {order.subtotal || order.total}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>GH₵ {order.deliveryFee || 0}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>GH₵ {order.total}</span>
              </div>
            </div>
          </div>
        )}

        {!order && !error && (
          <div className="no-order">
            <p>Enter your order ID to track your order</p>
            <Link to="/my-orders" className="view-orders-btn">View My Orders</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;