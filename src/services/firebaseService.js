import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  BANNERS: 'banners',
  REVIEWS: 'reviews',
  SETTINGS: 'settings',
  EARNINGS: 'earnings'
};

export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  RIDER: 'rider'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const UserService = {
  async create(userId, userData) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp()
    });
  },

  async get(userId) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
  },

  async update(userId, data) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, data);
  },

  async getSellers() {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', ROLES.SELLER)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getAdmins() {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', 'in', [ROLES.ADMIN, ROLES.SUPER_ADMIN])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export const ProductService = {
  async create(productData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async get(productId) {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async update(productId, data) {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async delete(productId) {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  },

  async getAll(limit = 50) {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getByCategory(categoryId) {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getBySeller(sellerId) {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('sellerId', '==', sellerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async search(searchTerm) {
    const allProducts = await this.getAll(100);
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

export const OrderService = {
  async create(orderData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async get(orderId) {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async update(orderId, data) {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async getByUser(userId) {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getBySeller(sellerId) {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getAll() {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
      ...categoryData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getAll() {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(categoryId, data) {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await updateDoc(docRef, data);
  },

  async delete(categoryId) {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
  }
};

export const BannerService = {
  async create(bannerData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.BANNERS), {
      ...bannerData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getAll() {
    const q = query(
      collection(db, COLLECTIONS.BANNERS),
      orderBy('order')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getActive() {
    const q = query(
      collection(db, COLLECTIONS.BANNERS),
      where('active', '==', true),
      orderBy('order')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(bannerId, data) {
    const docRef = doc(db, COLLECTIONS.BANNERS, bannerId);
    await updateDoc(docRef, data);
  },

  async delete(bannerId) {
    await deleteDoc(doc(db, COLLECTIONS.BANNERS, bannerId));
  }
};

export const ReviewService = {
  async create(reviewData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
      ...reviewData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getByProduct(productId) {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const docRef = doc(db, COLLECTIONS.SETTINGS, key);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().value : null;
  },

  async set(key, value) {
    const docRef = doc(db, COLLECTIONS.SETTINGS, key);
    await updateDoc(docRef, { value });
  },

  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS));
    const settings = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data().value;
    });
    return settings;
  }
};

export const EarningsService = {
  async record(earningData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.EARNINGS), {
      ...earningData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getByUser(userId, startDate, endDate) {
    let q = query(
      collection(db, COLLECTIONS.EARNINGS),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  COLLECTIONS,
  ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS
};
