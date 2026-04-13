import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductService } from '../../services/supabaseService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Reviews from '../../components/Reviews';
import supabase from '../../config/supabase';
import { useAuth } from '../../context/SupabaseAuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbackProduct = {
    id: id,
    name: 'Organic Tomatoes',
    price: 15,
    originalPrice: 25,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
      'https://images.unsplash.com/photo-1561155707-64c64179e56b?w=800',
      'https://images.unsplash.com/photo-1598514983338-1e3d9b5ae4c3?w=800'
    ],
    description: 'Fresh organic tomatoes directly from local farms in Ghana. Our tomatoes are grown using sustainable farming methods without any harmful pesticides or chemicals. Perfect for cooking, salads, or eating raw.',
    seller: {
      id: '1',
      name: 'Green Farm',
      verified: true,
      rating: 4.8,
      totalSales: 250,
      location: 'Accra, Ghana'
    },
    unit: 'per kg',
    stock: 50,
    rating: 4.5,
    reviews: 28
  };

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const [productData, reviewsData] = await Promise.all([
          ProductService.get(id),
          supabase.from('reviews').select('*, user:users(name)').eq('productId', id).order('created_at', { ascending: false })
        ]);
        
        if (productData) {
          setProduct(productData);
        } else {
          setProduct(fallbackProduct);
        }

        if (reviewsData.data) {
          setReviews(reviewsData.data.map(r => ({
            ...r,
            reviewerName: r.user?.name || 'Anonymous User',
            createdAt: r.created_at
          })));
        }
      } catch (error) {
        console.log('Fetch error:', error.message);
        setProduct(fallbackProduct);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddReview = async (review) => {
    if (!currentUser) {
      alert('Please login to write a review');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          productId: id,
          userId: currentUser.id,
          rating: review.rating,
          comment: review.comment,
          created_at: new Date().toISOString()
        })
        .select('*, user:users(name)')
        .single();
      
      if (error) throw error;

      if (data) {
        setReviews([
          {
            ...data,
            reviewerName: data.user?.name || userData?.name || 'Anonymous User',
            createdAt: data.created_at
          },
          ...reviews
        ]);
        alert('Review submitted! Thank you.');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to submit review');
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    alert('Added to cart!');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="loading">Product not found</div>;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {product.name}
      </div>

      <div className="product-detail-container">
        <div className="product-gallery">
          <div className="main-image">
            <img src={product.image || product.images?.[0] || fallbackProduct.image} alt={product.name} />
            {product.discount && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>
          <div className="thumbnail-grid">
            {(product.images || fallbackProduct.images).map((img, idx) => (
              <button key={idx} className="thumbnail">
                <img src={img} alt={`${product.name} ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          
          <div className="seller-info">
            <span>Sold by</span>
            <Link to="/">{product.sellerName || product.seller?.name || 'Agriflow Seller'}</Link>
            {(product.verified || product.seller?.verified) && <span className="verified-badge">✓ Verified</span>}
          </div>

          <div className="rating-reviews">
            <span className="stars">{'★'.repeat(Math.floor(product.rating || 5))}</span>
            <span className="rating-value">{product.rating || '5.0'}</span>
            <span className="reviews">({product.reviews || 0} reviews)</span>
          </div>

          <div className="price-section">
            <span className="price">GH₵ {product.price}</span>
            {product.originalPrice && (
              <span className="old-price">GH₵ {product.originalPrice}</span>
            )}
            <span className="unit">({product.unit || 'per item'})</span>
          </div>

          <div className="stock-status">
            {(product.stock === undefined || product.stock > 0) ? (
              <span className="in-stock">✓ In Stock {product.stock ? `(${product.stock} available)` : ''}</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          <div className="ai-price-prediction">
            <div className="ai-badge">🤖 AI Price Insight</div>
            <p>Best time to buy: Now - Price stable for next 7 days</p>
            <p>Expected price trend: 📈 Slight increase</p>
          </div>

          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-input">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} readOnly />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button 
              className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              {inWishlist ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>

          <div className="delivery-info">
            <div className="delivery-option">
              <span>🚚</span>
              <span>Delivery within 24-48 hours</span>
            </div>
            <div className="delivery-option">
              <span>💳</span>
              <span>Pay with Mobile Money or Card</span>
            </div>
            <div className="delivery-option">
              <span>🛡️</span>
              <span>Buyer Protection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-description">
        <h2>Product Description</h2>
        <p>{product.description || 'Fresh agricultural product from verified Ghanaian farmers.'}</p>
      </div>

      {(product.sellerName || product.seller) && (
        <div className="seller-details">
          <h2>About the Seller</h2>
          <div className="seller-card">
            <div className="seller-avatar">{(product.sellerName || product.seller?.name || 'A').charAt(0)}</div>
            <div className="seller-info">
              <h3>{product.sellerName || product.seller?.name || 'Agriflow Seller'}</h3>
              <p>📍 {product.seller?.location || 'Ghana'}</p>
              <p>⭐ {product.seller?.rating || '5.0'} rating • {product.seller?.totalSales || '0'} sales</p>
            </div>
            <button className="contact-seller-btn">Contact Seller</button>
          </div>
        </div>
      )}

      <Reviews 
        productId={id} 
        reviews={reviews}
        onAddReview={handleAddReview}
      />
    </div>
  );
};

export default ProductDetail;