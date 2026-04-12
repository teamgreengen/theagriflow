import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import '../auth/Auth.css';

const AdminLogin = () => {
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
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        navigate(user.role === 'super_admin' ? '/superadmin' : '/admin');
      } else {
        setError('Access denied. Admin only.');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-text">agri</span>
              <span className="logo-highlight">flow</span>
            </Link>
            <span className="auth-badge admin">Admin Portal</span>
          </div>
          <h2>Admin Sign In</h2>
          <p className="auth-subtitle">Access the admin dashboard</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your admin email"
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

            <button type="submit" disabled={loading} className="auth-btn admin-btn">
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <p className="auth-link">
            Are you a: <Link to="/login">Buyer</Link> | <Link to="/seller/login">Seller</Link> | <Link to="/rider/login">Rider</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
