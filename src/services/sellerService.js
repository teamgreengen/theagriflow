import supabase from '../config/supabase';

export const SellerService = {
  async getStats(sellerId) {
    const { data: orders } = await supabase.from('orders').select('*').eq('sellerId', sellerId);
    const { data: products } = await supabase.from('products').select('id').eq('sellerId', sellerId);
    
    const completedOrders = orders?.filter(o => o.status === 'delivered') || [];
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
    
    return {
      totalSales: totalRevenue,
      totalOrders: orders?.length || 0,
      pendingOrders: pendingOrders.length,
      totalProducts: products?.length || 0
    };
  },

  async getRecentOrders(sellerId, limit = 5) {
    const { data } = await supabase
      .from('orders')
      .select('*, user:users(name, email)')
      .eq('sellerId', sellerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },

  async getAllOrders(sellerId, filters = {}) {
    let query = supabase
      .from('orders')
      .select('*, user:users(name, email)')
      .eq('sellerId', sellerId)
      .order('created_at', { ascending: false });
    
    if (filters.status) query = query.eq('status', filters.status);
    
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

  async getEarnings(sellerId) {
    const { data: orders } = await supabase.from('orders').select('*').eq('sellerId', sellerId);
    const { data: withdrawals } = await supabase.from('withdrawals').select('*').eq('sellerId', sellerId);
    
    const completedOrders = orders?.filter(o => o.status === 'delivered') || [];
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const pendingAmount = orders?.filter(o => o.status === 'pending' || o.status === 'processing').reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0;
    const totalWithdrawn = withdrawals?.filter(w => w.status === 'completed').reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) || 0;
    
    return {
      available: totalEarnings - totalWithdrawn,
      pending: pendingAmount,
      total: totalEarnings
    };
  },

  async getTransactions(sellerId, limit = 10) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .eq('sellerId', sellerId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const transactions = (orders || []).map(o => ({
      id: o.id,
      type: 'sale',
      amount: parseFloat(o.total) || 0,
      date: o.created_at,
      status: 'completed'
    }));
    
    return transactions;
  },

  async requestWithdrawal(sellerId, amount) {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        sellerId,
        amount,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default SellerService;