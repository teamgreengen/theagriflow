import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminAdmins = () => {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await SuperAdminService.getAdmins();
      setAdmins(data || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (editingAdmin) {
        if (formData.password) {
          await SuperAdminService.updateAdminRole(editingAdmin.id, formData.role);
          setSuccess('Admin updated successfully');
        }
      } else {
        await SuperAdminService.createAdmin(formData.email, formData.password, formData.name, formData.role);
        await SuperAdminService.logAction(currentUser?.id, 'create_admin', 'users', null, { adminEmail: formData.email });
        setSuccess('Admin created successfully');
      }
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      setEditingAdmin(null);
      loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to save admin');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      role: admin.role
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
    
    try {
      await SuperAdminService.deleteAdmin(adminId);
      await SuperAdminService.logAction(currentUser?.id, 'delete_admin', 'users', adminId);
      setSuccess('Admin deleted successfully');
      loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to delete admin');
    }
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'admin' });
    setError('');
    setShowModal(true);
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
      default: return role;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'super_admin': return 'super-admin';
      case 'admin': return 'admin';
      default: return '';
    }
  };

  return (
    <div className="admins-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Manage Admins</h1>
          <p>Add, edit, and remove admin users</p>
        </div>
        <button className="add-btn primary" onClick={openAddModal}>
          + Add Admin
        </button>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <p>No admins found. Add your first admin to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td className="user-cell">
                    <div className="avatar">{admin.name?.charAt(0).toUpperCase() || 'A'}</div>
                    <span>{admin.name || 'Unknown'}</span>
                  </td>
                  <td>{admin.email}</td>
                  <td>
                    <span className={`role-badge ${getRoleClass(admin.role)}`}>
                      {getRoleLabel(admin.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${admin.status || 'active'}`}>
                      {admin.status || 'active'}
                    </span>
                  </td>
                  <td>{formatDate(admin.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(admin)}>Edit</button>
                      {admin.role !== 'super_admin' && (
                        <button className="delete-btn" onClick={() => handleDelete(admin.id)}>Remove</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required={!editingAdmin}
                  disabled={editingAdmin}
                  placeholder="admin@example.com"
                />
              </div>
              
              {!editingAdmin && (
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editingAdmin}
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {editingAdmin && formData.password && (
                <div className="form-hint">
                  Leave password blank to keep current password unchanged.
                </div>
              )}
              
              {error && <div className="form-error">{error}</div>}
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAdmins;