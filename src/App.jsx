import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/SupabaseAuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ThemeProvider from './context/ThemeContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SellerLogin from './pages/seller/Login';
import SellerRegister from './pages/seller/Register';
import AdminLogin from './pages/admin/Login';
import RiderLogin from './pages/rider/Login';
import RiderRegister from './pages/rider/Register';

import Home from './pages/frontend/Home';
import Products from './pages/frontend/Products';
import ProductDetail from './pages/frontend/ProductDetail';
import Cart from './pages/frontend/Cart';
import Checkout from './pages/frontend/Checkout';
import MarketPricing from './pages/frontend/MarketPricing';
import OrderTracking from './pages/frontend/OrderTracking';
import MyOrders from './pages/frontend/MyOrders';
import Wishlist from './pages/frontend/Wishlist';
import Profile from './pages/frontend/Profile';
import Chat from './pages/frontend/Chat';

import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import SellerEarnings from './pages/seller/Earnings';

import AdminDashboard from './pages/admin/Dashboard';
import AdminSellers from './pages/admin/Sellers';
import AdminOrders from './pages/admin/Orders';
import AdminCategories from './pages/admin/Categories';
import AdminBanners from './pages/admin/Banners';

import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminAdmins from './pages/superadmin/Admins';
import SuperAdminUsers from './pages/superadmin/Users';
import SuperAdminSettings from './pages/superadmin/Settings';
import SuperAdminAnalytics from './pages/superadmin/Analytics';
import SuperAdminOrders from './pages/superadmin/Orders';
import SuperAdminSellers from './pages/superadmin/Sellers';
import SuperAdminBanners from './pages/superadmin/Banners';
import SuperAdminCategories from './pages/superadmin/Categories';
import SuperAdminFinancials from './pages/superadmin/Financials';
import SuperAdminNotifications from './pages/superadmin/Notifications';
import SuperAdminActivity from './pages/superadmin/Activity';

import RiderDashboard from './pages/rider/Dashboard';
import RiderDeliveries from './pages/rider/Deliveries';
import RiderEarnings from './pages/rider/Earnings';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

const SellerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['seller']}>
    {children}
  </ProtectedRoute>
);

const RiderRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['rider']}>
    {children}
  </ProtectedRoute>
);

const SuperAdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin']}>
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market" element={<MarketPricing />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/market-pricing" element={<MarketPricing />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/seller/login" element={<SellerLogin />} />
                <Route path="/seller/register" element={<SellerRegister />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/rider/login" element={<RiderLogin />} />
                <Route path="/rider/register" element={<RiderRegister />} />

                {/* Demo Portals - No Auth Required */}
                <Route path="/seller/*" element={
                    <SellerLayout>
                      <Routes>
                        <Route index element={<SellerDashboard />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="earnings" element={<SellerEarnings />} />
                      </Routes>
                    </SellerLayout>
                } />

                <Route path="/admin/*" element={
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="sellers" element={<AdminSellers />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="banners" element={<AdminBanners />} />
                      </Routes>
                    </AdminLayout>
                } />

                <Route path="/superadmin/*" element={
                    <SuperAdminLayout>
                      <Routes>
                        <Route index element={<SuperAdminDashboard />} />
                        <Route path="admins" element={<SuperAdminAdmins />} />
                        <Route path="users" element={<SuperAdminUsers />} />
                        <Route path="sellers" element={<SuperAdminSellers />} />
                        <Route path="orders" element={<SuperAdminOrders />} />
                        <Route path="analytics" element={<SuperAdminAnalytics />} />
                        <Route path="banners" element={<SuperAdminBanners />} />
                        <Route path="categories" element={<SuperAdminCategories />} />
                        <Route path=" financials" element={<SuperAdminFinancials />} />
                        <Route path="financials" element={<SuperAdminFinancials />} />
                        <Route path="notifications" element={<SuperAdminNotifications />} />
                        <Route path="activity" element={<SuperAdminActivity />} />
                        <Route path="settings" element={<SuperAdminSettings />} />
                      </Routes>
                    </SuperAdminLayout>
                } />

                <Route path="/rider/*" element={
                    <RiderLayout>
                      <Routes>
                        <Route index element={<RiderDashboard />} />
                        <Route path="deliveries" element={<RiderDeliveries />} />
                        <Route path="earnings" element={<RiderEarnings />} />
                      </Routes>
                    </RiderLayout>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const SellerLayout = ({ children }) => (
  <div className="seller-layout">
    <aside className="seller-sidebar">
      <h2>Seller Panel</h2>
      <nav>
        <a href="/seller">Dashboard</a>
        <a href="/seller/products">Products</a>
        <a href="/seller/orders">Orders</a>
        <a href="/seller/earnings">Earnings</a>
      </nav>
    </aside>
    <div className="seller-content">{children}</div>
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <aside className="admin-sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <a href="/admin">Dashboard</a>
        <a href="/admin/sellers">Sellers</a>
        <a href="/admin/orders">Orders</a>
        <a href="/admin/categories">Categories</a>
        <a href="/admin/banners">Banners</a>
      </nav>
    </aside>
    <div className="admin-content">{children}</div>
  </div>
);

const SuperAdminLayout = ({ children }) => (
  <div className="superadmin-layout">
    <aside className="superadmin-sidebar">
      <h2>Super Admin</h2>
      <nav>
        <a href="/superadmin">📊 Dashboard</a>
        <a href="/superadmin/analytics">📈 Analytics</a>
        <a href="/superadmin/orders">📦 Orders</a>
        <a href="/superadmin/users">👥 Users</a>
        <a href="/superadmin/sellers">🏪 Sellers</a>
        <a href="/superadmin/banners">🎨 Banners</a>
        <a href="/superadmin/categories">📁 Categories</a>
        <a href="/superadmin/financials">💰 Financials</a>
        <a href="/superadmin/notifications">🔔 Notifications</a>
        <a href="/superadmin/activity">📝 Activity Logs</a>
        <a href="/superadmin/admins">⚙️ Admins</a>
        <a href="/superadmin/settings">🔧 Settings</a>
      </nav>
    </aside>
    <div className="superadmin-content">{children}</div>
  </div>
);

const RiderLayout = ({ children }) => (
  <div className="rider-layout">
    <aside className="rider-sidebar">
      <h2>Rider Panel</h2>
      <nav>
        <a href="/rider">Dashboard</a>
        <a href="/rider/deliveries">Deliveries</a>
        <a href="/rider/earnings">Earnings</a>
      </nav>
    </aside>
    <div className="rider-content">{children}</div>
  </div>
);

export default App;