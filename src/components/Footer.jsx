import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <img src="/logo-3.png" alt="Agriflow" />
          </div>
          <p>Ghana's premier agricultural marketplace connecting farmers with buyers nationwide.</p>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Get Started</h3>
          <Link to="/get-started">All Options</Link>
          <Link to="/register">Buyer Account</Link>
          <Link to="/seller/register">Become a Seller</Link>
          <Link to="/rider/register">Become a Rider</Link>
          <Link to="/admin/register">Admin Access</Link>
        </div>

        <div className="footer-section">
          <h3>Portal Login</h3>
          <Link to="/login">Buyer Login</Link>
          <Link to="/seller/login">Seller Login</Link>
          <Link to="/rider/login">Rider Login</Link>
          <Link to="/admin/login">Admin Login</Link>
          <Link to="/superadmin/login">Super Admin</Link>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/products">Products</Link>
          <Link to="/market-pricing">Market Prices</Link>
          <Link to="/my-orders">Track Order</Link>
          <Link to="/">Home</Link>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>📍 Accra, Ghana</p>
          <p>📧 teamgreengen@gmail.com</p>
          <p>📱 +233 24 123 4567</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Agriflow. All rights reserved. | <Link to="/admin/login">Admin</Link></p>
      </div>
    </footer>
  );
};

export default Footer;