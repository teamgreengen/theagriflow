import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderTracking.css';

const OrderTracking = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [orders] = useState([
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      items: [
        { name: 'Fresh Tomatoes', quantity: 2, price: 50 },
        { name: 'Organic Maize', quantity: 1, price: 80 }
      ],
      total: 180,
      deliveryFee: 15,
      tracking: [
        { status: 'Order Placed', date: '2024-01-15 10:30', completed: true },
        { status: 'Payment Confirmed', date: '2024-01-15 10:35', completed: true },
        { status: 'Seller Processing', date: '2024-01-15 11:00', completed: true },
        { status: 'Out for Delivery', date: '2024-01-16 08:00', completed: true },
        { status: 'Delivered', date: '2024-01-16 14:30', completed: true }
      ]
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-18',
      status: 'in_transit',
      items: [
        { name: 'Cassava', quantity: 5, price: 25 }
      ],
      total: 125,
      deliveryFee: 20,
      tracking: [
        { status: 'Order Placed', date: '2024-01-18 09:00', completed: true },
        { status: 'Payment Confirmed', date: '2024-01-18 09:10', completed: true },
        { status: 'Seller Processing', date: '2024-01-18 10:00', completed: true },
        { status: 'Out for Delivery', date: '2024-01-19 07:00', completed: true },
        { status: 'Delivered', date: '', completed: false }
      ]
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-20',
      status: 'pending',
      items: [
        { name: 'Yam', quantity: 3, price: 60 },
        { name: 'Plantain', quantity: 2, price: 40 }
      ],
      total: 260,
      deliveryFee: 18,
      tracking: [
        { status: 'Order Placed', date: '2024-01-20 14:00', completed: true },
        { status: 'Payment Confirmed', date: '', completed: false },
        { status: 'Seller Processing', date: '', completed: false },
        { status: 'Out for Delivery', date: '', completed: false },
        { status: 'Delivered', date: '', completed: false }
      ]
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#22c55e';
      case 'in_transit': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const selectedOrder = orders.find(o => o.id === orderId) || orders[0];

  return (
    <div className="order-tracking-page">
      <div className="container">
        <h1>Track Your Order</h1>
        
        <div className="order-search">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button>Track</button>
        </div>

        <div className="order-details">
          <div className="order-header">
            <div>
              <span className="order-id">Order #{selectedOrder.id}</span>
              <span className="order-date">Placed on {selectedOrder.date}</span>
            </div>
            <span 
              className="order-status"
              style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
            >
              {getStatusLabel(selectedOrder.status)}
            </span>
          </div>

          <div className="tracking-timeline">
            {selectedOrder.tracking.map((step, index) => (
              <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                <div className="timeline-dot">
                  {step.completed && <span>✓</span>}
                </div>
                <div className="timeline-content">
                  <span className="timeline-status">{step.status}</span>
                  <span className="timeline-date">{step.date || 'Pending'}</span>
                </div>
                {index < selectedOrder.tracking.length - 1 && (
                  <div className={`timeline-line ${step.completed ? 'completed' : ''}`}></div>
                )}
              </div>
            ))}
          </div>

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
                {selectedOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>GH₵ {item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>GH₵ {selectedOrder.total}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>GH₵ {selectedOrder.deliveryFee}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>GH₵ {selectedOrder.total + selectedOrder.deliveryFee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
