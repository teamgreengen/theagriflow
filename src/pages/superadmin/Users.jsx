import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminUsers = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter) filters.status = statusFilter;
      if (search) filters.search = search;
      
      const data = await SuperAdminService.getAllUsers(filters);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await SuperAdminService.updateUserStatus(userId, newStatus);
      await SuperAdminService.logAction(currentUser?.id, 'update_user_status', 'users', userId, { status: newStatus });
      loadUsers();
    } catch (err) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'seller': return 'Seller';
      case 'rider': return 'Rider';
      case 'buyer': return 'Buyer';
      default: return role;
    }
  };

  return (
    <div className="admins-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>All Users</h1>
          <p>Manage and view all platform users</p>
        </div>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setSearchParams({ ...Object.fromEntries(searchParams), role: e.target.value }); }}>
            <option value="">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="rider">Riders</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setSearchParams({ ...Object.fromEntries(searchParams), status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="user-cell">
                    <div className="avatar">{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}</div>
                    <span>{user.name || 'Unknown'}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <select 
                      value={user.status || 'active'} 
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
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

export default SuperAdminUsers;