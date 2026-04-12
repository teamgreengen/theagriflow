import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../../config/supabase';
import { useAuth } from '../../context/SupabaseAuthContext';
import BuyerService from '../../services/buyerService';
import './Profile.css';

const Profile = () => {
  const { currentUser, userData, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    city: userData?.city || '',
    region: userData?.region || '',
    bio: userData?.bio || ''
  });

  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    street: '',
    city: '',
    region: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    if (currentUser) {
      loadAddresses();
    }
  }, [currentUser]);

  const loadAddresses = async () => {
    try {
      const data = await BuyerService.getAddresses(currentUser.id);
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentUser) {
        await BuyerService.updateProfile(currentUser.id, formData);
        await refreshUser();
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingAddress) {
        await BuyerService.updateAddress(editingAddress.id, addressForm);
      } else {
        await BuyerService.addAddress(currentUser.id, addressForm);
      }
      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressForm({ label: 'Home', street: '', city: '', region: '', phone: '', isDefault: false });
      loadAddresses();
      alert('Address saved!');
    } catch (err) {
      alert('Failed to save address: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    try {
      await BuyerService.deleteAddress(addressId);
      loadAddresses();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || 'Home',
      street: addr.street || '',
      city: addr.city || '',
      region: addr.region || '',
      phone: addr.phone || '',
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };

  const handlePasswordChange = async () => {
    const email = userData?.email;
    if (!email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    });
    
    if (error) {
      alert('Failed: ' + error.message);
    } else {
      alert('Password reset email sent! Check your inbox.');
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="login-prompt">
          <h2>Please log in to view your profile</h2>
          <Link to="/login" className="login-btn">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {userData?.name?.charAt(0) || 'U'}
        </div>
        <div className="profile-info">
          <h1>{userData?.name || 'User'}</h1>
          <p>{userData?.email || 'user@example.com'}</p>
          <span className={`role-badge ${userData?.role || 'buyer'}`}>
            {userData?.role || 'buyer'}
          </span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>Personal Info</button>
        <button className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>Address</button>
        <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={userData?.email || ''} disabled className="disabled" />
              <span className="hint">Email cannot be changed</span>
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 0241234567" />
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Tell us about yourself..." />
            </div>
            
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'address' && (
          <div className="address-section">
            <button className="add-address-btn" onClick={() => { setEditingAddress(null); setAddressForm({ label: 'Home', street: '', city: '', region: '', phone: '', isDefault: false }); setShowAddressModal(true); }}>
              + Add New Address
            </button>
            
            {addresses.length === 0 ? (
              <div className="empty-state"><p>No addresses saved</p></div>
            ) : (
              <div className="addresses-list">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card">
                    <div className="address-info">
                      <h4>{addr.label} {addr.isDefault && <span className="default-badge">Default</span>}</h4>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.region}</p>
                      <p>{addr.phone}</p>
                    </div>
                    <div className="address-actions">
                      <button onClick={() => openEditAddress(addr)}>Edit</button>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <div className="security-item">
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure</p>
              <button className="change-pass-btn" onClick={handlePasswordChange}>Change Password</button>
            </div>
            
            <div className="security-item">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
              <button className="enable-2fa-btn">Enable 2FA</button>
            </div>
            
            <div className="security-item danger">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
              <button className="delete-btn">Delete Account</button>
            </div>
          </div>
        )}
      </div>

      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="close-btn" onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-group">
                <label>Label</label>
                <select value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <select value={addressForm.region} onChange={e => setAddressForm({...addressForm, region: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="Greater Accra">Greater Accra</option>
                    <option value="Ashanti">Ashanti</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Northern">Northern</option>
                    <option value="Volta">Volta</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                  Set as default address
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;