import { useState } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';

const RiderDashboard = () => {
  const { userData } = useAuth();
  const [stats] = useState({
    todayDeliveries: 8,
    totalEarnings: 1250,
    completedDeliveries: 156,
    rating: 4.8
  });

  const [availableDeliveries] = useState([
    { id: 'DEL-001', pickup: 'Green Farm, Accra', delivery: 'Tema, Accra', amount: 25, distance: '15km' },
    { id: 'DEL-002', pickup: 'Tropical Fruits, Kumasi', delivery: 'Asokwa, Kumasi', amount: 20, distance: '5km' }
  ]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, Rider!</h1>
        <p>Accept deliveries and earn money</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Today Deliveries</span>
            <span className="stat-value">{stats.todayDeliveries}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Total Earnings</span>
            <span className="stat-value">GH₵ {stats.totalEarnings}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completedDeliveries}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-label">Rating</span>
            <span className="stat-value">{stats.rating}</span>
          </div>
        </div>
      </div>

      <div className="available-deliveries">
        <h2>Available Deliveries</h2>
        <div className="delivery-list">
          {availableDeliveries.map(del => (
            <div key={del.id} className="delivery-card">
              <div className="delivery-info">
                <h4>{del.id}</h4>
                <p>📍 Pickup: {del.pickup}</p>
                <p>🏁 Delivery: {del.delivery}</p>
                <p>📏 Distance: {del.distance}</p>
              </div>
              <div className="delivery-action">
                <span className="amount">GH₵ {del.amount}</span>
                <button className="accept-btn">Accept</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;