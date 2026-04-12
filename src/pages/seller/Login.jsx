import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../auth/Auth.css';

const SellerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user && user.role === 'seller') {
        navigate('/seller');
      } else {
        setError('Access denied. Sellers only.');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
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
          <h2>Seller Sign In</h2>
          <p className="auth-subtitle">Access your seller dashboard</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your seller email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn seller-btn">
              {loading ? 'Signing in...' : 'Sign In as Seller'}
            </button>
          </form>

          <p className="auth-link">
            New seller? <Link to="/seller/register">Register here</Link>
          </p>
          
          <div className="auth-portals">
            <p>Are you a:</p>
            <div className="portal-links">
              <Link to="/login">Buyer</Link>
              <Link to="/admin/login">Admin</Link>
              <Link to="/rider/login">Rider</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
