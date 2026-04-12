import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import AdminService from '../../services/adminService';
import './Categories.css';

const AdminCategories = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    active: true
  });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await AdminService.updateCategory(editingCategory.id, formData);
      } else {
        await AdminService.createCategory({ ...formData, orderIndex: categories.length });
      }
      await AdminService.logAction(currentUser?.id, editingCategory ? 'update_category' : 'create_category', 'categories', editingCategory?.id);
      setShowModal(false);
      setFormData({ name: '', description: '', image: '', active: true });
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      active: category.active ?? true
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Delete this category?')) return;
    try {
      await AdminService.deleteCategory(categoryId);
      await AdminService.logAction(currentUser?.id, 'delete_category', 'categories', categoryId);
      loadCategories();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await AdminService.updateCategory(category.id, { active: !category.active });
      loadCategories();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedItem, 1);
    newCategories.splice(dropIndex, 0, removed);
    setCategories(newCategories);

    try {
      await AdminService.reorderCategories(newCategories.map(c => c.id));
    } catch (err) {
      console.error('Failed to save order:', err);
      loadCategories();
    }
    setDraggedItem(null);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '', active: true });
    setShowModal(true);
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <button className="add-btn primary" onClick={openAddModal}>+ Add Category</button>
      </div>

      <div className="categories-grid">
        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state"><p>No categories yet</p></div>
        ) : (
          categories.map((category, index) => (
            <div 
              key={category.id} 
              className={`category-card ${category.active ? '' : 'inactive'}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="drag-handle">⋮⋮</div>
              <div className="cat-icon">
                {category.image ? <img src={category.image} alt={category.name} /> : '📁'}
              </div>
              <h3>{category.name}</h3>
              <p>{category.description || 'No description'}</p>
              <span className={`cat-status ${category.active ? 'active' : 'inactive'}`}>
                {category.active ? 'Active' : 'Inactive'}
              </span>
              <div className="cat-actions">
                <button onClick={() => handleToggleActive(category)}>
                  {category.active ? 'Disable' : 'Enable'}
                </button>
                <button className="edit-btn" onClick={() => handleEdit(category)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(category.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Vegetables"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Category description"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="toggle-group">
                <label className="toggle-label">
                  <input 
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <span>Active</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingCategory ? 'Update' : 'Add'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;