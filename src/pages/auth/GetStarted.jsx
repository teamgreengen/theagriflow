import { Link } from 'react-router-dom';
import './Auth.css';

const GetStarted = () => {
  return (
    <div className="get-started-page">
      <div className="get-started-container">
        <div className="get-started-header">
          <Link to="/" className="get-started-logo">
            <span className="logo-text">agri</span>
            <span className="logo-highlight">flow</span>
          </Link>
          <h1>Welcome to Agriflow</h1>
          <p>Choose how you want to get started</p>
        </div>

        <div className="get-started-grid">
          <div className="get-started-card buyer-card">
            <div className="card-icon">🛒</div>
            <h2>Shop on Agriflow</h2>
            <p>Browse fresh agricultural products from local farmers</p>
            <div className="card-actions">
              <Link to="/register" className="btn btn-primary">Create Account</Link>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
            </div>
          </div>

          <div className="get-started-card seller-card">
            <div className="card-icon">🏪</div>
            <h2>Sell Your Products</h2>
            <p>Reach thousands of customers across Ghana</p>
            <div className="card-actions">
              <Link to="/seller/register" className="btn btn-primary">Become a Seller</Link>
              <Link to="/seller/login" className="btn btn-outline">Seller Login</Link>
            </div>
          </div>

          <div className="get-started-card rider-card">
            <div className="card-icon">🚴</div>
            <h2>Deliver with Us</h2>
            <p>Earn money delivering orders in your area</p>
            <div className="card-actions">
              <Link to="/rider/register" className="btn btn-primary">Become a Rider</Link>
              <Link to="/rider/login" className="btn btn-outline">Rider Login</Link>
            </div>
          </div>

          <div className="get-started-card admin-card">
            <div className="card-icon">⚙️</div>
            <h2>Admin Portal</h2>
            <p>Manage the Agriflow platform operations</p>
            <div className="card-actions">
              <Link to="/admin/register" className="btn btn-primary">Request Access</Link>
              <Link to="/admin/login" className="btn btn-outline">Admin Login</Link>
            </div>
          </div>

          <div className="get-started-card superadmin-card">
            <div className="card-icon">🔐</div>
            <h2>Super Admin</h2>
            <p>Full system control and management</p>
            <div className="card-actions">
              <Link to="/superadmin/login" className="btn btn-outline">Super Admin Login</Link>
            </div>
          </div>
        </div>

        <div className="get-started-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;