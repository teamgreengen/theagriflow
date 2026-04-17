import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../config/supabase';
import '../auth/Auth.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'admin'
          }
        }
      });

      if (signUpError) throw signUpError;

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: 'admin',
          status: 'pending'
        });

      if (insertError) console.error('User insert error:', insertError);

      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            <h2>Registration Submitted!</h2>
            <p className="auth-subtitle">Your admin account request has been submitted. You will be notified once approved.</p>
            <p className="auth-link">
              <Link to="/admin/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <h2>Admin Registration</h2>
          <p className="auth-subtitle">Request admin access to Agriflow</p>

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
                placeholder="e.g., 0241234567"
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
                minLength={6}
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
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn admin-btn">
              {loading ? 'Submitting...' : 'Request Admin Access'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/admin/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;