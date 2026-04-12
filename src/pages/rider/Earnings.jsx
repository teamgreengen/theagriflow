import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import RiderService from '../../services/riderService';
import './Earnings.css';

const RiderEarnings = () => {
  const { currentUser } = useAuth();
  const [earnings, setEarnings] = useState({ available: 0, pending: 0, total: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadEarnings();
  }, [currentUser]);

  const loadEarnings = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [earningsData, transactionsData] = await Promise.all([
        RiderService.getEarnings(currentUser.id),
        RiderService.getTransactions(currentUser.id, 10)
      ]);
      setEarnings(earningsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(withdrawAmount) > earnings.available) {
      alert('Insufficient balance');
      return;
    }
    try {
      await RiderService.requestWithdrawal(currentUser.id, parseFloat(withdrawAmount));
      alert('Withdrawal request submitted!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadEarnings();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="earnings-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="earnings-page">
      <div className="page-header">
        <h1>My Earnings</h1>
      </div>
      
      <div className="earnings-cards">
        <div className="earnings-card">
          <span>Available Balance</span>
          <strong>GH₵ {earnings.available.toLocaleString()}</strong>
          <button onClick={() => setShowWithdrawModal(true)}>Withdraw</button>
        </div>
        <div className="earnings-card">
          <span>Pending</span>
          <strong>GH₵ {earnings.pending.toLocaleString()}</strong>
        </div>
        <div className="earnings-card">
          <span>Total Earned</span>
          <strong>GH₵ {earnings.total.toLocaleString()}</strong>
        </div>
      </div>

      <div className="transactions">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="empty-state"><p>No transactions yet</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td className="type">{t.type}</td>
                  <td className={t.amount > 0 ? 'positive' : 'negative'}>
                    {t.amount > 0 ? '+' : ''}GH₵ {t.amount.toLocaleString()}
                  </td>
                  <td><span className={`status ${t.status}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Withdrawal</h2>
              <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>×</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="form-group">
                <label>Available Balance</label>
                <input type="text" value={`GH₵ ${earnings.available.toLocaleString()}`} disabled />
              </div>
              <div className="form-group">
                <label>Amount to Withdraw</label>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min="1" max={earnings.available} required />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderEarnings;