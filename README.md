# NGO Registration and Donation Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing NGO user registrations and donations with integrated Cashfree payment gateway support.

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Payment Integration](#-payment-integration)
- [Demo Video](#-demo)
- [Contributing](#-contributing)

## Features

### Dark Mode
- System-wide dark/light theme toggle
- Persisted theme preference in localStorage
- Respects system preference on first visit
- Smooth transition animations

### Authentication
- Common login & registration page for users and admins
- Role-based access control (User/Admin)
- JWT-based authentication with 7-day expiry
- Secure password hashing with bcrypt
- Protected routes with automatic redirect

### User Features
- **Dashboard**: View donation statistics, total donated, recent activity
- **Make Donations**: 
  - Donate any custom amount (minimum ₹1)
  - Preset amount buttons (₹100, ₹500, ₹1000, ₹5000)
  - Secure Cashfree payment integration
  - Mock mode for testing without real payments
- **Donation History**: 
  - View all donation attempts with status tracking
  - Filter by status (All, Success, Pending, Failed)
  - Paginated list with detailed information
- **Profile Management**: 
  - Update personal information (name, phone)
  - Update address details (street, city, state, pincode)
  - Real-time validation with detailed error messages
- **PDF Receipt Download**: 
  - Professional PDF receipts for successful donations
  - Includes donor info, payment details, receipt ID
  - Branded design with organization logo

### Admin Features
- **Dashboard**: 
  - Total registrations and active users count
  - Donation statistics with charts (Recharts)
  - Payment status breakdown (Success/Pending/Failed)
  - User registration trends
  - Recent donations list
- **User Management**: 
  - View all registered users with pagination
  - Search by name, email, or phone
  - Filter by status (Active/Inactive) and date range
  - View detailed user profile with donation summary
  - Activate/deactivate users
  - Delete users (with cascade delete of donations)
  - Export user data to CSV
- **Donation Management**:
  - View all donation records with pagination
  - Filter by status, date range, amount range
  - View detailed donation information
  - Track payment IDs and timestamps
  - View aggregated statistics
  - Export donation data to CSV

### Data Handling
- Registration data stored independently of donation completion
- Donation attempts tracked regardless of payment outcome
- Clear status tracking: success, pending, failed
- Receipt ID generation for successful payments
- Webhook support for payment verification

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| Axios | HTTP client (for Cashfree API) |
| crypto | Signature verification |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling (with dark mode) |
| Axios | HTTP client |
| Recharts | Charts & analytics |
| React Icons | Icon library |
| React Hot Toast | Notifications |
| jsPDF | PDF receipt generation |

### Payment Gateway
| Provider | Mode | Features |
|----------|------|----------|
| Cashfree | Sandbox/Production | UPI, Cards, Net Banking, Wallets |

## Project Structure

```
NSS-Web-Dev/
├── backend/
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication & admin middleware
│   ├── models/
│   │   ├── User.js                 # User schema with address
│   │   └── Donation.js             # Donation schema with payment tracking
│   ├── routes/
│   │   ├── auth.js                 # Login, register, admin creation
│   │   ├── user.js                 # Profile, dashboard, donations
│   │   ├── admin.js                # User & donation management
│   │   └── donation.js             # Cashfree payment integration
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── server.js                   # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layouts/
│   │   │       ├── UserLayout.jsx  # User dashboard layout
│   │   │       └── AdminLayout.jsx # Admin panel layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Dark mode state
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx   # Admin analytics
│   │   │   │   ├── Users.jsx       # User management
│   │   │   │   └── Donations.jsx   # Donation management
│   │   │   ├── user/
│   │   │   │   ├── Dashboard.jsx   # User overview
│   │   │   │   ├── Donations.jsx   # Donation history
│   │   │   │   ├── MakeDonation.jsx# Payment form
│   │   │   │   └── Profile.jsx     # Profile settings
│   │   │   ├── LandingPage.jsx     # Public homepage
│   │   │   ├── Login.jsx           # Authentication
│   │   │   └── Register.jsx        # User registration
│   │   ├── utils/
│   │   │   ├── api.js              # Axios instance with interceptors
│   │   │   └── helpers.js          # Formatting & utility functions
│   │   ├── App.jsx                 # Route configuration
│   │   ├── index.css               # Tailwind & global styles
│   │   └── main.jsx                # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js          # Tailwind with dark mode
│   └── vite.config.js
│
└── README.md
```

## Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or MongoDB Atlas cloud)
- **npm** or **yarn**
- **Cashfree Account** (optional - mock mode available for testing)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/utkarshk-iitr/NSS-Web-Dev.git
cd NSS-Web-Dev
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ngo_donation_db?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Port
PORT=5000

# Cashfree Sandbox Credentials
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Getting Cashfree Credentials

1. Sign up at [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Complete KYC verification (for production)
3. Go to **Developers → API Keys**
4. Copy the **Test App ID** and **Test Secret Key**
5. Add them to your `.env` file

## Running the Application

### Development Mode

You need **two terminals** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user/admin | Public |
| GET | `/api/auth/me` | Get current user | Required |
| POST | `/api/auth/create-admin` | Create admin account | Secret Key |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/profile` | Get user profile | User |
| PUT | `/api/user/profile` | Update profile | User |
| GET | `/api/user/donations` | Get donation history | User |
| GET | `/api/user/dashboard` | Get dashboard stats | User |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Get admin statistics | Admin |
| GET | `/api/admin/users` | Get users (paginated) | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| PUT | `/api/admin/users/:id/status` | Toggle user active status | Admin |
| DELETE | `/api/admin/users/:id` | Delete user & donations | Admin |
| GET | `/api/admin/donations` | Get all donations | Admin |
| GET | `/api/admin/donations/:id` | Get donation details | Admin |
| GET | `/api/admin/export/users` | Export users to CSV | Admin |
| GET | `/api/admin/export/donations` | Export donations to CSV | Admin |

### Donation Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/donation/config` | Get payment config | User |
| POST | `/api/donation/create-order` | Create Cashfree order | User |
| POST | `/api/donation/verify-payment` | Verify payment | User |
| POST | `/api/donation/payment-failed` | Record failed payment | User |
| POST | `/api/donation/webhook` | Cashfree webhook | Public |
| GET | `/api/donation/receipt/:id` | Get donation receipt | User |
| GET | `/api/donation/check-status/:orderId` | Check payment status | User |

## Database Schema

### User Schema
```javascript
{
  name: String,              // Required, trimmed
  email: String,             // Required, unique, lowercase
  password: String,          // Required, hashed with bcrypt
  phone: String,             // Optional
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String          // Default: 'India'
  },
  role: String,              // 'user' or 'admin'
  isActive: Boolean,         // Default: true
  registeredAt: Date,        // Auto-set on creation
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Schema
```javascript
{
  user: ObjectId,            // Reference to User
  amount: Number,            // Required, min: 1
  currency: String,          // Default: 'INR'
  status: String,            // 'pending', 'success', 'failed'
  razorpayOrderId: String,   // Cashfree order ID
  razorpayPaymentId: String, // Cashfree payment ID
  razorpaySignature: String, // Payment signature
  attemptedAt: Date,         // When payment was initiated
  completedAt: Date,         // When payment was completed
  failureReason: String,     // Error message if failed
  notes: String,             // Optional donor notes
  receiptId: String,         // Generated on success (RCPT_xxx)
  createdAt: Date,
  updatedAt: Date
}
```

## Payment Integration

This project uses **Cashfree** payment gateway with sandbox mode for testing.

### Payment Flow
```
1. User enters amount → 2. Create Order API → 3. Cashfree Checkout Opens
                                                       ↓
4. User completes payment ← 5. Verify Payment ← 6. Redirect to App
                                                       ↓
7. Update donation status → 8. Generate Receipt ID → 9. Show Success
```

## Default Credentials

### Creating Admin User

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@ngo.com",
    "password": "admin123",
    "adminSecret": "ADMIN_SECRET_KEY"
  }'
```

### Test Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ngo.com | admin123 |
| User | demo@demo.com | demo123 |

## Theme Customization

### Dark Mode
Toggle dark mode using the sun/moon icon in the header. Theme preference is saved to localStorage.

## 👨Author

**Utkarsh Kumar**

---
