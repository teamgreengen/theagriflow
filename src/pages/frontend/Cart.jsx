import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some fresh products to get started!</p>
          <Link to="/products" className="shop-btn">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{cart.length} item(s) in your cart</p>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <Link to={`/product/${item.id}`} className="item-name">{item.name}</Link>
                <p className="item-seller">by {item.sellerName || 'Seller'}</p>
                <p className="item-price">GH₵ {item.price}</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">
                GH₵ {(item.price * item.quantity).toFixed(2)}
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>GH₵ {cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>GH₵ {cartTotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>
          <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;