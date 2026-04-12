import { useState } from 'react';

const RiderDeliveries = () => {
  const [deliveries] = useState([
    { id: 'DEL-001', pickup: 'Green Farm, Accra', delivery: 'Tema, Accra', amount: 25, status: 'completed', date: '2026-04-03' },
    { id: 'DEL-002', pickup: 'Tropical Fruits, Kumasi', delivery: 'Asokwa, Kumasi', amount: 20, status: 'completed', date: '2026-04-03' },
    { id: 'DEL-003', pickup: 'Local Farmers, Accra', delivery: 'Spintex, Accra', amount: 30, status: 'in_progress', date: '2026-04-03' }
  ]);

  const updateStatus = (id, status) => {
    console.log('Update delivery:', id, status);
  };

  return (
    <div className="deliveries-page">
      <h1>My Deliveries</h1>
      
      <div className="deliveries-list">
        {deliveries.map(del => (
          <div key={del.id} className="delivery-card">
            <div className="delivery-info">
              <h4>{del.id}</h4>
              <p>📍 From: {del.pickup}</p>
              <p>🏁 To: {del.delivery}</p>
              <p>📅 {del.date}</p>
            </div>
            <div className="delivery-status">
              <span className={`status ${del.status}`}>{del.status.replace('_', ' ')}</span>
              <span className="amount">GH₵ {del.amount}</span>
              {del.status === 'in_progress' && (
                <button className="complete-btn" onClick={() => updateStatus(del.id, 'completed')}>Mark Delivered</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiderDeliveries;