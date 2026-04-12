import { useState } from 'react';

const RiderEarnings = () => {
  const [earnings] = useState({
    available: 450,
    pending: 150,
    total: 1250
  });

  const [transactions] = useState([
    { id: 1, type: 'delivery', amount: 25, date: '2026-04-03', status: 'completed' },
    { id: 2, type: 'delivery', amount: 20, date: '2026-04-03', status: 'completed' },
    { id: 3, type: 'withdrawal', amount: -200, date: '2026-04-02', status: 'completed' }
  ]);

  return (
    <div className="earnings-page">
      <h1>My Earnings</h1>
      
      <div className="earnings-cards">
        <div className="earnings-card">
          <span>Available Balance</span>
          <strong>GH₵ {earnings.available}</strong>
          <button>Withdraw</button>
        </div>
        <div className="earnings-card">
          <span>Pending</span>
          <strong>GH₵ {earnings.pending}</strong>
        </div>
        <div className="earnings-card">
          <span>Total Earned</span>
          <strong>GH₵ {earnings.total}</strong>
        </div>
      </div>

      <div className="transactions">
        <h2>Transaction History</h2>
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
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td className={t.amount > 0 ? 'positive' : 'negative'}>
                  {t.amount > 0 ? '+' : ''}GH₵ {t.amount}
                </td>
                <td><span className="status completed">{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiderEarnings;