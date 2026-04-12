import { useState, useEffect } from 'react';
import supabase from '../../config/supabase';
import { ProductService } from '../../services/supabaseService';
import { useAuth } from '../../context/SupabaseAuthContext';
import ImageService from '../../services/supabaseImageService';
import './Products.css';

const SellerProducts = () => {
  const { currentUser, userData } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'vegetables',
    stock: '',
    description: '',
    unit: 'per kg',
    image: null,
    imagePreview: null
  });

  const categories = [
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'cereals', name: 'Cereals & Grains' },
    { id: 'livestock', name: 'Livestock' },
    { id: 'poultry', name: 'Poultry' },
    { id: 'herbs', name: 'Fresh Herbs' },
    { id: 'spices', name: 'Spices' },
    { id: 'seeds', name: 'Seeds & Seedlings' },
    { id: 'equipment', name: 'Farm Equipment' },
    { id: 'processed', name: 'Processed Foods' }
  ];

  const fallbackProducts = [
    { id: '1', name: 'Organic Tomatoes', price: 15, stock: 50, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200', category: 'vegetables', sellerName: 'My Farm' },
    { id: '2', name: 'Fresh Mangoes', price: 25, stock: 30, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200', category: 'fruits', sellerName: 'My Farm' },
    { id: '3', name: 'Local Rice', price: 18, stock: 100, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200', category: 'cereals', sellerName: 'My Farm' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (currentUser) {
          const data = await ProductService.getBySeller(currentUser.id);
          if (data.length > 0) {
            setProducts(data);
          } else {
            setProducts(fallbackProducts);
          }
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.log('Using fallback products:', error.message);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = ImageService.validateImage(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setNewProduct({
        ...newProduct,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = newProduct.imagePreview;
      
      if (newProduct.image) {
        imageUrl = await ImageService.uploadImage(newProduct.image, 'products');
      }
      
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        description: newProduct.description,
        unit: newProduct.unit,
        image: imageUrl,
        sellerId: currentUser?.id || 'demo',
        sellerName: userData?.storeName || userData?.name || 'Agriflow Seller',
        status: 'active',
        rating: 0,
        reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (currentUser) {
        await ProductService.create(productData);
      }
      
      setProducts([...products, { ...productData, id: Date.now().toString() }]);
      alert('Product added successfully!');
      setShowAddModal(false);
      setNewProduct({
        name: '',
        price: '',
        category: 'vegetables',
        stock: '',
        description: '',
        unit: 'per kg',
        image: null,
        imagePreview: null
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to add product: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      if (currentUser) {
        await ProductService.delete(productId);
      }
      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <div className="products-page"><div className="loading">Loading products...</div></div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>My Products</h1>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add New Product</button>
      </div>

      <div className="products-list">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={product.image || 'https://via.placeholder.com/50'} 
                      alt={product.name} 
                      className="product-thumb" 
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{categories.find(c => c.id === product.category)?.name || product.category}</td>
                  <td>GH₵ {product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload">
                  {newProduct.imagePreview ? (
                    <img src={newProduct.imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>Click to upload image</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (GH₵) *</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select 
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                  >
                    <option value="per kg">per kg</option>
                    <option value="per piece">per piece</option>
                    <option value="per bunch">per bunch</option>
                    <option value="per tray">per tray</option>
                    <option value="per liter">per liter</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows="4"
                  placeholder="Describe your product..."
                />
              </div>

              <button type="submit" disabled={uploading} className="submit-btn">
                {uploading ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;