import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import RiderService from '../../services/riderService';
import './Dashboard.css';

const RiderDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [stats, setStats] = useState({ todayDeliveries: 0, totalEarnings: 0, completedDeliveries: 0, rating: 4.8 });
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, deliveriesData] = await Promise.all([
        currentUser ? RiderService.getStats(currentUser.id) : Promise.resolve({ todayDeliveries: 8, totalEarnings: 1250, completedDeliveries: 156, rating: 4.8 }),
        RiderService.getAvailableDeliveries()
      ]);
      setStats(statsData);
      setAvailableDeliveries(deliveriesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (deliveryId) => {
    if (!currentUser) {
      alert('Please log in to accept deliveries');
      return;
    }
    try {
      await RiderService.acceptDelivery(deliveryId, currentUser.id);
      alert('Delivery accepted!');
      loadData();
    } catch (err) {
      alert('Failed to accept: ' + err.message);
    }
  };

  if (loading) return <div className="dashboard-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {userData?.name || 'Rider'}!</h1>
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
            <span className="stat-value">GH₵ {stats.totalEarnings.toLocaleString()}</span>
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
        {availableDeliveries.length === 0 ? (
          <div className="empty-state"><p>No deliveries available</p></div>
        ) : (
          <div className="delivery-list">
            {availableDeliveries.map(del => (
              <div key={del.id} className="delivery-card">
                <div className="delivery-info">
                  <h4>{del.id}</h4>
                  <p>📍 Pickup: {del.pickupAddress || del.seller?.name || 'Seller Location'}</p>
                  <p>🏁 Delivery: {del.deliveryAddress || 'Customer Location'}</p>
                  <p>📏 Distance: {del.distance || 'N/A'}</p>
                </div>
                <div className="delivery-action">
                  <span className="amount">GH₵ {del.fee || del.amount || 0}</span>
                  <button className="accept-btn" onClick={() => handleAccept(del.id)}>Accept</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;