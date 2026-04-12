import { useState } from 'react';

const SuperAdminAdmins = () => {
  const [admins] = useState([
    { id: '1', name: 'Admin One', email: 'admin1@agriflow.com', role: 'super_admin', createdAt: '2026-01-15' },
    { id: '2', name: 'Admin Two', email: 'admin2@agriflow.com', role: 'admin', createdAt: '2026-02-01' },
    { id: '3', name: 'Admin Three', email: 'admin3@agriflow.com', role: 'admin', createdAt: '2026-03-10' }
  ]);

  return (
    <div className="admins-page">
      <h1>Manage Admins</h1>
      <button className="add-btn">+ Add Admin</button>
      
      <div className="admins-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td><span className={`role-badge ${admin.role}`}>{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span></td>
                <td>{admin.createdAt}</td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminAdmins;