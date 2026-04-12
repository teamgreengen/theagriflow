import { useState } from 'react';

const SellerOrders = () => {
  const [orders] = useState([
    { id: 'ORD-001', customer: 'John Doe', items: 'Tomatoes (5kg)', total: 75, status: 'pending', date: '2026-04-03' },
    { id: 'ORD-002', customer: 'Mary Smith', items: 'Mangoes (10kg)', total: 200, status: 'processing', date: '2026-04-02' },
    { id: 'ORD-003', customer: 'Peter Jones', items: 'Cassava (5kg)', total: 60, status: 'delivered', date: '2026-04-01' }
  ]);

  const updateStatus = (orderId, newStatus) => {
    console.log('Update order:', orderId, newStatus);
  };

  return (
    <div className="orders-page">
      <h1>Orders</h1>
      
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
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>GH₵ {order.total}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
                <td>{order.date}</td>
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
    </div>
  );
};

export default SellerOrders;