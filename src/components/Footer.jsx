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
          <p>Ghana's premier agricultural marketplace.</p>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/market">Market Pricing</Link>
          <Link to="/register">Become a Seller</Link>
        </div>

        <div className="footer-section">
          <h3>Categories</h3>
          <a href="#">Vegetables</a>
          <a href="#">Fruits</a>
          <a href="#">Cereals & Grains</a>
          <a href="#">Livestock</a>
          <a href="#">Farm Equipment</a>
        </div>



        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>📍 Accra, Ghana</p>
          <p>📧 teamgreengen@gmail.com</p>
          <p>📱 +233 24 123 4567</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Agriflow. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;