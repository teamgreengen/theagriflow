import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AdminService from '../../services/adminService';
import './Sellers.css';

const AdminSellers = () => {
  const { currentUser } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    loadSellers();
  }, [filter]);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter === 'pending') filters.status = 'pending';
      if (filter === 'verified') filters.verified = true;
      if (filter === 'suspended') filters.status = 'suspended';
      
      const data = await AdminService.getAllSellers(filters);
      setSellers(data || []);
    } catch (err) {
      console.error('Failed to load sellers:', err);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (sellerId, verified) => {
    try {
      await AdminService.verifySeller(sellerId, verified);
      await AdminService.logAction(currentUser?.id, verified ? 'verify_seller' : 'unverify_seller', 'sellers', sellerId);
      loadSellers();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleStatusChange = async (sellerId, status) => {
    try {
      await AdminService.updateSellerStatus(sellerId, status);
      await AdminService.logAction(currentUser?.id, 'update_seller_status', 'sellers', sellerId, { status });
      loadSellers();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="sellers-page">
      <div className="page-header">
        <h1>Manage Sellers</h1>
      </div>

      <div className="filter-tabs">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All Sellers</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
        <button className={filter === 'verified' ? 'active' : ''} onClick={() => setFilter('verified')}>Verified</button>
        <button className={filter === 'suspended' ? 'active' : ''} onClick={() => setFilter('suspended')}>Suspended</button>
      </div>

      <div className="sellers-table-wrapper">
        {loading ? (
          <div className="loading">Loading sellers...</div>
        ) : sellers.length === 0 ? (
          <div className="empty-state"><p>No sellers found</p></div>
        ) : (
          <table className="sellers-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Store Name</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Total Sales</th>
                <th>Rating</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => (
                <tr key={seller.id}>
                  <td className="seller-cell">
                    <div className="avatar">{seller.user?.name?.charAt(0).toUpperCase() || 'S'}</div>
                    <div>
                      <div className="seller-name">{seller.user?.name || 'Unknown'}</div>
                      <div className="seller-email">{seller.user?.email}</div>
                    </div>
                  </td>
                  <td>{seller.storeName || 'N/A'}</td>
                  <td>
                    <select 
                      value={seller.status || 'active'} 
                      onChange={(e) => handleStatusChange(seller.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className={`verify-btn ${seller.verified ? 'verified' : ''}`}
                      onClick={() => handleVerify(seller.id, !seller.verified)}
                    >
                      {seller.verified ? '✓ Verified' : 'Verify'}
                    </button>
                  </td>
                  <td>{seller.totalSales || 0}</td>
                  <td><span className="rating">★ {seller.rating || '0.0'}</span></td>
                  <td>{formatDate(seller.created_at)}</td>
                  <td>
                    <button className="view-btn" onClick={() => setSelectedSeller(seller)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedSeller && (
        <div className="modal-overlay" onClick={() => setSelectedSeller(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seller Details</h2>
              <button className="close-btn" onClick={() => setSelectedSeller(null)}>×</button>
            </div>
            <div className="seller-details">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span>{selectedSeller.user?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{selectedSeller.user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Store:</span>
                <span>{selectedSeller.storeName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Description:</span>
                <span>{selectedSeller.description || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Sales:</span>
                <span>{selectedSeller.totalSales || 0}</span>
              </div>
              <div className="detail-row">
                <span className="label">Rating:</span>
                <span>★ {selectedSeller.rating || '0.0'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Verified:</span>
                <span className={selectedSeller.verified ? 'verified' : 'not-verified'}>
                  {selectedSeller.verified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;