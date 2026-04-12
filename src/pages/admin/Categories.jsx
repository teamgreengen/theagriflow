import { useState } from 'react';
import './Categories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Vegetables', icon: '🥬', products: 45, order: 1 },
    { id: 2, name: 'Fruits', icon: '🍎', products: 32, order: 2 },
    { id: 3, name: 'Cereals & Grains', icon: '🌾', products: 28, order: 3 },
    { id: 4, name: 'Livestock', icon: '🐄', products: 15, order: 4 },
    { id: 5, name: 'Poultry', icon: '🐔', products: 22, order: 5 },
    { id: 6, name: 'Fresh Herbs', icon: '🌿', products: 18, order: 6 }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });

  const icons = ['🥬', '🍎', '🌾', '🐄', '🐔', '🌿', '🌶️', '🌱', '🚜', '🍯', '🥚', '🥩'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCat = {
      id: Date.now(),
      name: newCategory.name,
      icon: newCategory.icon,
      products: 0,
      order: categories.length + 1
    };
    setCategories([...categories, newCat]);
    setShowAddModal(false);
    setNewCategory({ name: '', icon: '' });
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add Category</button>
      </div>

      <div className="categories-grid">
        {categories.map(cat => (
          <div key={cat.id} className="category-card">
            <div className="cat-icon">{cat.icon}</div>
            <h3>{cat.name}</h3>
            <p>{cat.products} products</p>
            <div className="cat-actions">
              <button className="edit-btn">Edit</button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  required
                  placeholder="e.g., Organic Produce"
                />
              </div>
              <div className="form-group">
                <label>Select Icon</label>
                <div className="icon-selector">
                  {icons.map(icon => (
                    <button 
                      key={icon}
                      type="button"
                      className={`icon-btn ${newCategory.icon === icon ? 'selected' : ''}`}
                      onClick={() => setNewCategory({...newCategory, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;