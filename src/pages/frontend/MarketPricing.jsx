import { useState, useEffect } from 'react';
import './MarketPricing.css';

const MarketPricing = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'cereals', name: 'Cereals & Grains' },
    { id: 'livestock', name: 'Livestock' },
    { id: 'poultry', name: 'Poultry' }
  ];

  const samplePricingData = [
    { id: 1, name: 'Tomatoes', category: 'vegetables', unit: 'per kg', minPrice: 8, maxPrice: 20, avgPrice: 13, sellers: 12, trend: 'up' },
    { id: 2, name: 'Onions', category: 'vegetables', unit: 'per kg', minPrice: 5, maxPrice: 12, avgPrice: 8, sellers: 15, trend: 'stable' },
    { id: 3, name: 'Peppers (Green)', category: 'vegetables', unit: 'per kg', minPrice: 6, maxPrice: 15, avgPrice: 10, sellers: 18, trend: 'down' },
    { id: 4, name: 'Cassava', category: 'vegetables', unit: 'per kg', minPrice: 3, maxPrice: 8, avgPrice: 5, sellers: 22, trend: 'stable' },
    { id: 5, name: 'Mangoes', category: 'fruits', unit: 'per kg', minPrice: 10, maxPrice: 30, avgPrice: 18, sellers: 8, trend: 'up' },
    { id: 6, name: 'Pineapple', category: 'fruits', unit: 'per piece', minPrice: 8, maxPrice: 20, avgPrice: 12, sellers: 14, trend: 'down' },
    { id: 7, name: 'Banana', category: 'fruits', unit: 'per bunch', minPrice: 5, maxPrice: 15, avgPrice: 10, sellers: 20, trend: 'stable' },
    { id: 8, name: 'Orange', category: 'fruits', unit: 'per kg', minPrice: 8, maxPrice: 18, avgPrice: 12, sellers: 16, trend: 'up' },
    { id: 9, name: 'Local Rice', category: 'cereals', unit: 'per kg', minPrice: 15, maxPrice: 25, avgPrice: 19, sellers: 10, trend: 'stable' },
    { id: 10, name: 'Maize', category: 'cereals', unit: 'per kg', minPrice: 5, maxPrice: 12, avgPrice: 8, sellers: 25, trend: 'down' },
    { id: 11, name: 'Groundnuts', category: 'cereals', unit: 'per kg', minPrice: 20, maxPrice: 40, avgPrice: 28, sellers: 12, trend: 'up' },
    { id: 12, name: 'Cowpeas', category: 'cereals', unit: 'per kg', minPrice: 15, maxPrice: 30, avgPrice: 22, sellers: 18, trend: 'stable' }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const filtered = selectedCategory === 'all' 
        ? samplePricingData 
        : samplePricingData.filter(p => p.category === selectedCategory);
      setPrices(filtered);
      setLoading(false);
    }, 500);
  }, [selectedCategory]);

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendClass = (trend) => {
    switch(trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'trend-stable';
    }
  };

  return (
    <div className="market-pricing-page">
      <div className="pricing-header">
        <h1>Market Prices</h1>
        <p>Real-time prices from verified sellers across Ghana</p>
      </div>

      <div className="pricing-container">
        <aside className="pricing-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="market-stats">
            <h3>Market Overview</h3>
            <div className="stat-item">
              <span>Total Products</span>
              <strong>{prices.length}</strong>
            </div>
            <div className="stat-item">
              <span>Active Sellers</span>
              <strong>150+</strong>
            </div>
            <div className="stat-item">
              <span>Last Updated</span>
              <strong>Just now</strong>
            </div>
          </div>
        </aside>

        <main className="pricing-main">
          <div className="pricing-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Avg Price</th>
                  <th>Sellers</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">Loading prices...</td>
                  </tr>
                ) : (
                  prices.map(product => (
                    <tr key={product.id}>
                      <td className="product-name">{product.name}</td>
                      <td className="category">{product.category}</td>
                      <td className="price">GH₵ {product.minPrice}</td>
                      <td className="price">GH₵ {product.maxPrice}</td>
                      <td className="price avg">GH₵ {product.avgPrice}</td>
                      <td className="sellers">{product.sellers}</td>
                      <td className={`trend ${getTrendClass(product.trend)}`}>
                        {getTrendIcon(product.trend)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="price-legend">
            <div className="legend-item">
              <span className="legend-dot up"></span>
              <span>Price Increasing</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot down"></span>
              <span>Price Decreasing</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot stable"></span>
              <span>Price Stable</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketPricing;