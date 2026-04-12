import supabase from '../config/supabase';

export const RiderService = {
  async getStats(riderId) {
    const { data: deliveries } = await supabase.from('deliveries').select('*').eq('riderId', riderId);
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries?.filter(d => d.created_at?.startsWith(today)).length || 0;
    const completedDeliveries = deliveries?.filter(d => d.status === 'completed').length || 0;
    const totalEarnings = deliveries?.filter(d => d.status === 'completed').reduce((sum, d) => sum + (parseFloat(d.fee) || 0), 0) || 0;
    
    return {
      todayDeliveries,
      totalEarnings,
      completedDeliveries,
      rating: 4.8
    };
  },

  async getAvailableDeliveries() {
    const { data } = await supabase
      .from('deliveries')
      .select('*, order:orders(*), seller:users(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async acceptDelivery(deliveryId, riderId) {
    const { error } = await supabase
      .from('deliveries')
      .update({ riderId, status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', deliveryId);
    if (error) throw error;
    return true;
  },

  async getMyDeliveries(riderId, filter = '') {
    let query = supabase
      .from('deliveries')
      .select('*, order:orders(*), seller:users(name)')
      .eq('riderId', riderId)
      .order('created_at', { ascending: false });

    if (filter === 'active') query = query.eq('status', 'accepted');
    if (filter === 'completed') query = query.eq('status', 'completed');

    const { data } = await query;
    return data || [];
  },

  async updateDeliveryStatus(deliveryId, status) {
    const { error } = await supabase
      .from('deliveries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', deliveryId);
    if (error) throw error;
    return true;
  },

  async getEarnings(riderId) {
    const { data: deliveries } = await supabase.from('deliveries').select('*').eq('riderId', riderId);
    const { data: withdrawals } = await supabase.from('rider_withdrawals').select('*').eq('riderId', riderId);
    
    const completed = deliveries?.filter(d => d.status === 'completed') || [];
    const totalEarnings = completed.reduce((sum, d) => sum + (parseFloat(d.fee) || 0), 0);
    const pendingEarnings = deliveries?.filter(d => d.status === 'accepted').reduce((sum, d) => sum + (parseFloat(d.fee) || 0), 0) || 0;
    const totalWithdrawn = withdrawals?.filter(w => w.status === 'completed').reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) || 0;
    
    return {
      available: totalEarnings - totalWithdrawn,
      pending: pendingEarnings,
      total: totalEarnings
    };
  },

  async getTransactions(riderId, limit = 10) {
    const { data: deliveries } = await supabase
      .from('deliveries')
      .select('id, fee, status, created_at')
      .eq('riderId', riderId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    const transactions = (deliveries || []).map(d => ({
      id: d.id,
      type: 'delivery',
      amount: parseFloat(d.fee) || 0,
      date: d.created_at,
      status: 'completed'
    }));

    return transactions;
  },

  async requestWithdrawal(riderId, amount) {
    const { data, error } = await supabase
      .from('rider_withdrawals')
      .insert({
        riderId,
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

export default RiderService;