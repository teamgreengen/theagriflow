import { useState } from 'react';

const AdminSellers = () => {
  const [sellers] = useState([
    { id: '1', name: 'Green Farm', owner: 'John Doe', email: 'john@greenfarm.com', verified: true, sales: 45, status: 'active' },
    { id: '2', name: 'Tropical Fruits', owner: 'Mary Smith', email: 'mary@tropical.com', verified: true, sales: 32, status: 'active' },
    { id: '3', name: 'Local Farmers Co', owner: 'Peter Jones', email: 'peter@local.com', verified: false, sales: 0, status: 'pending' }
  ]);

  const verifySeller = (id) => {
    console.log('Verify seller:', id);
  };

  const toggleStatus = (id) => {
    console.log('Toggle status:', id);
  };

  return (
    <div className="sellers-page">
      <h1>Manage Sellers</h1>
      
      <div className="sellers-table">
        <table>
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Owner</th>
              <th>Email</th>
              <th>Verified</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(seller => (
              <tr key={seller.id}>
                <td>{seller.name}</td>
                <td>{seller.owner}</td>
                <td>{seller.email}</td>
                <td>
                  {seller.verified ? 
                    <span className="badge verified">Verified</span> : 
                    <button className="verify-btn" onClick={() => verifySeller(seller.id)}>Verify</button>
                  }
                </td>
                <td>{seller.sales}</td>
                <td><span className={`status ${seller.status}`}>{seller.status}</span></td>
                <td>
                  <button className="action-btn" onClick={() => toggleStatus(seller.id)}>
                    {seller.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSellers;