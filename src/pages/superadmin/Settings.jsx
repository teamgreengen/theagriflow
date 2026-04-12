import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import ImageService from '../../services/supabaseImageService';
import './Settings.css';

const SuperAdminSettings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platform: { name: 'Agriflow', tagline: "Ghana's Agricultural Marketplace" },
    commission: { rate: 10, minWithdrawal: 50 },
    delivery: { fee: 15, freeThreshold: 100, type: 'flat' },
    contact: { email: 'support@agriflow.com', phone: '+233241234567', address: 'Accra, Ghana' },
    social: { facebook: '', twitter: '', instagram: '', whatsapp: '' },
    features: { maintenanceMode: false, registrationEnabled: true, sellerApprovalRequired: true },
    branding: { logo: '', favicon: '', primaryColor: '#2d5a27', secondaryColor: '#f59e0b' }
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await SuperAdminService.getSettings();
      if (Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = [
        { id: 'platform', value: settings.platform, category: 'general' },
        { id: 'commission', value: settings.commission, category: 'business' },
        { id: 'delivery', value: settings.delivery, category: 'business' },
        { id: 'contact', value: settings.contact, category: 'contact' },
        { id: 'social', value: settings.social, category: 'contact' },
        { id: 'features', value: settings.features, category: 'general' },
        { id: 'branding', value: settings.branding, category: 'branding' }
      ];
      await SuperAdminService.saveMultipleSettings(settingsArray);
      await SuperAdminService.logAction(currentUser?.id, 'update_settings', 'settings', null, { categories: settingsArray.map(s => s.id) });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Platform Settings</h1>
          <p>Configure your platform preferences</p>
        </div>
      </div>
      
      {saved && <div className="save-notification">Settings saved successfully!</div>}
      
      <div className="settings-tabs">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
          ⚙️ General
        </button>
        <button className={`tab-btn ${activeTab === 'branding' ? 'active' : ''}`} onClick={() => setActiveTab('branding')}>
          🎨 Branding
        </button>
        <button className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>
          💰 Business
        </button>
        <button className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>
          🚚 Delivery
        </button>
        <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
          📞 Contact
        </button>
        <button className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
          🔗 Social
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="settings-section">
          <h2>General Settings</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label>Platform Name</label>
              <input 
                type="text" 
                value={settings.platform?.name || ''} 
                onChange={(e) => handleChange('platform', 'name', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input 
                type="text" 
                value={settings.platform?.tagline || ''} 
                onChange={(e) => handleChange('platform', 'tagline', e.target.value)} 
              />
            </div>
          </div>

          <h3>Platform Features</h3>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={settings.features?.maintenanceMode || false} 
                onChange={(e) => handleChange('features', 'maintenanceMode', e.target.checked)} 
              />
              <span>Maintenance Mode</span>
            </label>
            <p className="form-help">When enabled, only admins can access the site</p>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={settings.features?.registrationEnabled ?? true} 
                onChange={(e) => handleChange('features', 'registrationEnabled', e.target.checked)} 
              />
              <span>Allow New Registrations</span>
            </label>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={settings.features?.sellerApprovalRequired ?? true} 
                onChange={(e) => handleChange('features', 'sellerApprovalRequired', e.target.checked)} 
              />
              <span>Require Seller Approval</span>
            </label>
            <p className="form-help">New sellers need admin approval before they can sell</p>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="settings-section">
          <h2>Platform Branding</h2>
          
          <div className="form-group">
            <label>Platform Logo</label>
            <div className="image-upload-area">
              {settings.branding?.logo ? (
                <div className="image-preview-box">
                  <img src={settings.branding.logo} alt="Logo" />
                  <button className="remove-btn" onClick={() => handleChange('branding', 'logo', '')}>×</button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span>📁</span>
                  <p>Click to upload logo</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const url = await ImageService.uploadImage(file, 'branding');
                    handleChange('branding', 'logo', url);
                  } catch (err) {
                    alert('Upload failed: ' + err.message);
                  } finally {
                    setUploading(false);
                  }
                }} 
                disabled={uploading}
              />
            </div>
            <p className="form-help">Recommended: 200x60px, PNG with transparent background</p>
          </div>

          <div className="form-group">
            <label>Favicon</label>
            <div className="image-upload-area">
              {settings.branding?.favicon ? (
                <div className="image-preview-box small">
                  <img src={settings.branding.favicon} alt="Favicon" />
                  <button className="remove-btn" onClick={() => handleChange('branding', 'favicon', '')}>×</button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span>🖼️</span>
                  <p>Click to upload favicon</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const url = await ImageService.uploadImage(file, 'branding');
                    handleChange('branding', 'favicon', url);
                  } catch (err) {
                    alert('Upload failed: ' + err.message);
                  } finally {
                    setUploading(false);
                  }
                }} 
                disabled={uploading}
              />
            </div>
            <p className="form-help">Recommended: 32x32px or 64x64px, PNG or ICO</p>
          </div>

          <h3>Theme Colors</h3>
          <div className="color-pickers">
            <div className="form-group">
              <label>Primary Color</label>
              <div className="color-input">
                <input 
                  type="color" 
                  value={settings.branding?.primaryColor || '#2d5a27'} 
                  onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)} 
                />
                <input 
                  type="text" 
                  value={settings.branding?.primaryColor || '#2d5a27'} 
                  onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)} 
                  className="color-text"
                />
              </div>
              <p className="form-help">Used for buttons, links, headers</p>
            </div>
            
            <div className="form-group">
              <label>Secondary Color</label>
              <div className="color-input">
                <input 
                  type="color" 
                  value={settings.branding?.secondaryColor || '#f59e0b'} 
                  onChange={(e) => handleChange('branding', 'secondaryColor', e.target.value)} 
                />
                <input 
                  type="text" 
                  value={settings.branding?.secondaryColor || '#f59e0b'} 
                  onChange={(e) => handleChange('branding', 'secondaryColor', e.target.value)} 
                  className="color-text"
                />
              </div>
              <p className="form-help">Used for accents, highlights, badges</p>
            </div>
          </div>

          <div className="color-preview">
            <h4>Preview</h4>
            <div className="preview-buttons">
              <button style={{ backgroundColor: settings.branding?.primaryColor || '#2d5a27' }}>Primary Button</button>
              <button style={{ backgroundColor: settings.branding?.secondaryColor || '#f59e0b' }}>Secondary Button</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="settings-section">
          <h2>Commission & Payouts</h2>
          <div className="form-group">
            <label>Platform Commission Rate (%)</label>
            <div className="input-with-suffix">
              <input 
                type="number" 
                value={settings.commission?.rate || 0} 
                onChange={(e) => handleChange('commission', 'rate', parseFloat(e.target.value))} 
                min="0" 
                max="100" 
              />
              <span className="suffix">%</span>
            </div>
            <p className="form-help">Deducted from each sale. E.g., GH₵100 sale with 10% commission = GH₵90 to seller</p>
          </div>
          <div className="form-group">
            <label>Minimum Withdrawal (GH₵)</label>
            <input 
              type="number" 
              value={settings.commission?.minWithdrawal || 0} 
              onChange={(e) => handleChange('commission', 'minWithdrawal', parseFloat(e.target.value))} 
            />
            <p className="form-help">Sellers must have at least this amount to request withdrawal</p>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="settings-section">
          <h2>Delivery Settings</h2>
          <div className="form-group">
            <label>Delivery Fee Type</label>
            <select 
              value={settings.delivery?.type || 'flat'} 
              onChange={(e) => handleChange('delivery', 'type', e.target.value)}
            >
              <option value="flat">Flat Rate</option>
              <option value="tiered">Tiered (Based on order value)</option>
            </select>
          </div>

          {settings.delivery?.type === 'flat' && (
            <>
              <div className="form-group">
                <label>Standard Delivery Fee (GH₵)</label>
                <input 
                  type="number" 
                  value={settings.delivery?.fee || 0} 
                  onChange={(e) => handleChange('delivery', 'fee', parseFloat(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label>Free Delivery Minimum (GH₵)</label>
                <input 
                  type="number" 
                  value={settings.delivery?.freeThreshold || 0} 
                  onChange={(e) => handleChange('delivery', 'freeThreshold', parseFloat(e.target.value))} 
                />
                <p className="form-help">Orders above this amount get free delivery</p>
              </div>
            </>
          )}

          {settings.delivery?.type === 'tiered' && (
            <div className="tier-info">
              <p>Tiered pricing is based on order value:</p>
              <ul>
                <li>GH₵ 0 - 50: GH₵ 15 delivery</li>
                <li>GH₵ 51 - 100: GH₵ 10 delivery</li>
                <li>GH₵ 100+: Free delivery</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="settings-section">
          <h2>Contact Information</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label>Contact Email</label>
              <input 
                type="email" 
                value={settings.contact?.email || ''} 
                onChange={(e) => handleChange('contact', 'email', e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input 
                type="tel" 
                value={settings.contact?.phone || ''} 
                onChange={(e) => handleChange('contact', 'phone', e.target.value)} 
              />
            </div>
            <div className="form-group full-width">
              <label>Business Address</label>
              <textarea 
                value={settings.contact?.address || ''} 
                onChange={(e) => handleChange('contact', 'address', e.target.value)} 
                rows="3"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="settings-section">
          <h2>Social Media Links</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label>Facebook</label>
              <input 
                type="url" 
                value={settings.social?.facebook || ''} 
                onChange={(e) => handleChange('social', 'facebook', e.target.value)} 
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="form-group">
              <label>Twitter / X</label>
              <input 
                type="url" 
                value={settings.social?.twitter || ''} 
                onChange={(e) => handleChange('social', 'twitter', e.target.value)} 
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="form-group">
              <label>Instagram</label>
              <input 
                type="url" 
                value={settings.social?.instagram || ''} 
                onChange={(e) => handleChange('social', 'instagram', e.target.value)} 
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-group">
              <label>WhatsApp</label>
              <input 
                type="text" 
                value={settings.social?.whatsapp || ''} 
                onChange={(e) => handleChange('social', 'whatsapp', e.target.value)} 
                placeholder="+233..."
              />
            </div>
          </div>
        </div>
      )}

      <div className="settings-actions">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSettings;