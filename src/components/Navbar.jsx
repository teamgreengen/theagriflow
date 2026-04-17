import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, userData, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getDashboardLink = () => {
    if (!userData) return '/login';
    switch (userData.role) {
      case 'seller': return '/seller';
      case 'admin': return '/admin';
      case 'super_admin': return '/superadmin';
      case 'rider': return '/rider';
      default: return '/';
    }
  };

  const getUserName = () => {
    if (userData?.name) return userData.name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getRoleBadge = () => {
    switch (userData?.role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'seller': return 'Seller';
      case 'rider': return 'Rider';
      default: return 'Buyer';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="jumia-navbar">
      <div className="nav-main">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src="/logo-2.png" alt="Agriflow" className="logo-img" />
          </Link>

          <form className="nav-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          <div className="nav-actions">
            {user ? (
              <div 
                className={`nav-item account-item ${dropdownOpen ? 'active' : ''}`} 
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="account-trigger">
                  <span className="nav-icon">👤</span>
                  <div className="nav-text">
                    <small>Hello, {getUserName()}</small>
                    <strong>Account</strong>
                  </div>
                </div>
                
                <div className={`account-dropdown ${dropdownOpen ? 'show' : ''}`}>
                  <div className="dropdown-header">
                    <span className="user-name">{userData?.name || 'User'}</span>
                    <span className={`role-badge ${userData?.role || 'buyer'}`}>{getRoleBadge()}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-icon">📊</span> My Dashboard
                  </Link>
                  <Link to="/my-orders" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-icon">📦</span> My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-icon">❤️</span> Wishlist
                  </Link>
                  <Link to="/chat" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-icon">💬</span> Messages
                  </Link>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-icon">⚙️</span> Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="logout-btn">
                    <span className="dropdown-icon">🚪</span> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-item">
                <span className="nav-icon">👤</span>
                <div className="nav-text">
                  <small>Sign in</small>
                  <strong>Account</strong>
                </div>
              </Link>
            )}

            <Link to="/cart" className="nav-item cart-item">
              <span className="nav-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </span>
              <span className="cart-badge">{getCartCount()}</span>
            </Link>
          </div>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className="nav-bottom">
        <div className="nav-links">
          <Link to="/products">All Products</Link>
          <Link to="/market-pricing">Market Prices</Link>
          <Link to="/get-started">Get Started</Link>
          <Link to="/seller/register">Become a Seller</Link>
          <Link to="/rider/register">Deliver with Us</Link>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
        <Link to="/market-pricing" onClick={() => setMenuOpen(false)}>Market Prices</Link>
        <Link to="/get-started" onClick={() => setMenuOpen(false)}>Get Started</Link>
        <Link to="/seller/register" onClick={() => setMenuOpen(false)}>Become a Seller</Link>
        <Link to="/rider/register" onClick={() => setMenuOpen(false)}>Deliver with Us</Link>
        <div className="mobile-divider"></div>
        {user ? (
          <>
            <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;