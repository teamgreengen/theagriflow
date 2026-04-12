import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import ImageService from '../../services/supabaseImageService';
import supabase from '../../config/supabase';
import './SuperAdmin.css';

const SuperAdminBanners = () => {
  const { currentUser } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    buttonText: 'Shop Now',
    active: true,
    orderIndex: 0
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
        await SuperAdminService.updateBanner(editingBanner.id, formData);
      } else {
        await SuperAdminService.createBanner(formData);
      }
      
      await SuperAdminService.logAction(currentUser?.id, editingBanner ? 'update_banner' : 'create_banner', 'banners', editingBanner?.id);
      setShowModal(false);
      setFormData({ title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', active: true, orderIndex: 0 });
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
      orderIndex: banner.orderIndex || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (bannerId) => {
    if (!confirm('Delete this banner?')) return;
    
    try {
      await SuperAdminService.deleteBanner(bannerId);
      await SuperAdminService.logAction(currentUser?.id, 'delete_banner', 'banners', bannerId);
      loadBanners();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await SuperAdminService.updateBanner(banner.id, { active: !banner.active });
      loadBanners();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({ title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', active: true, orderIndex: banners.length });
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="banners-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Banner Management</h1>
          <p>Manage homepage banners and promotions</p>
        </div>
        <button className="add-btn primary" onClick={openAddModal}>+ Add Banner</button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="loading">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="empty-state">
            <p>No banners yet. Create your first banner!</p>
          </div>
        ) : (
          <div className="banners-grid">
            {banners.map(banner => (
              <div key={banner.id} className={`banner-card ${banner.active ? '' : 'inactive'}`}>
                <div className="banner-image">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  <span className={`banner-status ${banner.active ? 'active' : 'inactive'}`}>
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="banner-info">
                  <h3>{banner.title || 'Untitled'}</h3>
                  <p>{banner.subtitle || 'No subtitle'}</p>
                  <div className="banner-meta">
                    <span>Order: {banner.orderIndex}</span>
                    <span>{formatDate(banner.created_at)}</span>
                  </div>
                </div>
                <div className="banner-actions">
                  <button onClick={() => handleToggleActive(banner)}>
                    {banner.active ? 'Disable' : 'Enable'}
                  </button>
                  <button className="edit-btn" onClick={() => handleEdit(banner)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(banner.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <label>Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Banner title" />
              </div>
              
              <div className="form-group">
                <label>Subtitle</label>
                <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="Banner subtitle" />
              </div>
              
              <div className="form-group">
                <label>Link URL</label>
                <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://..." />
              </div>
              
              <div className="form-group">
                <label>Button Text</label>
                <input type="text" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="Shop Now" />
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
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingBanner ? 'Update' : 'Create'} Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminBanners;