import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import supabase from '../../config/supabase';
import '../auth/Auth.css';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, userData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const role = userData?.role;
      
      if (role === 'super_admin') {
        navigate('/superadmin');
      } else if (role === 'admin') {
        setError('Please use the Admin Login page.');
      } else {
        setError('Access denied. Super Admin only.');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
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
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter your super admin email to receive a reset link</p>

            {error && <div className="auth-error">{error}</div>}
            {resetSent && <div className="auth-success">Password reset link sent to your email!</div>}

            <form onSubmit={handleForgotPassword}>
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

              <button type="submit" disabled={loading} className="auth-btn super-admin-btn">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-link">
              Remember password? <Link to="/superadmin/login" onClick={() => setShowForgotPassword(false)}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

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

            <button type="button" className="forgot-password" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </button>

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
