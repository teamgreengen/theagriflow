import supabase from '../config/supabase';

export const DeliveryService = {
  async createFromOrder(orderId, orderData) {
    const { data, error } = await supabase
      .from('deliveries')
      .insert({
        orderId,
        sellerId: orderData.sellerId,
        userId: orderData.userId,
        pickupAddress: orderData.sellerAddress || 'Seller Location',
        deliveryAddress: orderData.delivery?.address || 'Customer Address',
        deliveryPhone: orderData.delivery?.phone || '',
        fee: orderData.deliveryFee || 15,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByOrder(orderId) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, rider:users(name, phone, email)')
      .eq('orderId', orderId)
      .single();
    if (error) return null;
    return data;
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, order:orders(*), rider:users(name, phone)')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async assignRider(deliveryId, riderId) {
    const { error } = await supabase
      .from('deliveries')
      .update({ riderId, status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', deliveryId);
    if (error) throw error;
    return true;
  },

  async updateStatus(deliveryId, status) {
    const { error } = await supabase
      .from('deliveries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', deliveryId);
    if (error) throw error;
    return true;
  },

  async getAvailable() {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, order:orders(*), user:users(name, phone), seller:users(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async getByRider(riderId) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, order:orders(*), user:users(name, phone)')
      .eq('riderId', riderId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async getDeliveryTimeline(deliveryId) {
    const delivery = await this.getByOrder(deliveryId);
    if (!delivery) return [];

    const timeline = [];
    const statusSteps = [
      { status: 'pending', label: 'Order Placed', icon: '📦' },
      { status: 'accepted', label: 'Rider Assigned', icon: '👤' },
      { status: 'picked_up', label: 'Picked Up', icon: '📍' },
      { status: 'in_transit', label: 'In Transit', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const currentIndex = statusSteps.findIndex(s => s.status === delivery.status);
    
    statusSteps.forEach((step, index) => {
      timeline.push({
        ...step,
        completed: index <= currentIndex,
        date: index <= currentIndex ? delivery.updated_at : null
      });
    });

    return timeline;
  }
};

export default DeliveryService;