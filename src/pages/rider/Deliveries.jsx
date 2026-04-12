import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import RiderService from '../../services/riderService';
import './Deliveries.css';

const RiderDeliveries = () => {
  const { currentUser } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, [currentUser, filter]);

  const loadDeliveries = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await RiderService.getMyDeliveries(currentUser.id, filter);
      setDeliveries(data);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deliveryId, status) => {
    try {
      await RiderService.updateDeliveryStatus(deliveryId, status);
      loadDeliveries();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    const map = { pending: 'pending', accepted: 'accepted', in_progress: 'in_progress', completed: 'completed', cancelled: 'cancelled' };
    return map[status] || 'pending';
  };

  return (
    <div className="deliveries-page">
      <div className="page-header">
        <h1>My Deliveries</h1>
      </div>

      <div className="filter-tabs">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All</button>
        <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : deliveries.length === 0 ? (
        <div className="empty-state"><p>No deliveries found</p></div>
      ) : (
        <div className="deliveries-list">
          {deliveries.map(del => (
            <div key={del.id} className="delivery-card">
              <div className="delivery-info">
                <h4>{del.id}</h4>
                <p>📍 From: {del.pickupAddress || del.seller?.name || 'Seller'}</p>
                <p>🏁 To: {del.deliveryAddress || 'Customer'}</p>
                <p>📅 {formatDate(del.created_at)}</p>
              </div>
              <div className="delivery-status">
                <span className={`status ${getStatusClass(del.status)}`}>{del.status}</span>
                <span className="amount">GH₵ {del.fee || del.amount || 0}</span>
                {del.status === 'accepted' && (
                  <button className="complete-btn" onClick={() => updateStatus(del.id, 'completed')}>Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderDeliveries;