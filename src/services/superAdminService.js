import supabase from '../config/supabase';

export const SuperAdminService = {
  async getStats() {
    const { data: users } = await supabase.from('users').select('id, role, created_at');
    const { data: sellers } = await supabase.from('sellers').select('*');
    const { data: riders } = await supabase.from('riders').select('*');
    const { data: orders } = await supabase.from('orders').select('*');
    const { data: products } = await supabase.from('products').select('*');
    
    const admins = users?.filter(u => u.role === 'admin' || u.role === 'super_admin') || [];
    const sellerUsers = users?.filter(u => u.role === 'seller') || [];
    const riderUsers = users?.filter(u => u.role === 'rider') || [];
    const buyerUsers = users?.filter(u => u.role === 'buyer') || [];
    
    const totalRevenue = orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
    
    return {
      totalUsers: users?.length || 0,
      totalSellers: sellerUsers.length,
      totalAdmins: admins.length,
      totalRiders: riderUsers.length,
      totalBuyers: buyerUsers.length,
      totalOrders: orders?.length || 0,
      pendingOrders,
      completedOrders,
      totalProducts: products?.length || 0,
      activeProducts: products?.filter(p => p.active).length || 0,
      platformRevenue: totalRevenue,
      commissionRate: 10,
      verifiedSellers: sellers?.filter(s => s.verified).length || 0,
      pendingSellers: sellers?.filter(s => s.status === 'pending').length || 0
    };
  },

  async getRecentActivity(limit = 10) {
    const { data: logs } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return logs || [];
  },

  async logAction(userId, action, entityType, entityId, details = {}) {
    const { error } = await supabase.from('system_logs').insert({
      userId,
      action,
      entityType,
      entityId,
      details,
      created_at: new Date().toISOString()
    });
    return !error;
  },

  async getAdmins() {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'super_admin'])
      .order('created_at', { ascending: false });
    return users || [];
  },

  async createAdmin(email, password, name, role = 'admin') {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });
    if (error) throw error;

    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString()
    });
    if (insertError) throw insertError;

    return data.user;
  },

  async updateAdminRole(userId, role) {
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    return true;
  },

  async deleteAdmin(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    
    await supabase.auth.admin.deleteUser(userId);
    return true;
  },

  async getAllUsers(filters = {}) {
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    const { data } = await query;
    return data || [];
  },

  async updateUserStatus(userId, status) {
    const { error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    return true;
  },

  async getSettings(category = null) {
    let query = supabase.from('settings').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data } = await query;
    
    const settings = {};
    data?.forEach(s => {
      settings[s.id] = s.value;
    });
    return settings;
  },

  async saveSetting(id, value, category = 'general') {
    const { error } = await supabase.from('settings').upsert({
      id,
      value,
      category,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) throw error;
    return true;
  },

  async saveMultipleSettings(settingsArray) {
    const updates = settingsArray.map(s => ({
      id: s.id,
      value: s.value,
      category: s.category || 'general',
      updated_at: new Date().toISOString()
    }));
    
    const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'id' });
    if (error) throw error;
    return true;
  },

  async getPlatformStats(days = 30) {
    const { data } = await supabase
      .from('platform_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);
    return data || [];
  },

  async createBanner(bannerData) {
    const { data, error } = await supabase
      .from('banners')
      .insert({ ...bannerData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBanner(bannerId, data) {
    const { error } = await supabase
      .from('banners')
      .update(data)
      .eq('id', bannerId);
    if (error) throw error;
    return true;
  },

  async deleteBanner(bannerId) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', bannerId);
    if (error) throw error;
    return true;
  },

  async getCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('orderIndex');
    return data || [];
  },

  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...categoryData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(categoryId, data) {
    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', categoryId);
    if (error) throw error;
    return true;
  },

  async deleteCategory(categoryId) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    if (error) throw error;
    return true;
  },

  async reorderCategories(orderedIds) {
    const updates = orderedIds.map((id, index) => ({
      id,
      orderIndex: index
    }));
    
    const { error } = await supabase.from('categories').upsert(updates, { onConflict: 'id' });
    if (error) throw error;
    return true;
  },

  async getAllSellers(filters = {}) {
    let query = supabase
      .from('sellers')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }
    
    const { data } = await query;
    return data || [];
  },

  async verifySeller(sellerId, verified) {
    const { error } = await supabase
      .from('sellers')
      .update({ verified, updated_at: new Date().toISOString() })
      .eq('id', sellerId);
    if (error) throw error;
    return true;
  },

  async getSellerStats(sellerId) {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('sellerId', sellerId);
    
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('sellerId', sellerId);

    return {
      totalOrders: orders?.length || 0,
      completedOrders: orders?.filter(o => o.status === 'delivered').length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0,
      totalProducts: products?.length || 0,
      activeProducts: products?.filter(p => p.active).length || 0
    };
  },

  async getAllOrders(filters = {}) {
    let query = supabase
      .from('orders')
      .select('*, user:users(*), seller:users(*), rider:users(*)')
      .order('created_at', { ascending: false });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.paymentStatus) {
      query = query.eq('paymentStatus', filters.paymentStatus);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    
    const { data } = await query;
    return data || [];
  },

  async updateOrderStatus(orderId, status) {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) throw error;
    return true;
  },

  async getTopProducts(limit = 10) {
    const { data: orders } = await supabase.from('orders').select('items');
    const productSales = {};
    
    orders?.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (productSales[item.productId]) {
            productSales[item.productId].quantity += item.quantity || 1;
            productSales[item.productId].revenue += (item.price * (item.quantity || 1));
          } else {
            productSales[item.productId] = {
              productId: item.productId,
              name: item.name,
              quantity: item.quantity || 1,
              revenue: item.price * (item.quantity || 1)
            };
          }
        });
      }
    });

    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, images, sellerId')
      .in('id', Object.keys(productSales));

    return Object.values(productSales)
      .map(sale => ({
        ...sale,
        product: products?.find(p => p.id === sale.productId)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },

  async getSellerRankings(limit = 10) {
    const { data: sellers } = await supabase
      .from('sellers')
      .select('*, user:users(name, email)')
      .order('totalSales', { ascending: false })
      .limit(limit);

    return sellers || [];
  },

  async getAnalytics(days = 30) {
    const { data: orders } = await supabase
      .from('orders')
      .select('created_at, total, status');

    const { data: users } = await supabase
      .from('users')
      .select('created_at, role');

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyRevenue = {};
    const dailyOrders = {};
    const dailyUsers = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyRevenue[dateKey] = 0;
      dailyOrders[dateKey] = 0;
      dailyUsers[dateKey] = 0;
    }

    orders?.forEach(order => {
      const dateKey = new Date(order.created_at).toISOString().split('T')[0];
      if (dailyRevenue[dateKey] !== undefined) {
        dailyRevenue[dateKey] += parseFloat(order.total) || 0;
        dailyOrders[dateKey] += 1;
      }
    });

    users?.forEach(user => {
      const dateKey = new Date(user.created_at).toISOString().split('T')[0];
      if (dailyUsers[dateKey] !== undefined) {
        dailyUsers[dateKey] += 1;
      }
    });

    const revenueData = Object.entries(dailyRevenue).map(([date, value]) => ({ date, value }));
    const ordersData = Object.entries(dailyOrders).map(([date, value]) => ({ date, value }));
    const usersData = Object.entries(dailyUsers).map(([date, value]) => ({ date, value }));

    const totalRevenue = Object.values(dailyRevenue).reduce((a, b) => a + b, 0);
    const totalOrders = Object.values(dailyOrders).reduce((a, b) => a + b, 0);
    const newUsers = users?.filter(u => new Date(u.created_at) >= startDate).length || 0;

    return {
      revenueData,
      ordersData,
      usersData,
      totalRevenue,
      totalOrders,
      newUsers,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  },

  async exportOrders(filters = {}) {
    const orders = await this.getAllOrders(filters);
    return orders.map(order => ({
      'Order ID': order.orderNumber || order.id,
      'Customer': order.user?.name || order.user?.email || 'N/A',
      'Seller': order.seller?.name || 'N/A',
      'Total': order.total,
      'Status': order.status,
      'Payment': order.paymentStatus,
      'Date': new Date(order.created_at).toLocaleDateString()
    }));
  },

  async exportUsers(filters = {}) {
    const users = await this.getAllUsers(filters);
    return users.map(user => ({
      'Name': user.name || 'N/A',
      'Email': user.email,
      'Role': user.role,
      'Status': user.status || 'active',
      'Joined': new Date(user.created_at).toLocaleDateString()
    }));
  },

  async getWithdrawals(filters = {}) {
    let query = supabase
      .from('earnings')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data } = await query;
    return data || [];
  },

  async processWithdrawal(earningId, status) {
    const { error } = await supabase
      .from('earnings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', earningId);
    if (error) throw error;
    return true;
  },

  async getNotifications(userId = null) {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userId) {
      query = query.eq('userId', userId);
    }

    const { data } = await query;
    return data || [];
  },

  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ ...notificationData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return true;
  },

  async broadcastNotification(title, message, targetRoles = []) {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .in('role', targetRoles);

    const notifications = users?.map(user => ({
      userId: user.id,
      title,
      message,
      type: 'announcement',
      read: false,
      created_at: new Date().toISOString()
    })) || [];

    if (notifications.length > 0) {
      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;
    }

    return notifications.length;
  },

  async getLoginHistory(userId, limit = 20) {
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .eq('userId', userId)
      .eq('action', 'login')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },

  async getAllLoginHistory(limit = 100) {
    const { data } = await supabase
      .from('system_logs')
      .select('*, user:users(name, email)')
      .eq('action', 'login')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }
};

export default SuperAdminService;