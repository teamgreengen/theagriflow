import { useState } from 'react';
import './Banners.css';

const AdminBanners = () => {
  const [banners, setBanners] = useState([
    { id: 1, type: 'hero', title: 'Fresh from Farms', subtitle: 'Up to 40% off', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200', link: '/products', active: true },
    { id: 2, type: 'hero', title: 'Sell on Agriflow', subtitle: 'Start your business', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200', link: '/register', active: true }
  ]);

  const [adBanners] = useState([
    { id: 1, title: 'Farm Inputs', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', link: '/products?category=equipment', position: 'home' },
    { id: 2, title: 'Livestock', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600', link: '/products?category=livestock', position: 'home' }
  ]);

  const [promotions, setPromotions] = useState([
    { id: 1, title: 'Flash Sale Weekend', discount: '40%', startDate: '2026-04-01', endDate: '2026-04-07', active: true },
    { id: 2, title: 'New User Discount', discount: '15%', startDate: '2026-04-01', endDate: '2026-12-31', active: true }
  ]);

  const [activeTab, setActiveTab] = useState('banners');

  const toggleBanner = (id) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const togglePromotion = (id) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="banners-page">
      <div className="page-header">
        <h1>Banners & Promotions</h1>
      </div>

      <div className="banners-tabs">
        <button className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>Hero Banners</button>
        <button className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>Ad Banners</button>
        <button className={`tab-btn ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => setActiveTab('promotions')}>Promotions</button>
      </div>

      {activeTab === 'banners' && (
        <div className="banners-section">
          <div className="section-header">
            <h2>Hero Banners (Homepage)</h2>
            <button className="add-btn">+ Add Banner</button>
          </div>
          <div className="banners-grid">
            {banners.map(banner => (
              <div key={banner.id} className="banner-card">
                <img src={banner.image} alt={banner.title} />
                <div className="banner-info">
                  <h3>{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                  <span className="banner-link">{banner.link}</span>
                </div>
                <div className="banner-actions">
                  <label className="toggle">
                    <input type="checkbox" checked={banner.active} onChange={() => toggleBanner(banner.id)} />
                    <span className="slider"></span>
                  </label>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="banners-section">
          <div className="section-header">
            <h2>Ad Banners (Sidebar)</h2>
            <button className="add-btn">+ Add Ad Banner</button>
          </div>
          <div className="banners-grid">
            {adBanners.map(banner => (
              <div key={banner.id} className="banner-card">
                <img src={banner.image} alt={banner.title} />
                <div className="banner-info">
                  <h3>{banner.title}</h3>
                  <span className="banner-link">{banner.link}</span>
                  <span className="banner-position">Position: {banner.position}</span>
                </div>
                <div className="banner-actions">
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="banners-section">
          <div className="section-header">
            <h2>Active Promotions</h2>
            <button className="add-btn">+ Create Promotion</button>
          </div>
          <div className="promotions-grid">
            {promotions.map(promo => (
              <div key={promo.id} className="promo-card">
                <div className="promo-header">
                  <h3>{promo.title}</h3>
                  <span className="promo-discount">{promo.discount} OFF</span>
                </div>
                <div className="promo-dates">
                  <p>Start: {promo.startDate}</p>
                  <p>End: {promo.endDate}</p>
                </div>
                <div className="promo-actions">
                  <label className="toggle">
                    <input type="checkbox" checked={promo.active} onChange={() => togglePromotion(promo.id)} />
                    <span className="slider"></span>
                  </label>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Banner Modal */}
      <div className="modal-overlay" style={{display: 'none'}}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Add New Banner</h2>
            <button className="close-btn">×</button>
          </div>
          <form>
            <div className="form-group">
              <label>Banner Title</label>
              <input type="text" placeholder="e.g., Fresh Produce Sale" />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <input type="text" placeholder="e.g., Up to 40% off" />
            </div>
            <div className="form-group">
              <label>Banner Image</label>
              <input type="file" accept="image/*" />
            </div>
            <div className="form-group">
              <label>Link To</label>
              <select>
                <option value="">Select Page</option>
                <option value="/products">All Products</option>
                <option value="/products?category=vegetables">Vegetables</option>
                <option value="/products?category=fruits">Fruits</option>
                <option value="/register">Seller Registration</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn">Cancel</button>
              <button type="submit" className="submit-btn">Add Banner</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;