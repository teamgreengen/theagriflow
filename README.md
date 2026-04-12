# Agriflow - Agricultural E-Commerce Platform

A multi-vendor agricultural e-commerce platform built with React + Vite and Firebase backend, similar to Jumia, Alibaba, or eBay. Designed for the Ghana market with Paystack payments, Ghana Card verification, and local delivery systems.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Seeding Database](#seeding-database)
- [Payment Integration](#payment-integration)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Contributing](#contributing)

---

## Features

### Multi-Role Portal System
- **Super Admin Portal**: Platform-wide settings, commission rates, admin management
- **Admin Portal**: Seller management, order management, categories, banners/promotions
- **Seller Portal**: Product management, order fulfillment, earnings tracking
- **Buyer Frontend**: Browse products, cart, checkout, order tracking, wishlist, reviews
- **Rider Portal**: Delivery management, earnings tracking
- **Public Pages**: Homepage, Product listings, Market Pricing page

### Core Functionality
- Multi-vendor marketplace with commission system
- Shopping cart with localStorage persistence
- Wishlist with localStorage persistence
- Order tracking with timeline view
- Product reviews and ratings system
- Category and banner management
- Search and filter products by category

### Payment & Verification
- Paystack integration (Mobile Money, Cards, Ghana Card)
- Ghana Card identity verification for sellers (via QoreID)
- Automatic delivery fee calculation
- Free delivery for orders over GH₵100

### Delivery System
- In-house and community-based delivery riders
- 80% rider / 20% platform split on delivery fees
- Order status tracking (Pending → Processing → Shipped → Delivered)

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Routing
- **CSS** - Styling

### Backend (Firebase)
- **Firebase Authentication** - User auth with 5 roles
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - Image/file storage
- **Firebase Hosting** - Web hosting
- **Firebase Functions** - Server-side logic (optional)

### External Services
- **Paystack** - Payment processing (Ghana)
- **QoreID** - Ghana Card verification

---

## Project Structure

```
agriflow-web/
├── public/                     # Static assets
│   ├── logo.png               # Main logo
│   ├── logo-white.png         # White logo for dark backgrounds
│   ├── favicon.png            # Website favicon
│   └── icons.svg              # SVG icons
│
├── src/
│   ├── components/            # Reusable components
│   │   ├── Navbar.jsx        # Main navigation
│   │   ├── Footer.jsx        # Site footer
│   │   └── Reviews.jsx       # Product reviews component
│   │
│   ├── config/                # Configuration
│   │   └── firebase.js       # Firebase initialization (configured)
│   │
│   ├── context/               # React Context (state management)
│   │   ├── AuthContext.jsx   # Authentication state
│   │   ├── CartContext.jsx   # Shopping cart state
│   │   └── WishlistContext.jsx # Wishlist state
│   │
│   ├── pages/
│   │   ├── frontend/          # Buyer-facing pages
│   │   │   ├── Home.jsx      # Homepage (Jumia-style)
│   │   │   ├── Products.jsx  # Product listing
│   │   │   ├── ProductDetail.jsx # Product details
│   │   │   ├── Cart.jsx      # Shopping cart
│   │   │   ├── Checkout.jsx  # Checkout with payment
│   │   │   ├── OrderTracking.jsx # Order tracking
│   │   │   └── MarketPricing.jsx # Public market prices
│   │   │
│   │   ├── auth/              # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── seller/            # Seller portal
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx  # + Add Product form
│   │   │   ├── Orders.jsx
│   │   │   └── Earnings.jsx
│   │   │
│   │   ├── admin/            # Admin portal
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sellers.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Categories.jsx # + Add Category form
│   │   │   └── Banners.jsx   # Banner/promotion management
│   │   │
│   │   ├── superadmin/       # Super admin portal
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Admins.jsx
│   │   │   └── Settings.jsx  # Commission, delivery fees
│   │   │
│   │   └── rider/            # Delivery rider portal
│   │       ├── Dashboard.jsx
│   │       ├── Deliveries.jsx
│   │       └── Earnings.jsx
│   │
│   ├── services/              # Business logic services
│   │   ├── firebaseService.js # Firestore CRUD operations
│   │   └── paymentService.js  # Paystack integration
│   │
│   ├── App.jsx               # Main app with routing
│   ├── App.css               # Global styles
│   ├── main.jsx              # Entry point
│   └── index.css             # Base styles
│
├── seed.js                   # Database seeding script
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── index.html                # HTML entry point
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Firebase account** (free tier)
- **Paystack account** (for Ghana payments)
- **QoreID account** (optional, for Ghana Card verification)

### Installation

```bash
# Clone the repository
cd agriflow-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for Firebase Hosting.

---

## Firebase Setup

### Current Configuration

The project is pre-configured with Firebase. Current config in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCMJSt067LBP9MLZ8D32IaWYpDNX5wJnAk",
  authDomain: "gen-lang-client-0802465196.firebaseapp.com",
  projectId: "gen-lang-client-0802465196",
  storageBucket: "gen-lang-client-0802465196.firebasestorage.app",
  messagingSenderId: "484092079276",
  appId: "1:484092079276:web:f1fed958d4f849e4868309"
};
```

### Enable Firebase Services

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **gen-lang-client-0802465196**
3. Enable the following services:
   - **Authentication** → Sign-in method → Enable **Email/Password**
   - **Firestore Database** → Create database (use Test Mode for development)
   - **Storage** → Start in Test Mode

---

## Seeding Database

The project includes a seed script to populate initial data.

### Run Seed Script

```bash
cd agriflow-web
npm install firebase
node seed.js
```

This will create:
- **10 Categories**: Vegetables, Fruits, Cereals, Livestock, Poultry, Herbs, Spices, Seeds, Equipment, Processed Foods
- **12 Sample Products**: Various agricultural products with prices, ratings, and images
- **Settings**: Commission rate (10%), free delivery threshold (GH₵100), default delivery fee (GH₵15), rider share (80%)

---

## Payment Integration

### Paystack Configuration

1. Create account at [paystack.com](https://paystack.com)
2. Get your API keys from the dashboard
3. Update `src/services/paymentService.js`:

```javascript
const PUBLIC_KEY = 'pk_test_your_key'; // Replace with your key
```

### Supported Payment Methods

- **Mobile Money**: MTN, Vodafone, AirtelTigo (Ghana)
- **Card**: Visa, Mastercard
- **Ghana Card**: Direct debit from Ghana Card wallet

### Payment Flow

```
User selects payment method at checkout
       ↓
Frontend calls Paystack inline checkout
       ↓
User completes payment on Paystack popup
       ↓
Paystack calls your callback with reference
       ↓
Order created in Firestore with payment status
```

### Server-Side Verification (Optional)

Create a Firebase Function for secure payment verification:

```bash
firebase functions:init
```

```javascript
// functions/index.js
const functions = require('firebase-functions');
const axios = require('axios');

exports.verifyPaystackPayment = functions.https.onCall(async (data, context) => {
  const { reference } = data;
  
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  );
  
  if (response.data.data.status === 'success') {
    return { success: true, data: response.data.data };
  }
  
  return { success: false, error: 'Payment verification failed' };
});
```

---

## Deployment

### Firebase Hosting

**Option 1: Manual Deployment**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Option 2: GitHub Actions (Auto-Deploy)**

1. Push code to GitHub repository
2. Add GitHub Secrets:
   - `FIREBASE_TOKEN` - Run `firebase login:ci` to generate
   - `FIREBASE_SERVICE_ACCOUNT` - JSON from Firebase Console → Project Settings → Service Accounts

3. Push to `main` branch triggers automatic deployment

**Live URL**: https://gen-lang-client-0802465196.web.app

### Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Add your domain (e.g., agriflow.com)
4. Update DNS records as instructed

### CI/CD Environment Variables (GitHub Secrets)

| Secret Name | Value |
|------------|-------|
| `FIREBASE_TOKEN` | Run `firebase login:ci` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON |
| `VITE_FIREBASE_API_KEY` | From Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | gen-lang-client-0802465196 |

---

## Architecture

### Authentication Flow

```
User Login/Register
       ↓
Firebase Auth (creates UID)
       ↓
AuthContext checks user role in Firestore
       ↓
Redirects to appropriate portal based on role
```

### Order Flow

```
Buyer places order
       ↓
Paystack payment processing
       ↓
On success: Order created in Firestore
       ↓
Seller receives notification, processes order
       ↓
Admin assigns rider for delivery
       ↓
Rider picks up, delivers, marks complete
       ↓
Buyer receives goods, leaves review
```

### Commission Structure

- **Platform commission**: Configurable by Super Admin (default 10%)
- **Delivery split**: Rider 80% / Platform 20%
- **Free delivery threshold**: Configurable (default GH₵100)

---

## API Reference

### Firebase Service Methods

The project includes a complete Firebase service layer in `src/services/firebaseService.js`:

```javascript
// User Service
UserService.create(userId, userData)
UserService.get(userId)
UserService.update(userId, data)
UserService.getSellers()
UserService.getAdmins()

// Product Service
ProductService.create(productData)
ProductService.get(productId)
ProductService.update(productId, data)
ProductService.delete(productId)
ProductService.getAll(limit)
ProductService.getByCategory(categoryId)
ProductService.getBySeller(sellerId)
ProductService.search(searchTerm)

// Order Service
OrderService.create(orderData)
OrderService.get(orderId)
OrderService.update(orderId, data)
OrderService.getByUser(userId)
OrderService.getBySeller(sellerId)
OrderService.getAll()
OrderService.updateStatus(orderId, status)
OrderService.assignRider(orderId, riderId)

// Category Service
CategoryService.create(categoryData)
CategoryService.getAll()
CategoryService.update(categoryId, data)
CategoryService.delete(categoryId)

// Banner Service
BannerService.create(bannerData)
BannerService.getAll()
BannerService.getActive()
BannerService.update(bannerId, data)
BannerService.delete(bannerId)

// Review Service
ReviewService.create(reviewData)
ReviewService.getByProduct(productId)
ReviewService.getAverageRating(productId)

// Settings Service
SettingsService.get(key)
SettingsService.set(key, value)
SettingsService.getAll()
```

---

## Environment Variables

For production, create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key
VITE_API_URL=https://your-region-your-project.cloudfunctions.net
```

---

## Firestore Data Models

### Users Collection
```javascript
{
  id: string,                    // Firebase Auth UID
  email: string,
  name: string,
  phone: string,
  role: 'buyer' | 'seller' | 'admin' | 'super_admin' | 'rider',
  avatar: string,
  verified: boolean,
  createdAt: timestamp
}
```

### Products Collection
```javascript
{
  id: string,
  sellerId: string,
  name: string,
  description: string,
  price: number,
  originalPrice: number,
  category: string,
  image: string,
  stock: number,
  status: 'active' | 'inactive' | 'out_of_stock',
  rating: number,
  reviews: number,
  sellerName: string,
  unit: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Orders Collection
```javascript
{
  id: string,
  userId: string,
  sellerId: string,
  riderId: string,
  items: array,
  delivery: object,
  subtotal: number,
  deliveryFee: number,
  total: number,
  payment: object,
  status: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Categories Collection
```javascript
{
  id: string,
  name: string,
  slug: string,
  icon: string,
  order: number,
  createdAt: timestamp
}
```

### Settings Collection
```javascript
{
  id: 'commission_rate' | 'free_delivery_threshold' | 'default_delivery_fee' | 'rider_share_percentage',
  value: any
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@agriflow.com

---

## Changelog

### v1.1.0
- Connected Home and Products pages to Firebase Firestore
- Integrated Login/Register with Firebase Authentication
- Added database seed script for initial data
- Pre-configured Firebase with project keys

### v1.0.0
- Multi-role portal system (Super Admin, Admin, Seller, Buyer, Rider)
- Firebase Authentication and Firestore integration
- Paystack payment integration (Mobile Money, Cards, Ghana Card)
- Ghana Card verification for sellers
- Shopping cart with localStorage
- Wishlist with localStorage
- Order tracking with timeline
- Product reviews and ratings
- Banner/promotion management
- Category management
- Market pricing public page

### Upcoming Features
- Push notifications
- Real-time chat between buyer and seller
- Android mobile app
- Vendor rating system
- Coupon/discount system
- Multi-vendor order splitting
