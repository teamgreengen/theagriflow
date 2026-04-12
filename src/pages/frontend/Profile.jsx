import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../../config/supabase';
import { useAuth } from '../../context/SupabaseAuthContext';
import './Profile.css';

const Profile = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    city: userData?.city || '',
    region: userData?.region || '',
    bio: userData?.bio || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        
        if (formData.name !== currentUser.displayName) {
          await updateProfile(currentUser, { displayName: formData.name });
        }
        
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
        <button 
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
        >
          Personal Info
        </button>
        <button 
          className={activeTab === 'address' ? 'active' : ''}
          onClick={() => setActiveTab('address')}
        >
          Address
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userData?.email || ''}
                disabled
                className="disabled"
              />
              <span className="hint">Email cannot be changed</span>
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., 0241234567"
              />
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'address' && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City/Town</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Region</label>
                <select name="region" value={formData.region} onChange={handleChange}>
                  <option value="">Select Region</option>
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Northern">Northern</option>
                  <option value="Upper East">Upper East</option>
                  <option value="Upper West">Upper West</option>
                  <option value="Volta">Volta</option>
                  <option value="Brong Ahafo">Brong Ahafo</option>
                </select>
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <div className="security-item">
              <h3>Change Password</h3>
              <p>Update your password to keep your account secure</p>
              <button className="change-pass-btn">Change Password</button>
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
    </div>
  );
};

export default Profile;