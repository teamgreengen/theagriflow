import { useState } from 'react';

const AdminOrders = () => {
  const [orders] = useState([
    { id: 'ORD-001', buyer: 'John Doe', seller: 'Green Farm', amount: 150, status: 'delivered', date: '2026-04-03' },
    { id: 'ORD-002', buyer: 'Mary Smith', seller: 'Tropical Fruits', amount: 200, status: 'processing', date: '2026-04-02' },
    { id: 'ORD-003', buyer: 'Peter Jones', seller: 'Local Farmers', amount: 75, status: 'pending', date: '2026-04-01' }
  ]);

  return (
    <div className="orders-page">
      <h1>All Orders</h1>
      
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.buyer}</td>
                <td>{order.seller}</td>
                <td>GH₵ {order.amount}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;