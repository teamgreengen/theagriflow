import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    alert('Added to cart!');
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="empty-wishlist">
          <span className="empty-icon">♡</span>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist</p>
          <Link to="/products" className="shop-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1>My Wishlist ({getWishlistCount()} items)</h1>
        
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-item">
              <Link to={`/product/${item.id}`} className="item-image">
                <img src={item.image} alt={item.name} />
              </Link>
              <div className="item-details">
                <Link to={`/product/${item.id}`} className="item-name">
                  {item.name}
                </Link>
                <p className="item-seller">by {item.sellerName || 'Agriflow Seller'}</p>
                <div className="item-price">
                  <span className="current-price">GH₵ {item.price}</span>
                  {item.originalPrice && (
                    <span className="old-price">GH₵ {item.originalPrice}</span>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="add-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;