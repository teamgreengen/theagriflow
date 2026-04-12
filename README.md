# Agriflow - Agricultural E-Commerce Platform

A multi-vendor agricultural e-commerce platform built with React + Vite and Supabase backend, deployed on Vercel. Designed for the Ghana market with Paystack payments and local delivery systems.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Portals](#portals)
- [Database Schema](#database-schema)
- [Services](#services)
- [Payment Integration](#payment-integration)
- [Contributing](#contributing)

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Hosting | Vercel |
| Payments | Paystack (Ghana) |
| Styling | CSS with CSS Variables |

---

## Project Structure

```
agriflow-web/
├── public/                     # Static assets
│   ├── logo.png               # Main logo
│   ├── logo-3.png             # Alternative logo
│   ├── favicon.png            # Website favicon
│   └── icons.svg              # SVG icons
│
├── src/
│   ├── components/            # Reusable components
│   │   ├── Navbar.jsx         # Main navigation
│   │   ├── Footer.jsx         # Site footer
│   │   └── Reviews.jsx        # Product reviews
│   │
│   ├── config/                # Configuration
│   │   └── supabase.js        # Supabase client
│   │
│   ├── context/               # React Context
│   │   ├── SupabaseAuthContext.jsx  # Authentication
│   │   ├── CartContext.jsx           # Shopping cart
│   │   ├── WishlistContext.jsx       # Wishlist
│   │   └── ThemeContext.jsx          # Dynamic theming
│   │
│   ├── pages/
│   │   ├── frontend/          # Buyer-facing pages
│   │   │   ├── Home.jsx       # Homepage
│   │   │   ├── Products.jsx   # Product listing
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx  # With Paystack
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── MarketPricing.jsx
│   │   │
│   │   ├── auth/              # Authentication
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── seller/            # Seller portal
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx   # CRUD products
│   │   │   ├── Orders.jsx
│   │   │   └── Earnings.jsx   # Withdrawals
│   │   │
│   │   ├── admin/            # Admin portal
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sellers.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Categories.jsx
│   │   │   └── Banners.jsx
│   │   │
│   │   ├── superadmin/       # Super Admin portal
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Settings.jsx   # Branding, commission
│   │   │   ├── Analytics.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Sellers.jsx
│   │   │   ├── Banners.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Financials.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Activity.jsx
│   │   │   ├── Admins.jsx
│   │   │   └── Users.jsx
│   │   │
│   │   └── rider/            # Rider portal
│   │       ├── Dashboard.jsx
│   │       ├── Deliveries.jsx
│   │       └── Earnings.jsx
│   │
│   ├── services/              # Business logic
│   │   ├── supabaseService.js     # General DB operations
│   │   ├── superAdminService.js    # SuperAdmin backend
│   │   ├── adminService.js         # Admin backend
│   │   ├── sellerService.js        # Seller backend
│   │   ├── riderService.js         # Rider backend
│   │   ├── buyerService.js         # Buyer backend
│   │   ├── deliveryService.js      # Delivery tracking
│   │   ├── paymentService.js       # Paystack
│   │   └── supabaseImageService.js # Image uploads
│   │
│   ├── App.jsx               # Main app with routing
│   ├── App.css               # Global styles
│   ├── index.css             # Base styles + CSS variables
│   └── main.jsx              # Entry point
│
├── supabase-schema.sql       # Database schema (run in Supabase)
├── vercel.json               # Vercel SPA routing config
├── package.json
├── vite.config.js
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **npm**
- **Supabase account** (free tier)
- **Vercel account**
- **Paystack account** (for Ghana payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/teamgreengen/theagriflow.git
cd theagriflow

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### 2. Run Database Schema

Copy the contents of `supabase-schema.sql` and run in Supabase SQL Editor.

This creates:
- **users** - All user accounts with roles
- **products** - Seller products
- **categories** - Product categories
- **orders** - Customer orders
- **banners** - Homepage banners
- **deliveries** - Rider delivery tracking
- **addresses** - User saved addresses
- **wishlist** - User wishlists
- **withdrawals** - Seller earnings withdrawals
- **rider_withdrawals** - Rider earnings withdrawals
- **settings** - Platform configuration
- **notifications** - User notifications
- **system_logs** - Admin audit logs

### 3. Set Up Storage

1. Go to **Supabase Dashboard → Storage**
2. Create a bucket named `images`
3. Enable **Public bucket**
4. Add RLS policies:

```sql
-- Allow public read
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');
```

### 4. Configure Authentication

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Enable **Email** provider

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: **Supabase Dashboard → Settings → API**

---

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Import the repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Alternative: Manual Build

```bash
npm run build
# Upload dist folder to Vercel, Netlify, or any static host
```

---

## Portals

| Portal | URL | Role Required |
|--------|-----|---------------|
| Homepage | `/` | Public |
| Products | `/products` | Public |
| Login | `/login` | - |
| Seller Portal | `/seller` | `seller` |
| Admin Portal | `/admin` | `admin` |
| SuperAdmin | `/superadmin` | `super_admin` |
| Rider Portal | `/rider` | `rider` |

### Creating a Super Admin

Run this in Supabase SQL:

```sql
INSERT INTO users (email, name, role, created_at)
VALUES ('admin@agriflow.com', 'Super Admin', 'super_admin', NOW());
```

Then use Supabase Auth to set the password.

---

## Database Schema

### Users Table

```sql
id          UUID PRIMARY KEY
email       TEXT UNIQUE
name        TEXT
role        TEXT -- 'buyer', 'seller', 'admin', 'super_admin', 'rider'
phone       TEXT
avatar      TEXT
status      TEXT -- 'active', 'suspended'
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

### Products Table

```sql
id          UUID PRIMARY KEY
sellerId    UUID REFERENCES users(id)
categoryId  UUID REFERENCES categories(id)
name        TEXT
description TEXT
price       DECIMAL(10,2)
unit        TEXT
stock       INTEGER
images      TEXT[]
active      BOOLEAN
featured    BOOLEAN
created_at  TIMESTAMPTZ
```

### Orders Table

```sql
id          UUID PRIMARY KEY
userId      UUID REFERENCES users(id)
sellerId    UUID REFERENCES users(id)
items       JSONB
subtotal    DECIMAL(10,2)
deliveryFee DECIMAL(10,2)
total       DECIMAL(10,2)
status      TEXT -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
paymentStatus TEXT
created_at  TIMESTAMPTZ
```

---

## Services

### Authentication Service (SupabaseAuthContext)

```javascript
const { currentUser, userData, login, register, logout } = useAuth();

// Login
await login(email, password);

// Register
await register(email, password, name, role);

// Logout
await logout();
```

### Image Upload Service

```javascript
import ImageService from './services/supabaseImageService';

const url = await ImageService.uploadImage(file, 'folder-name');
// Returns: https://xxx.supabase.co/storage/v1/object/public/images/...
```

### Payment Service (Paystack)

```javascript
import PaymentService from './services/paymentService';

const reference = PaymentService.generateReference();
await PaymentService.checkout({ email, amount, reference });
```

---

## Payment Integration

### Paystack Setup

1. Create account at [paystack.com](https://paystack.com)
2. Get API keys from dashboard
3. Update in `src/services/paymentService.js`:

```javascript
const PUBLIC_KEY = 'pk_test_your_key';
```

### Supported Methods

- **Mobile Money**: MTN, Vodafone, AirtelTigo
- **Card**: Visa, Mastercard
- **Ghana Card**

---

## Dynamic Theming

SuperAdmin can change platform branding from **Settings → Branding**:

- Logo upload
- Favicon upload
- Primary color (buttons, links, headers)
- Secondary color (accents, highlights)

Colors are stored in Supabase `settings` table and applied via CSS variables.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

---

## License

MIT License

---

## Support

- GitHub Issues: https://github.com/teamgreengen/theagriflow/issues
- Email: support@agriflow.com