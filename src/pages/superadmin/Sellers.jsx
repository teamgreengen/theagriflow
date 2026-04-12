import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import supabase from '../../config/supabase';
import './SuperAdmin.css';

const SuperAdminSellers = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerStats, setSellerStats] = useState(null);
  const [filter, setFilter] = useState(searchParams.get('filter') || '');

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
      
      const data = await SuperAdminService.getAllSellers(filters);
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
      await SuperAdminService.verifySeller(sellerId, verified);
      await SuperAdminService.logAction(currentUser?.id, verified ? 'verify_seller' : 'unverify_seller', 'sellers', sellerId);
      loadSellers();
    } catch (err) {
      alert('Failed to update seller: ' + err.message);
    }
  };

  const handleStatusChange = async (sellerId, status) => {
    try {
      const { error } = await supabase.from('sellers').update({ status, updated_at: new Date().toISOString() }).eq('id', sellerId);
      if (error) throw error;
      await SuperAdminService.logAction(currentUser?.id, 'update_seller_status', 'sellers', sellerId, { status });
      loadSellers();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const viewSellerDetails = async (seller) => {
    setSelectedSeller(seller);
    try {
      const stats = await SuperAdminService.getSellerStats(seller.userId);
      setSellerStats(stats);
    } catch (err) {
      console.error('Failed to load seller stats:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="sellers-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Seller Management</h1>
          <p>Verify sellers and manage their performance</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All Sellers</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending Approval</button>
        <button className={filter === 'verified' ? 'active' : ''} onClick={() => setFilter('verified')}>Verified</button>
        <button className={filter === 'suspended' ? 'active' : ''} onClick={() => setFilter('suspended')}>Suspended</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading sellers...</div>
        ) : sellers.length === 0 ? (
          <div className="empty-state"><p>No sellers found</p></div>
        ) : (
          <table className="data-table">
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
                  <td className="user-cell">
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
                  <td>
                    <span className="rating">★ {seller.rating || '0.0'}</span>
                  </td>
                  <td>{formatDate(seller.created_at)}</td>
                  <td>
                    <button className="view-btn" onClick={() => viewSellerDetails(seller)}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedSeller && (
        <div className="modal-overlay" onClick={() => { setSelectedSeller(null); setSellerStats(null); }}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seller Details - {selectedSeller.storeName || 'Store'}</h2>
              <button className="close-btn" onClick={() => { setSelectedSeller(null); setSellerStats(null); }}>×</button>
            </div>
            <div className="seller-details">
              <div className="detail-grid">
                <div className="detail-card">
                  <span className="label">Total Orders</span>
                  <span className="value">{sellerStats?.totalOrders || 0}</span>
                </div>
                <div className="detail-card">
                  <span className="label">Completed Orders</span>
                  <span className="value">{sellerStats?.completedOrders || 0}</span>
                </div>
                <div className="detail-card">
                  <span className="label">Total Revenue</span>
                  <span className="value">{formatCurrency(sellerStats?.totalRevenue)}</span>
                </div>
                <div className="detail-card">
                  <span className="label">Total Products</span>
                  <span className="value">{sellerStats?.totalProducts || 0}</span>
                </div>
                <div className="detail-card">
                  <span className="label">Active Products</span>
                  <span className="value">{sellerStats?.activeProducts || 0}</span>
                </div>
                <div className="detail-card">
                  <span className="label">Rating</span>
                  <span className="value">★ {selectedSeller.rating || '0.0'}</span>
                </div>
              </div>
              <div className="detail-section">
                <h4>Seller Information</h4>
                <p><strong>Name:</strong> {selectedSeller.user?.name}</p>
                <p><strong>Email:</strong> {selectedSeller.user?.email}</p>
                <p><strong>Store:</strong> {selectedSeller.storeName}</p>
                <p><strong>Description:</strong> {selectedSeller.description || 'N/A'}</p>
                <p><strong>Joined:</strong> {formatDate(selectedSeller.created_at)}</p>
              </div>
              <div className="detail-actions">
                <button 
                  className={`verify-btn ${selectedSeller.verified ? 'verified' : ''}`}
                  onClick={() => { handleVerify(selectedSeller.id, !selectedSeller.verified); setSelectedSeller(null); }}
                >
                  {selectedSeller.verified ? 'Revoke Verification' : 'Verify Seller'}
                </button>
                <button 
                  className="suspend-btn"
                  onClick={() => { handleStatusChange(selectedSeller.id, selectedSeller.status === 'suspended' ? 'active' : 'suspended'); setSelectedSeller(null); }}
                >
                  {selectedSeller.status === 'suspended' ? 'Activate Seller' : 'Suspend Seller'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSellers;