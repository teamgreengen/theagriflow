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
  }
};

export default SuperAdminService;