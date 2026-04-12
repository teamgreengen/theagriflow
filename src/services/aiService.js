export const AIService = {
  getPricePrediction(product) {
    const basePrice = product.price;
    const factors = Math.random();
    
    if (factors > 0.7) {
      return {
        trend: 'up',
        message: 'Price expected to increase',
        percentage: Math.floor(Math.random() * 15) + 5,
        recommendation: 'Buy now to save'
      };
    } else if (factors < 0.3) {
      return {
        trend: 'down',
        message: 'Price may decrease',
        percentage: Math.floor(Math.random() * 10) + 2,
        recommendation: 'Wait for better deal'
      };
    }
    return {
      trend: 'stable',
      message: 'Price stable',
      percentage: 0,
      recommendation: 'Good time to buy'
    };
  },

  getProductRecommendations(products, userPreferences = {}) {
    const scored = products.map(p => {
      let score = 0;
      
      if (p.rating >= 4.5) score += 30;
      if (p.reviews > 50) score += 20;
      if (p.discount > 30) score += 25;
      if (p.badges?.includes('Best Seller')) score += 15;
      if (p.badges?.includes('Organic')) score += 10;
      
      return { ...p, aiScore: score };
    });
    
    return scored.sort((a, b) => b.aiScore - a.aiScore).slice(0, 6);
  },

  analyzeMarketTrend(category) {
    const trends = ['rising', 'stable', 'falling'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      category,
      trend,
      confidence: Math.floor(Math.random() * 30) + 70,
      data: {
        avgPrice: Math.floor(Math.random() * 50) + 20,
        volume: Math.floor(Math.random() * 1000) + 100,
        demand: Math.floor(Math.random() * 40) + 60
      }
    };
  },

  generateInsights(products) {
    const insights = [];
    
    const highRated = products.filter(p => p.rating >= 4.7).length;
    if (highRated > 0) {
      insights.push({
        type: 'positive',
        icon: '⭐',
        message: `${highRated} highly-rated products available`
      });
    }
    
    const onSale = products.filter(p => p.originalPrice && p.price < p.originalPrice).length;
    if (onSale > 0) {
      insights.push({
        type: 'deal',
        icon: '🏷️',
        message: `${onSale} products on sale now`
      });
    }
    
    const categories = [...new Set(products.map(p => p.category))];
    if (categories.length > 5) {
      insights.push({
        type: 'variety',
        icon: '🌾',
        message: `${categories.length} product categories available`
      });
    }
    
    return insights;
  },

  getDeliveryEstimate(pincode) {
    const estimates = ['Same day', 'Next day', '2-3 days', '3-5 days'];
    return estimates[Math.floor(Math.random() * estimates.length)];
  },

  suggestComplementaryProducts(product, allProducts) {
    const category = product.category;
    return allProducts
      .filter(p => p.category === category && p.id !== product.id)
      .slice(0, 4);
  }
};

export default AIService;