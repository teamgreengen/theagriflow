import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    ghanaCardNumber: '',
    storeName: '',
    description: ''
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
      const additionalData = {};
      
      if (formData.role === 'seller') {
        additionalData.storeName = formData.storeName;
        additionalData.description = formData.description;
        additionalData.ghanaCardNumber = formData.ghanaCardNumber;
        additionalData.phone = formData.phone;
      }

      if (formData.role === 'rider') {
        additionalData.ghanaCardNumber = formData.ghanaCardNumber;
        additionalData.phone = formData.phone;
      }

      await signup(formData.email, formData.password, formData.name, formData.role, additionalData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join Agriflow - Ghana's Agricultural Marketplace</p>

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
              <label>Account Type</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller (Farmer/Trader)</option>
                <option value="rider">Delivery Rider</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {(formData.role === 'seller' || formData.role === 'rider') && (
              <div className="form-group">
                <label>Ghana Card Number (for verification)</label>
                <input
                  type="text"
                  name="ghanaCardNumber"
                  value={formData.ghanaCardNumber}
                  onChange={handleChange}
                  placeholder="Enter your Ghana Card number"
                />
              </div>
            )}

            {formData.role === 'seller' && (
              <>
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
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your products"
                    rows="3"
                  />
                </div>
              </>
            )}

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

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;