import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AdminService from '../../services/adminService';
import ImageService from '../../services/supabaseImageService';
import supabase from '../../config/supabase';
import './Banners.css';

const AdminBanners = () => {
  const { currentUser } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('banners');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    buttonText: 'Shop Now',
    active: true,
    orderIndex: 0,
    type: 'hero'
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('banners').select('*').order('orderIndex');
      setBanners(data || []);
    } catch (err) {
      console.error('Failed to load banners:', err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = ImageService.validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    try {
      const url = await ImageService.uploadImage(file, 'banners');
      setFormData({ ...formData, image: url });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        await AdminService.updateBanner(editingBanner.id, formData);
      } else {
        await AdminService.createBanner(formData);
      }
      
      await AdminService.logAction(currentUser?.id, editingBanner ? 'update_banner' : 'create_banner', 'banners', editingBanner?.id);
      setShowModal(false);
      setFormData({ title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', active: true, orderIndex: 0, type: 'hero' });
      setEditingBanner(null);
      loadBanners();
    } catch (err) {
      alert('Failed to save banner: ' + err.message);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      buttonText: banner.buttonText || 'Shop Now',
      active: banner.active ?? true,
      orderIndex: banner.orderIndex || 0,
      type: banner.type || 'hero'
    });
    setShowModal(true);
  };

  const handleDelete = async (bannerId) => {
    if (!confirm('Delete this banner?')) return;
    
    try {
      await AdminService.deleteBanner(bannerId);
      await AdminService.logAction(currentUser?.id, 'delete_banner', 'banners', bannerId);
      loadBanners();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await AdminService.updateBanner(banner.id, { active: !banner.active });
      loadBanners();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({ title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', active: true, orderIndex: banners.length, type: 'hero' });
    setShowModal(true);
  };

  const heroBanners = banners.filter(b => b.type === 'hero');
  const adBanners = banners.filter(b => b.type === 'ad');

  return (
    <div className="banners-page">
      <div className="page-header">
        <h1>Banners & Promotions</h1>
      </div>

      <div className="banners-tabs">
        <button className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>Hero Banners</button>
        <button className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>Ad Banners</button>
      </div>

      {activeTab === 'banners' && (
        <div className="banners-section">
          <div className="section-header">
            <h2>Hero Banners (Homepage)</h2>
            <button className="add-btn" onClick={openAddModal}>+ Add Banner</button>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : heroBanners.length === 0 ? (
            <div className="empty-state">
              <p>No hero banners yet. Create your first banner!</p>
            </div>
          ) : (
            <div className="banners-grid">
              {heroBanners.map(banner => (
                <div key={banner.id} className={`banner-card ${banner.active ? '' : 'inactive'}`}>
                  <img src={banner.image} alt={banner.title} />
                  <div className="banner-info">
                    <h3>{banner.title}</h3>
                    <p>{banner.subtitle}</p>
                    <span className="banner-link">{banner.link}</span>
                  </div>
                  <div className="banner-actions">
                    <label className="toggle">
                      <input type="checkbox" checked={banner.active} onChange={() => handleToggleActive(banner)} />
                      <span className="slider"></span>
                    </label>
                    <button className="edit-btn" onClick={() => handleEdit(banner)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(banner.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="banners-section">
          <div className="section-header">
            <h2>Ad Banners (Sidebar)</h2>
            <button className="add-btn" onClick={() => { setFormData({ ...formData, type: 'ad' }); openAddModal(); }}>+ Add Ad Banner</button>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : adBanners.length === 0 ? (
            <div className="empty-state">
              <p>No ad banners yet. Create your first ad banner!</p>
            </div>
          ) : (
            <div className="banners-grid">
              {adBanners.map(banner => (
                <div key={banner.id} className={`banner-card ${banner.active ? '' : 'inactive'}`}>
                  <img src={banner.image} alt={banner.title} />
                  <div className="banner-info">
                    <h3>{banner.title}</h3>
                    <span className="banner-link">{banner.link}</span>
                    <span className="banner-position">Position: {banner.type}</span>
                  </div>
                  <div className="banner-actions">
                    <label className="toggle">
                      <input type="checkbox" checked={banner.active} onChange={() => handleToggleActive(banner)} />
                      <span className="slider"></span>
                    </label>
                    <button className="edit-btn" onClick={() => handleEdit(banner)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(banner.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Banner Image</label>
                <div className="image-upload-area">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">Click to upload</div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading && <span>Uploading...</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Banner Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Fresh Produce Sale" />
              </div>
              
              <div className="form-group">
                <label>Subtitle</label>
                <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="e.g., Up to 40% off" />
              </div>
              
              <div className="form-group">
                <label>Link To</label>
                <select value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}>
                  <option value="">Select Page</option>
                  <option value="/products">All Products</option>
                  <option value="/products?category=vegetables">Vegetables</option>
                  <option value="/products?category=fruits">Fruits</option>
                  <option value="/register">Seller Registration</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Banner Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="hero">Hero Banner</option>
                  <option value="ad">Ad Banner</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Display Order</label>
                <input type="number" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: parseInt(e.target.value)})} min="0" />
              </div>
              
              <div className="toggle-group">
                <label className="toggle-label">
                  <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                  <span>Active</span>
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingBanner ? 'Update' : 'Add'} Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;