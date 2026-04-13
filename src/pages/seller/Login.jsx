import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import supabase from '../../config/supabase';
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
      await login(email, password);
      
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();
      
      const role = profile?.role;
      
      if (role === 'seller') {
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
                placeholder="Enter seller email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn seller-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link">
            <Link to="/login">Buyer</Link> | <Link to="/seller/register">Register</Link> | <Link to="/superadmin/login">Super Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;