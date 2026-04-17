import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import supabase from '../../config/supabase';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
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
      
      switch (role) {
        case 'super_admin':
          navigate('/superadmin');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'seller':
          navigate('/seller');
          break;
        case 'rider':
          navigate('/rider');
          break;
        default:
          navigate('/');
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
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <span className="logo-text">agri</span>
                <span className="logo-highlight">flow</span>
              </Link>
            </div>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>

            {error && <div className="auth-error">{error}</div>}
            {resetSent && <div className="auth-success">Password reset link sent to your email!</div>}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-link">
              Remember your password? <Link to="/login" onClick={() => setShowForgotPassword(false)}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-text">agri</span>
              <span className="logo-highlight">flow</span>
            </Link>
          </div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your buyer account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
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

            <button type="button" className="forgot-password" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </button>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one here</Link>
          </p>

          <div className="auth-portals">
            <p>Are you a:</p>
            <div className="portal-links">
              <Link to="/seller/login">Seller</Link>
              <Link to="/rider/login">Rider</Link>
              <Link to="/admin/login">Admin</Link>
              <Link to="/superadmin/login">Super Admin</Link>
            </div>
          </div>

          <div className="auth-register-options">
            <p>New to Agriflow?</p>
            <div className="register-links">
              <Link to="/register" className="register-link">Create Buyer Account</Link>
              <Link to="/seller/register" className="register-link">Become a Seller</Link>
              <Link to="/rider/register" className="register-link">Become a Rider</Link>
              <Link to="/admin/register" className="register-link">Request Admin Access</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;