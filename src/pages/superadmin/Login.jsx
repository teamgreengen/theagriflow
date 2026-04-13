import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import '../auth/Auth.css';

const SuperAdminLogin = () => {
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
      // Explicitly check for super_admin role
      if (user && user.role === 'super_admin') {
        navigate('/superadmin');
      } else if (user && user.role === 'admin') {
        setError('Please use the Admin Login page for standard admin access.');
      } else {
        setError('Access denied. Super Admin only.');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page super-admin-auth">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-text">agri</span>
              <span className="logo-highlight">flow</span>
            </Link>
            <span className="auth-badge super-admin">Super Admin</span>
          </div>
          <h2>Super Admin Sign In</h2>
          <p className="auth-subtitle">Full system control access</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Super Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter super admin email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter secure password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn super-admin-btn">
              {loading ? 'Authenticating...' : 'Sign In to Root Console'}
            </button>
          </form>

          <p className="auth-link">
            Standard Access: <Link to="/admin/login">Admin</Link> | <Link to="/seller/login">Seller</Link> | <Link to="/login">Buyer</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
