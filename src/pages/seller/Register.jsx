import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import '../auth/Auth.css';

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    ghanaCardNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name, 'seller', {
        storeName: formData.storeName,
        phone: formData.phone,
        ghanaCardNumber: formData.ghanaCardNumber
      });
      navigate('/seller');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page seller-auth">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-text">agri</span>
              <span className="logo-highlight">flow</span>
            </Link>
            <span className="auth-badge seller">Seller Portal</span>
          </div>
          <h2>Become a Seller</h2>
          <p className="auth-subtitle">Start selling your products on Agriflow</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="Your farm or store name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="e.g., 0241234567"
              />
            </div>

            <div className="form-group">
              <label>Ghana Card Number</label>
              <input
                type="text"
                name="ghanaCardNumber"
                value={formData.ghanaCardNumber}
                onChange={handleChange}
                required
                placeholder="Enter your Ghana Card number"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn seller-btn">
              {loading ? 'Creating Account...' : 'Start Selling'}
            </button>
          </form>

          <p className="auth-link">
            Already have a seller account? <Link to="/seller/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
