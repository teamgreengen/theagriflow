import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMJSt067LBP9MLZ8D32IaWYpDNX5wJnAk",
  authDomain: "gen-lang-client-0802465196.firebaseapp.com",
  projectId: "gen-lang-client-0802465196",
  storageBucket: "gen-lang-client-0802465196.firebasestorage.app",
  messagingSenderId: "484092079276",
  appId: "1:484092079276:web:f1fed958d4f849e4868309"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  { name: 'Vegetables', slug: 'vegetables', icon: '🥬', order: 1 },
  { name: 'Fruits', slug: 'fruits', icon: '🍎', order: 2 },
  { name: 'Cereals & Grains', slug: 'cereals', icon: '🌾', order: 3 },
  { name: 'Livestock', slug: 'livestock', icon: '🐄', order: 4 },
  { name: 'Poultry', slug: 'poultry', icon: '🐔', order: 5 },
  { name: 'Fresh Herbs', slug: 'herbs', icon: '🌿', order: 6 },
  { name: 'Spices', slug: 'spices', icon: '🌶️', order: 7 },
  { name: 'Seeds & Seedlings', slug: 'seeds', icon: '🌱', order: 8 },
  { name: 'Farm Equipment', slug: 'equipment', icon: '🚜', order: 9 },
  { name: 'Processed Foods', slug: 'processed', icon: '🍯', order: 10 }
];

const products = [
  { name: 'Organic Tomatoes', price: 15, originalPrice: 25, category: 'vegetables', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', sellerName: 'Green Farm', rating: 4.5, reviews: 28, stock: 100, description: 'Fresh organic tomatoes directly from the farm' },
  { name: 'Fresh Mangoes (1kg)', price: 18, originalPrice: 30, category: 'fruits', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', sellerName: 'Tropical Fruits', rating: 4.8, reviews: 56, stock: 50, description: 'Sweet and juicy mangoes' },
  { name: 'Local Rice (5kg)', price: 65, originalPrice: 90, category: 'cereals', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', sellerName: 'Ghana Rice Co', rating: 4.2, reviews: 89, stock: 200, description: 'Quality local parboiled rice' },
  { name: 'Cassava (5kg)', price: 30, originalPrice: 45, category: 'vegetables', image: 'https://images.unsplash.com/photo-1590595007322-3350a65570ce?w=400', sellerName: 'Local Farmers', rating: 4.0, reviews: 34, stock: 80, description: 'Fresh cassava tubers' },
  { name: 'Pineapple (Large)', price: 12, originalPrice: 20, category: 'fruits', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', sellerName: 'Pineapple Farms', rating: 4.7, reviews: 67, stock: 40, description: 'Sweet crown pineapple' },
  { name: 'Fresh Eggs (Tray)', price: 20, originalPrice: 28, category: 'poultry', image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=400', sellerName: 'Poultry Plus', rating: 4.6, reviews: 112, stock: 150, description: 'Farm fresh eggs' },
  { name: 'Maize (5kg)', price: 35, originalPrice: 50, category: 'cereals', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', sellerName: 'Grain Masters', rating: 4.3, reviews: 45, stock: 120, description: 'Quality maize grains' },
  { name: 'Green Peppers (500g)', price: 8, originalPrice: 15, category: 'vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', sellerName: 'Veggie Zone', rating: 4.4, reviews: 23, stock: 60, description: 'Fresh green bell peppers' },
  { name: 'Plantain (Bunch)', price: 15, originalPrice: 25, category: 'fruits', image: 'https://images.unsplash.com/photo-1603834201067-5168eb3c4f52?w=400', sellerName: 'Green Grocers', rating: 4.5, reviews: 38, stock: 45, description: 'Ripe plantains' },
  { name: 'Cocoyam (3kg)', price: 25, originalPrice: 40, category: 'vegetables', image: 'https://images.unsplash.com/photo-1590595007322-3350a65570ce?w=400', sellerName: 'Local Farmers', rating: 4.2, reviews: 29, stock: 35, description: 'Fresh cocoyam' },
  { name: 'Broilers (Live - 2kg)', price: 80, originalPrice: 120, category: 'livestock', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400', sellerName: 'Poultry Farm', rating: 4.8, reviews: 56, stock: 20, description: 'Healthy broiler chickens' },
  { name: 'Fresh Basil (Bunch)', price: 5, originalPrice: 10, category: 'herbs', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400', sellerName: 'Herb Garden', rating: 4.6, reviews: 18, stock: 25, description: 'Fresh aromatic basil' }
];

async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  // Add categories
  console.log('Adding categories...');
  for (const cat of categories) {
    await addDoc(collection(db, 'categories'), {
      ...cat,
      createdAt: serverTimestamp()
    });
  }
  console.log(`✅ Added ${categories.length} categories`);
  
  // Add products
  console.log('Adding products...');
  for (const product of products) {
    await addDoc(collection(db, 'products'), {
      ...product,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  console.log(`✅ Added ${products.length} products`);
  
  // Add settings
  console.log('Adding settings...');
  await addDoc(collection(db, 'settings'), { id: 'commission_rate', value: 10 });
  await addDoc(collection(db, 'settings'), { id: 'free_delivery_threshold', value: 100 });
  await addDoc(collection(db, 'settings'), { id: 'default_delivery_fee', value: 15 });
  await addDoc(collection(db, 'settings'), { id: 'rider_share_percentage', value: 80 });
  console.log('✅ Added settings');
  
  console.log('🎉 Database seeding complete!');
}

seedDatabase().catch(console.error);
