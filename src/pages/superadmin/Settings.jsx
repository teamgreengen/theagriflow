import { useState } from 'react';
import './Settings.css';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'Agriflow',
    tagline: "Ghana's Agricultural Marketplace",
    contactEmail: 'support@agriflow.com',
    contactPhone: '+233 24 123 4567',
    address: 'Accra, Ghana',
    logo: '',
    favicon: '',
    themePrimaryColor: '#2d5a27',
    themeSecondaryColor: '#4a7c43',
    themeAccentColor: '#ff9f00',
    commissionRate: 10,
    minWithdrawal: 50,
    deliveryFee: 15,
    freeDeliveryThreshold: 100,
    deliveryFeeType: 'flat',
    facebook: 'https://facebook.com/agriflow',
    twitter: 'https://twitter.com/agriflow',
    instagram: 'https://instagram.com/agriflow',
    whatsapp: '+233241234567',
    maintenanceMode: false,
    registrationEnabled: true,
    sellerApprovalRequired: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="settings-page">
      <h1>Site Settings</h1>
      
      {saved && <div className="save-notification">Settings saved successfully!</div>}
      
      <div className="settings-tabs">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
          ⚙️ General
        </button>
        <button className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
          🎨 Appearance
        </button>
        <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
          📞 Contact
        </button>
        <button className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
          🔗 Social Media
        </button>
        <button className={`tab-btn ${activeTab === 'commission' ? 'active' : ''}`} onClick={() => setActiveTab('commission')}>
          💰 Commission
        </button>
        <button className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>
          🚚 Delivery
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="settings-section">
          <h2>General Settings</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label>Platform Name</label>
              <input type="text" value={settings.platformName} onChange={(e) => handleChange('platformName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input type="text" value={settings.tagline} onChange={(e) => handleChange('tagline', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input type="text" value={settings.logo} onChange={(e) => handleChange('logo', e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
            <div className="form-group">
              <label>Favicon URL</label>
              <input type="text" value={settings.favicon} onChange={(e) => handleChange('favicon', e.target.value)} placeholder="https://example.com/favicon.ico" />
            </div>
          </div>

          <h3>Platform Features</h3>
          <div className="toggle-group">
            <label className="toggle-label">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />
              <span>Maintenance Mode</span>
            </label>
            <p className="form-help">When enabled, only admins can access the site</p>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input type="checkbox" checked={settings.registrationEnabled} onChange={(e) => handleChange('registrationEnabled', e.target.checked)} />
              <span>Allow New Registrations</span>
            </label>
          </div>
          <div className="toggle-group">
            <label className="toggle-label">
              <input type="checkbox" checked={settings.sellerApprovalRequired} onChange={(e) => handleChange('sellerApprovalRequired', e.target.checked)} />
              <span>Require Seller Approval</span>
            </label>
            <p className="form-help">New sellers need admin approval before they can sell</p>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="settings-section">
          <h2>Theme Colors</h2>
          <p className="section-desc">Customize the look and feel of your platform</p>
          <div className="color-settings">
            <div className="form-group">
              <label>Primary Color</label>
              <div className="color-input">
                <input type="color" value={settings.themePrimaryColor} onChange={(e) => handleChange('themePrimaryColor', e.target.value)} />
                <input type="text" value={settings.themePrimaryColor} onChange={(e) => handleChange('themePrimaryColor', e.target.value)} />
              </div>
              <p className="form-help">Used for headers, buttons, and main accents</p>
            </div>
            <div className="form-group">
              <label>Secondary Color</label>
              <div className="color-input">
                <input type="color" value={settings.themeSecondaryColor} onChange={(e) => handleChange('themeSecondaryColor', e.target.value)} />
                <input type="text" value={settings.themeSecondaryColor} onChange={(e) => handleChange('themeSecondaryColor', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Accent Color (Orange)</label>
              <div className="color-input">
                <input type="color" value={settings.themeAccentColor} onChange={(e) => handleChange('themeAccentColor', e.target.value)} />
                <input type="text" value={settings.themeAccentColor} onChange={(e) => handleChange('themeAccentColor', e.target.value)} />
              </div>
              <p className="form-help">Used for call-to-action buttons and highlights</p>
            </div>
          </div>

          <div className="theme-preview">
            <h3>Preview</h3>
            <div className="preview-box" style={{ background: settings.themePrimaryColor }}>
              <span style={{ color: settings.themeAccentColor }}>Primary</span>
            </div>
            <div className="preview-box" style={{ background: settings.themeSecondaryColor }}>
              <span>Secondary</span>
            </div>
            <div className="preview-box" style={{ background: settings.themeAccentColor, color: '#000' }}>
              <span>Accent</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="settings-section">
          <h2>Contact Information</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" value={settings.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="tel" value={settings.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label>Business Address</label>
              <textarea value={settings.address} onChange={(e) => handleChange('address', e.target.value)} rows="3"></textarea>
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
              <input type="url" value={settings.facebook} onChange={(e) => handleChange('facebook', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="form-group">
              <label>Twitter / X</label>
              <input type="url" value={settings.twitter} onChange={(e) => handleChange('twitter', e.target.value)} placeholder="https://twitter.com/..." />
            </div>
            <div className="form-group">
              <label>Instagram</label>
              <input type="url" value={settings.instagram} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="form-group">
              <label>WhatsApp</label>
              <input type="text" value={settings.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="+233..." />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commission' && (
        <div className="settings-section">
          <h2>Commission Settings</h2>
          <div className="form-group">
            <label>Platform Commission Rate (%)</label>
            <div className="input-with-suffix">
              <input type="number" value={settings.commissionRate} onChange={(e) => handleChange('commissionRate', e.target.value)} min="0" max="100" />
              <span className="suffix">%</span>
            </div>
            <p className="form-help">Deducted from each sale. E.g., GH₵100 sale with 10% commission = GH₵90 to seller</p>
          </div>
          <div className="form-group">
            <label>Minimum Withdrawal (GH₵)</label>
            <input type="number" value={settings.minWithdrawal} onChange={(e) => handleChange('minWithdrawal', e.target.value)} />
            <p className="form-help">Sellers must have at least this amount to request withdrawal</p>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="settings-section">
          <h2>Delivery Settings</h2>
          <div className="form-group">
            <label>Delivery Fee Type</label>
            <select value={settings.deliveryFeeType} onChange={(e) => handleChange('deliveryFeeType', e.target.value)}>
              <option value="flat">Flat Rate</option>
              <option value="tiered">Tiered (Based on order value)</option>
            </select>
          </div>

          {settings.deliveryFeeType === 'flat' && (
            <>
              <div className="form-group">
                <label>Standard Delivery Fee (GH₵)</label>
                <input type="number" value={settings.deliveryFee} onChange={(e) => handleChange('deliveryFee', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Free Delivery Minimum (GH₵)</label>
                <input type="number" value={settings.freeDeliveryThreshold} onChange={(e) => handleChange('freeDeliveryThreshold', e.target.value)} />
                <p className="form-help">Orders above this amount get free delivery</p>
              </div>
            </>
          )}

          {settings.deliveryFeeType === 'tiered' && (
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

      <div className="settings-actions">
        <button className="save-btn" onClick={handleSave}>Save All Settings</button>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
