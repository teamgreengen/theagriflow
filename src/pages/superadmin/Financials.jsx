import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminFinancials = () => {
  const { currentUser } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter) filters.status = filter;
      const data = await SuperAdminService.getWithdrawals(filters);
      setWithdrawals(data || []);
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (earningId, status) => {
    try {
      await SuperAdminService.processWithdrawal(earningId, status);
      await SuperAdminService.logAction(currentUser?.id, 'process_withdrawal', 'earnings', earningId, { status });
      loadWithdrawals();
    } catch (err) {
      alert('Failed to process: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  const totalPaid = withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

  return (
    <div className="financials-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Financial Management</h1>
          <p>Process seller withdrawals and track earnings</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card pending">
          <span className="summary-label">Pending Withdrawals</span>
          <span className="summary-value">{formatCurrency(totalPending)}</span>
        </div>
        <div className="summary-card paid">
          <span className="summary-label">Total Paid</span>
          <span className="summary-value">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Requests</span>
          <span className="summary-value">{withdrawals.length}</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
        <button className={filter === 'paid' ? 'active' : ''} onClick={() => setFilter('paid')}>Paid</button>
        <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>Rejected</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="empty-state"><p>No withdrawal requests</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(item => (
                <tr key={item.id}>
                  <td className="user-cell">
                    <div className="avatar">{item.user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div>
                      <div>{item.user?.name || 'Unknown'}</div>
                      <div className="small">{item.user?.email}</div>
                    </div>
                  </td>
                  <td>{item.type || 'sale'}</td>
                  <td className="amount">{formatCurrency(item.amount)}</td>
                  <td>
                    <span className={`status-badge ${item.status}`}>{item.status || 'pending'}</span>
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    {item.status === 'pending' && (
                      <>
                        <button className="approve-btn" onClick={() => handleProcess(item.id, 'paid')}>Approve</button>
                        <button className="reject-btn" onClick={() => handleProcess(item.id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuperAdminFinancials;