import supabase, { TABLES, ROLES, ORDER_STATUS, PAYMENT_STATUS } from '../config/supabase';

export const UserService = {
  async create(userId, userData) {
    const { error } = await supabase
      .from(TABLES.USERS)
      .insert({ id: userId, ...userData, created_at: new Date().toISOString() });
    if (error) throw error;
  },

  async get(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  },

  async update(userId, data) {
    const { error } = await supabase
      .from(TABLES.USERS)
      .update(data)
      .eq('id', userId);
    if (error) throw error;
  },

  async getSellers() {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('role', ROLES.SELLER);
    if (error) throw error;
    return data || [];
  },

  async getAdmins() {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .in('role', [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (error) throw error;
    return data || [];
  }
};

export const ProductService = {
  async create(productData) {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .insert({ ...productData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async get(productId) {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .eq('id', productId)
      .single();
    if (error) return null;
    return data;
  },

  async update(productId, data) {
    const { error } = await supabase
      .from(TABLES.PRODUCTS)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', productId);
    if (error) throw error;
  },

  async delete(productId) {
    const { error } = await supabase
      .from(TABLES.PRODUCTS)
      .delete()
      .eq('id', productId);
    if (error) throw error;
  },

  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getByCategory(categoryId) {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .eq('categoryId', categoryId);
    if (error) throw error;
    return data || [];
  },

  async getBySeller(sellerId) {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .eq('sellerId', sellerId);
    if (error) throw error;
    return data || [];
  },

  async search(searchTerm) {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(100);
    if (error) throw error;
    return data || [];
  }
};

export const OrderService = {
  async create(orderData) {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .insert({ ...orderData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async get(orderId) {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .eq('id', orderId)
      .single();
    if (error) return null;
    return data;
  },

  async update(orderId, data) {
    const { error } = await supabase
      .from(TABLES.ORDERS)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) throw error;
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getBySeller(sellerId) {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .eq('sellerId', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAll() {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateStatus(orderId, status) {
    await this.update(orderId, { status });
  },

  async assignRider(orderId, riderId) {
    await this.update(orderId, { riderId, status: ORDER_STATUS.SHIPPED });
  }
};

export const CategoryService = {
  async create(categoryData) {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .insert({ ...categoryData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async getAll() {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async update(categoryId, data) {
    const { error } = await supabase
      .from(TABLES.CATEGORIES)
      .update(data)
      .eq('id', categoryId);
    if (error) throw error;
  },

  async delete(categoryId) {
    const { error } = await supabase
      .from(TABLES.CATEGORIES)
      .delete()
      .eq('id', categoryId);
    if (error) throw error;
  }
};

export const BannerService = {
  async create(bannerData) {
    const { data, error } = await supabase
      .from(TABLES.BANNERS)
      .insert({ ...bannerData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async getAll() {
    const { data, error } = await supabase
      .from(TABLES.BANNERS)
      .select('*')
      .order('order');
    if (error) throw error;
    return data || [];
  },

  async getActive() {
    const { data, error } = await supabase
      .from(TABLES.BANNERS)
      .select('*')
      .eq('active', true)
      .order('order');
    if (error) throw error;
    return data || [];
  },

  async update(bannerId, data) {
    const { error } = await supabase
      .from(TABLES.BANNERS)
      .update(data)
      .eq('id', bannerId);
    if (error) throw error;
  },

  async delete(bannerId) {
    const { error } = await supabase
      .from(TABLES.BANNERS)
      .delete()
      .eq('id', bannerId);
    if (error) throw error;
  }
};

export const ReviewService = {
  async create(reviewData) {
    const { data, error } = await supabase
      .from(TABLES.REVIEWS)
      .insert({ ...reviewData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async getByProduct(productId) {
    const { data, error } = await supabase
      .from(TABLES.REVIEWS)
      .select('*')
      .eq('productId', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAverageRating(productId) {
    const reviews = await this.getByProduct(productId);
    if (reviews.length === 0) return { average: 0, count: 0 };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: (sum / reviews.length).toFixed(1),
      count: reviews.length
    };
  }
};

export const SettingsService = {
  async get(key) {
    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .select('value')
      .eq('id', key)
      .single();
    if (error) return null;
    return data?.value;
  },

  async set(key, value) {
    const { error } = await supabase
      .from(TABLES.SETTINGS)
      .upsert({ id: key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async getAll() {
    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .select('*');
    if (error) throw error;
    const settings = {};
    data?.forEach(row => {
      settings[row.id] = row.value;
    });
    return settings;
  }
};

export const EarningsService = {
  async record(earningData) {
    const { data, error } = await supabase
      .from(TABLES.EARNINGS)
      .insert({ ...earningData, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async getByUser(userId, startDate, endDate) {
    let query = supabase
      .from(TABLES.EARNINGS)
      .select('*')
      .eq('userId', userId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getSummary(userId) {
    const earnings = await this.getByUser(userId);
    return {
      total: earnings.reduce((acc, e) => acc + e.amount, 0),
      pending: earnings.filter(e => e.status === 'pending').reduce((acc, e) => acc + e.amount, 0),
      paid: earnings.filter(e => e.status === 'paid').reduce((acc, e) => acc + e.amount, 0)
    };
  }
};

export default {
  UserService,
  ProductService,
  OrderService,
  CategoryService,
  BannerService,
  ReviewService,
  SettingsService,
  EarningsService,
  TABLES,
  ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS
};