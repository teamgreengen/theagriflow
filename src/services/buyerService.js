import supabase from '../config/supabase';

export const BuyerService = {
  async getOrders(userId) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getOrderById(orderId, userId) {
    const { data } = await supabase
      .from('orders')
      .select('*, seller:users(name)')
      .eq('id', orderId)
      .eq('userId', userId)
      .single();
    return data;
  },

  async updateProfile(userId, profileData) {
    const { error } = await supabase
      .from('users')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    return true;
  },

  async getAddresses(userId) {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('userId', userId)
      .order('isDefault', { ascending: false });
    return data || [];
  },

  async addAddress(userId, addressData) {
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...addressData, userId, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAddress(addressId, addressData) {
    const { error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', addressId);
    if (error) throw error;
    return true;
  },

  async deleteAddress(addressId) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    if (error) throw error;
    return true;
  },

  async getWishlist(userId) {
    const { data } = await supabase
      .from('wishlist')
      .select('*, product:products(*)')
      .eq('userId', userId);
    return data || [];
  },

  async addToWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist')
      .insert({ userId, productId, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeFromWishlist(userId, productId) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('userId', userId)
      .eq('productId', productId);
    if (error) throw error;
    return true;
  },

  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert({ ...orderData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getReviews(userId) {
    const { data } = await supabase
      .from('reviews')
      .select('*, product:products(name, image)')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async addReview(productId, userId, rating, comment) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        productId,
        userId,
        rating,
        comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default BuyerService;