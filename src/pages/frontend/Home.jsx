import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Home.css';

const categories = [
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200' },
  { id: 'cereals', name: 'Cereals & Grains', icon: '🌾', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
  { id: 'livestock', name: 'Livestock', icon: '🐄', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=200' },
  { id: 'poultry', name: 'Poultry', icon: '🐔', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200' },
  { id: 'herbs', name: 'Fresh Herbs', icon: '🌿', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200' },
  { id: 'spices', name: 'Spices', icon: '🌶️', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' },
  { id: 'seeds', name: 'Seeds', icon: '🌱', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200' },
  { id: 'equipment', name: 'Farm Tools', icon: '🚜', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200' },
  { id: 'processed', name: 'Processed', icon: '🍯', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200' }
];

const flashDeals = [
  { id: 1, name: 'Organic Tomatoes 5kg', price: 45, oldPrice: 60, discount: 25, image: 'https://images.unsplash.com/photo-1546470427-227c7a6730e3?w=400', sold: 120 },
  { id: 2, name: 'Fresh Mangoes Bunch', price: 25, oldPrice: 35, discount: 29, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', sold: 95 },
  { id: 3, name: 'Brown Rice 10kg', price: 120, oldPrice: 150, discount: 20, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', sold: 210 },
  { id: 4, name: 'Local Honey 500ml', price: 55, oldPrice: 75, discount: 27, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', sold: 67 },
  { id: 5, name: 'Cassava Starch 5kg', price: 40, oldPrice: 55, discount: 27, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', sold: 88 },
  { id: 6, name: 'Palm Oil 5L', price: 150, oldPrice: 180, discount: 17, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', sold: 156 },
  { id: 7, name: 'Fresh Eggs Tray', price: 35, oldPrice: 45, discount: 22, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', sold: 203 },
  { id: 8, name: 'Plantain Bunch', price: 25, oldPrice: 35, discount: 29, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', sold: 74 }
];

const topProducts = [
  { id: 1, name: 'Fresh Tomatoes', price: 30, oldPrice: 40, discount: 25, image: 'https://images.unsplash.com/photo-1546470427-227c7a6730e3?w=400' },
  { id: 2, name: 'Sweet Mangoes', price: 40, oldPrice: 55, discount: 27, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400' },
  { id: 3, name: 'Premium Rice 5kg', price: 85, oldPrice: 100, discount: 15, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { id: 4, name: 'Organic Honey', price: 50, oldPrice: 70, discount: 29, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400' },
  { id: 5, name: 'Cassava Starch', price: 35, oldPrice: 45, discount: 22, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400' },
  { id: 6, name: 'Pure Palm Oil 5L', price: 130, oldPrice: 160, discount: 19, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { id: 7, name: 'Farm Eggs Tray', price: 38, oldPrice: 48, discount: 21, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
  { id: 8, name: 'Fresh Plantain', price: 22, oldPrice: 30, discount: 27, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' },
  { id: 9, name: 'Yam Tubers', price: 50, oldPrice: 65, discount: 23, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400' },
  { id: 10, name: 'Groundnut 2kg', price: 45, oldPrice: 60, discount: 25, image: 'https://images.unsplash.com/photo-1596910547596-e68c6da33e9a?w=400' }
];

const ProductCard2x2 = ({ product, showDiscount = true }) => {
  const { addToCart } = useCart();

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {product.discount && showDiscount && <div className="discount-tag">-{product.discount}%</div>}
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <div className="product-info-grid">
          <span className="product-name">{product.name}</span>
          <span className="product-price">GH₵ {product.price}</span>
          {product.oldPrice && <span className="product-old-price">GH₵ {product.oldPrice}</span>}
          {product.discount && showDiscount && <span className="product-discount">-{product.discount}%</span>}
          {product.sold && <span className="product-sold">{product.sold} sold</span>}
        </div>
      </div>
      <div className="add-to-cart-overlay">
        <button onClick={(e) => { e.preventDefault(); addToCart(product); }}>Add to Cart</button>
      </div>
    </Link>
  );
};

const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="jumia-home">
      <div className="home-wrapper">
        <div className="main-container">
          <aside className="left-sidebar">
            <div className="category-header">
              <span>👤</span>
              <span>Shop by Category</span>
            </div>
            <ul className="category-menu">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`}>
                    <span>{cat.icon}</span> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <main className="main-content">
            <div className="hero-section">
              <div className="hero-slider">
                <div className="hero-slide" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200)'}}>
                  <div className="hero-overlay">
                    <h1>Fresh from Ghana's Farms</h1>
                    <p>Buy directly from local farmers</p>
                    <Link to="/products" className="hero-btn">Shop Now</Link>
                  </div>
                </div>
              </div>
              <div className="hero-banners">
                <div className="mini-banner" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400)'}}>
                  <span>Farm Inputs</span>
                </div>
                <div className="mini-banner" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400)'}}>
                  <span>Livestock</span>
                </div>
              </div>
            </div>

            <section className="flash-deals">
              <div className="section-header">
                <div className="flash-title">
                  <span className="flash-icon">⚡</span>
                  <h2>Flash Sales</h2>
                  <span className="countdown">Ends: 05:32:18</span>
                </div>
                <Link to="/products" className="see-all">See All ›</Link>
              </div>
              <div className="products-scroll">
                {flashDeals.map(product => (
                  <ProductCard2x2 key={product.id} product={product} />
                ))}
              </div>
            </section>

            <section className="category-row">
              <h2>Shop by Category</h2>
              <div className="category-scroll">
                {categories.map(cat => (
                  <Link key={cat.id} to={`/products?category=${cat.id}`} className="cat-item">
                    <img src={cat.image} alt={cat.name} />
                    <span>{cat.icon} {cat.name}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="product-section">
              <div className="section-header">
                <h2>Top Selling Products</h2>
                <Link to="/products" className="see-all">See All ›</Link>
              </div>
              <div className="products-grid">
                {topProducts.map(product => (
                  <ProductCard2x2 key={product.id} product={product} showDiscount={true} />
                ))}
              </div>
            </section>

            <section className="ad-banner-full">
              <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400" alt="Banner" />
              <div className="ad-content">
                <h2>Start Selling on Agriflow</h2>
                <p>Reach thousands of customers across Ghana</p>
                <Link to="/seller/register" className="sell-btn">Become a Seller</Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
