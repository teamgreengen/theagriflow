import { useState } from 'react';

const SellerEarnings = () => {
  const [earnings] = useState({
    available: 2500,
    pending: 800,
    total: 4500
  });

  const [transactions] = useState([
    { id: 1, type: 'sale', amount: 150, date: '2026-04-03', status: 'completed' },
    { id: 2, type: 'sale', amount: 300, date: '2026-04-02', status: 'completed' },
    { id: 3, type: 'withdrawal', amount: -500, date: '2026-04-01', status: 'completed' }
  ]);

  return (
    <div className="earnings-page">
      <h1>Earnings</h1>
      
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
          <span>Total Earnings</span>
          <strong>GH₵ {earnings.total}</strong>
        </div>
      </div>

      <div className="transactions">
        <h2>Recent Transactions</h2>
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

export default SellerEarnings;