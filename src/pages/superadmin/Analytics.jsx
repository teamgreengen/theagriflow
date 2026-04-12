import { useState, useEffect } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import SuperAdminService from '../../services/superAdminService';
import './SuperAdmin.css';

const SuperAdminAnalytics = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [sellerRankings, setSellerRankings] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, productsData, sellersData] = await Promise.all([
        SuperAdminService.getAnalytics(period),
        SuperAdminService.getTopProducts(10),
        SuperAdminService.getSellerRankings(10)
      ]);
      setAnalytics(analyticsData);
      setTopProducts(productsData);
      setSellerRankings(sellersData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const exportToCSV = async () => {
    const data = await SuperAdminService.exportOrders();
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...(analytics?.revenueData?.map(d => d.value) || [1]));
  const maxOrders = Math.max(...(analytics?.ordersData?.map(d => d.value) || [1]));

  return (
    <div className="analytics-page super-admin-section">
      <div className="page-header">
        <div>
          <h1>Platform Analytics</h1>
          <p>Performance metrics and insights</p>
        </div>
        <div className="header-actions">
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="period-select">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="export-btn" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <span className="summary-label">Total Revenue</span>
          <span className="summary-value">{formatCurrency(analytics?.totalRevenue || 0)}</span>
          <span className="summary-change positive">+12% from last period</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Orders</span>
          <span className="summary-value">{analytics?.totalOrders || 0}</span>
          <span className="summary-change positive">+8% from last period</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">New Users</span>
          <span className="summary-value">{analytics?.newUsers || 0}</span>
          <span className="summary-change positive">+15% from last period</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Avg Order Value</span>
          <span className="summary-value">{formatCurrency(analytics?.averageOrderValue || 0)}</span>
          <span className="summary-change">GH¢/order</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <div className="bar-chart">
            {analytics?.revenueData?.map((d, i) => (
              <div key={i} className="bar-container">
                <div 
                  className="bar revenue-bar" 
                  style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                  title={`${d.date}: ${formatCurrency(d.value)}`}
                />
                <span className="bar-label">{new Date(d.date).getDate()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Orders Trend</h3>
          <div className="bar-chart">
            {analytics?.ordersData?.map((d, i) => (
              <div key={i} className="bar-container">
                <div 
                  className="bar orders-bar" 
                  style={{ height: `${(d.value / maxOrders) * 100}%` }}
                  title={`${d.date}: ${d.value} orders`}
                />
                <span className="bar-label">{new Date(d.date).getDate()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tables-row">
        <div className="table-card">
          <h3>Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <table className="rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.name || item.product?.name || 'Unknown'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No sales data yet</p>
          )}
        </div>

        <div className="table-card">
          <h3>Top Sellers</h3>
          {sellerRankings.length > 0 ? (
            <table className="rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Seller</th>
                  <th>Store</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {sellerRankings.map((seller, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{seller.user?.name || 'Unknown'}</td>
                    <td>{seller.storeName || 'N/A'}</td>
                    <td>{seller.totalSales || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No sellers yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;