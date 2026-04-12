import supabase from '../config/supabase';

export const AdminService = {
  async getStats() {
    const { data: users } = await supabase.from('users').select('id, role, created_at');
    const { data: sellers } = await supabase.from('sellers').select('*');
    const { data: orders } = await supabase.from('orders').select('*');
    
    const sellerUsers = users?.filter(u => u.role === 'seller') || [];
    const buyerUsers = users?.filter(u => u.role === 'buyer') || [];
    
    const totalRevenue = orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    
    return {
      totalSellers: sellerUsers.length,
      totalBuyers: buyerUsers.length,
      totalOrders: orders?.length || 0,
      pendingOrders,
      totalRevenue,
      verifiedSellers: sellers?.filter(s => s.verified).length || 0,
      pendingSellers: sellers?.filter(s => s.status === 'pending').length || 0
    };
  },

  async getAllSellers(filters = {}) {
    let query = supabase
      .from('sellers')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.verified !== undefined) query = query.eq('verified', filters.verified);
    
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

  async updateSellerStatus(sellerId, status) {
    const { error } = await supabase
      .from('sellers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sellerId);
    if (error) throw error;
    return true;
  },

  async getAllOrders(filters = {}) {
    let query = supabase
      .from('orders')
      .select('*, user:users(name, email), seller:users(name)')
      .order('created_at', { ascending: false });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.paymentStatus) query = query.eq('paymentStatus', filters.paymentStatus);
    
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

  async getBanners() {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('orderIndex');
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
  }
};

export default AdminService;