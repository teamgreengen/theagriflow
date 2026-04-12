import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { OrderService } from '../../services/supabaseService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import PaymentService from '../../services/paymentService';
import DeliveryService from '../../services/deliveryService';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: userData?.name?.split(' ')[0] || '',
    lastName: userData?.name?.split(' ')[1] || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: '',
    city: '',
    region: '',
    paymentMethod: 'momo'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    
    const deliveryFee = cartTotal > 100 ? 0 : 15;
    const total = cartTotal + deliveryFee;
    
    const orderData = {
      id: PaymentService.generateReference('ORD'),
      userId: currentUser?.id || 'guest',
      userEmail: formData.email,
      userName: `${formData.firstName} ${formData.lastName}`,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      subtotal: cartTotal,
      deliveryFee: deliveryFee,
      total: total,
      delivery: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        region: formData.region
      },
      payment: {
        method: formData.paymentMethod,
        status: 'paid',
        reference: response.reference,
        amount: total
      },
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const orderId = await OrderService.create(orderData);
      
      await DeliveryService.createFromOrder(orderId, {
        ...orderData,
        sellerId: cart[0]?.sellerId || null,
        sellerAddress: 'Seller Location'
      });
      
      clearCart();
      navigate(`/order-tracking?order=${orderId}`);
    } catch (error) {
      console.error('Order save error:', error);
      alert('Payment successful but order save failed. Contact support.');
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const reference = PaymentService.generateReference();
    const deliveryFee = cartTotal > 100 ? 0 : 15;
    const total = cartTotal + deliveryFee;

    try {
      await PaymentService.checkout({
        email: formData.email,
        amount: total,
        reference,
        onSuccess: handlePaymentSuccess,
        onClose: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Payment failed. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <Link to="/products" className="shop-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const deliveryFee = cartTotal > 100 ? 0 : 15;
  const total = cartTotal + deliveryFee;

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Delivery Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g., 0241234567" />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" placeholder="Enter your full delivery address" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City/Town</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select name="region" value={formData.region} onChange={handleChange} required>
                  <option value="">Select Region</option>
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Northern">Northern</option>
                  <option value="Upper East">Upper East</option>
                  <option value="Upper West">Upper West</option>
                  <option value="Volta">Volta</option>
                  <option value="Brong Ahafo">Brong Ahafo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Payment Method</h2>
            
            <div className="payment-options">
              <label className={`payment-option ${formData.paymentMethod === 'momo' ? 'selected' : ''}`}>
                <input type="radio" name="paymentMethod" value="momo" checked={formData.paymentMethod === 'momo'} onChange={handleChange} />
                <div className="payment-content">
                  <span className="payment-icon">📱</span>
                  <div>
                    <strong>Mobile Money</strong>
                    <p>MTN, Vodafone, AirtelTigo</p>
                  </div>
                </div>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} />
                <div className="payment-content">
                  <span className="payment-icon">💳</span>
                  <div>
                    <strong>Card Payment</strong>
                    <p>Visa, Mastercard</p>
                  </div>
                </div>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'ghanaCard' ? 'selected' : ''}`}>
                <input type="radio" name="paymentMethod" value="ghanaCard" checked={formData.paymentMethod === 'ghanaCard'} onChange={handleChange} />
                <div className="payment-content">
                  <span className="payment-icon">🪪</span>
                  <div>
                    <strong>Ghana Card</strong>
                    <p>Pay with your Ghana Card</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="place-order-btn">
            {loading ? 'Processing...' : `Pay Now - GH₵ ${total.toFixed(2)}`}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <span className="item-price">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>GH₵ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'Free' : `GH₵ ${deliveryFee}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>GH₵ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;