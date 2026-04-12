import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductService } from '../../services/supabaseService';
import { useCart } from '../../context/CartContext';
import './Products.css';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'cereals', name: 'Cereals & Grains', icon: '🌾' },
    { id: 'livestock', name: 'Livestock', icon: '🐄' },
    { id: 'poultry', name: 'Poultry', icon: '🐔' },
    { id: 'herbs', name: 'Fresh Herbs', icon: '🌿' },
    { id: 'equipment', name: 'Farm Equipment', icon: '🚜' }
  ];

  const fallbackProducts = [
    { id: '1', name: 'Organic Tomatoes', price: 15, originalPrice: 25, category: 'vegetables', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', sellerName: 'Green Farm', rating: 4.5, reviews: 28, unit: 'per kg' },
    { id: '2', name: 'Fresh Mangoes', price: 25, originalPrice: 35, category: 'fruits', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', sellerName: 'Tropical Fruits', rating: 4.8, reviews: 56, unit: 'per kg' },
    { id: '3', name: 'Local Rice (1kg)', price: 18, originalPrice: 25, category: 'cereals', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', sellerName: 'Ghana Rice Co', rating: 4.2, reviews: 89, unit: 'per kg' },
    { id: '4', name: 'Cassava (5kg)', price: 30, originalPrice: 45, category: 'vegetables', image: 'https://images.unsplash.com/photo-1590595007322-3350a65570ce?w=400', sellerName: 'Local Farmers', rating: 4.0, reviews: 34, unit: 'per 5kg' },
    { id: '5', name: 'Pineapple', price: 12, originalPrice: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', sellerName: 'Pineapple Farms', rating: 4.7, reviews: 67, unit: 'per piece' },
    { id: '6', name: 'Fresh Eggs (Tray)', price: 20, originalPrice: 28, category: 'poultry', image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=400', sellerName: 'Poultry Plus', rating: 4.6, reviews: 112, unit: 'per tray' },
    { id: '7', name: 'Maize (5kg)', price: 35, originalPrice: 50, category: 'cereals', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', sellerName: 'Grain Masters', rating: 4.3, reviews: 45, unit: 'per 5kg' },
    { id: '8', name: 'Green Peppers', price: 8, originalPrice: 15, category: 'vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', sellerName: 'Veggie Zone', rating: 4.4, reviews: 23, unit: 'per kg' },
    { id: '9', name: 'Plantain', price: 15, originalPrice: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', sellerName: 'Green Grocers', rating: 4.5, reviews: 38, unit: 'per bunch' },
    { id: '10', name: 'Cocoyam (3kg)', price: 25, originalPrice: 40, category: 'vegetables', image: 'https://images.unsplash.com/photo-1590595007322-3350a65570ce?w=400', sellerName: 'Local Farmers', rating: 4.2, reviews: 29, unit: 'per 3kg' },
    { id: '11', name: 'Broilers (Live)', price: 80, originalPrice: 120, category: 'livestock', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400', sellerName: 'Poultry Farm', rating: 4.8, reviews: 56, unit: 'per bird' },
    { id: '12', name: 'Fresh Basil', price: 5, originalPrice: 10, category: 'herbs', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400', sellerName: 'Herb Garden', rating: 4.6, reviews: 18, unit: 'per bunch' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let data;
        
        if (categoryFilter && categoryFilter !== 'all') {
          data = await ProductService.getByCategory(categoryFilter);
        } else {
          data = await ProductService.getAll(50);
        }
        
        if (data && data.length > 0) {
          const filtered = searchQuery 
            ? data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : data;
          setProducts(filtered);
        } else {
          const filtered = categoryFilter && categoryFilter !== 'all'
            ? fallbackProducts.filter(p => p.category === categoryFilter)
            : fallbackProducts;
          setProducts(filtered);
        }
      } catch (error) {
        console.log('Using fallback products:', error.message);
        const filtered = categoryFilter && categoryFilter !== 'all'
          ? fallbackProducts.filter(p => p.category === categoryFilter)
          : fallbackProducts;
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchQuery]);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert('Added to cart!');
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>
          {categoryFilter && categoryFilter !== 'all' 
            ? categories.find(c => c.id === categoryFilter)?.name || 'Products'
            : searchQuery ? `Search: "${searchQuery}"` : 'All Products'
          }
        </h1>
        <span className="product-count">{products.length} products</span>
      </div>

      <div className="products-layout">
        <aside className="products-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <ul className="category-filter">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link 
                    to={cat.id === 'all' ? '/products' : `/products?category=${cat.id}`}
                    className={(!categoryFilter && cat.id === 'all') || categoryFilter === cat.id ? 'active' : ''}
                  >
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input type="number" placeholder="Min" />
              <span>-</span>
              <input type="number" placeholder="Max" />
              <button>Go</button>
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-toolbar">
            <div className="view-toggle">
              <button 
                className={viewMode === 'grid' ? 'active' : ''} 
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
            <select className="sort-select">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try a different category or search term</p>
              <Link to="/products" className="btn">View All Products</Link>
            </div>
          ) : (
            <div className={`products-${viewMode}`}>
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <div className="product-info">
                    <Link to={`/product/${product.id}`} className="product-name">
                      {product.name}
                    </Link>
                    <p className="product-seller">{product.sellerName || 'Agriflow Seller'}</p>
                    <div className="product-price">
                      <span className="current-price">GH₵ {product.price}</span>
                      {product.originalPrice && (
                        <span className="old-price">GH₵ {product.originalPrice}</span>
                      )}
                    </div>
                    <div className="product-rating">
                      <span className="stars">★ {product.rating || '5.0'}</span>
                      <span className="reviews">({product.reviews || 0})</span>
                    </div>
                    <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
