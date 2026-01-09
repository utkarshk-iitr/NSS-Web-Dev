# NGO Registration and Donation Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing NGO user registrations and donations with integrated payment gateway support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Table of Contents

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
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Authentication
- Common login & registration page for users and admins
- Role-based access control (User/Admin)
- JWT-based authentication
- Secure password hashing with bcrypt

### User Features
- **Dashboard**: View donation statistics and recent activity
- **Make Donations**: Donate any amount with secure payment processing
- **Donation History**: View all donation attempts with status tracking
- **Profile Management**: Update personal and address information
- **Receipt Download**: Download receipts for successful donations

### Admin Features
- **Dashboard**: View total registrations, donations, and analytics
- **User Management**: 
  - View all registered users
  - Filter by status, date range
  - Activate/deactivate users
  - Export user data to CSV
- **Donation Management**:
  - View all donation records
  - Filter by status, date, amount
  - Track payment status and timestamps
  - View aggregated donation amounts
  - Export donation data

### Data Handling
- Registration data stored independently of donation completion
- Donation attempts tracked regardless of payment outcome
- Clear status tracking: success, pending, failed
- No fake or forced payment success logic

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Payment Gateway**: Cashfree (Sandbox/Production)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
NSS-Web-Dev/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Donation.js          # Donation schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── user.js              # User routes
│   │   ├── admin.js             # Admin routes
│   │   └── donation.js          # Donation & payment routes
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Entry point
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── layouts/
│   │   │       ├── UserLayout.jsx
│   │   │       └── AdminLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   └── Donations.jsx
│   │   │   ├── user/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Donations.jsx
│   │   │   │   ├── MakeDonation.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   ├── api.js           # Axios instance
│   │   │   └── helpers.js       # Utility functions
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn
- Cashfree account (for payment integration) - Optional for testing with mock mode

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/NSS-Web-Dev.git
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

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the backend directory
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ngo_donation_db

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000

# Cashfree Sandbox Credentials
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# Backend URL (for webhooks)
BACKEND_URL=http://localhost:5000
```

### Getting Cashfree Credentials

1. Sign up at [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Go to Developers → API Keys
3. Copy the Test App ID and Test Secret Key to your `.env` file
4. **Note**: You can skip this step and use Mock Mode for testing without real payment credentials

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user/admin |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/create-admin` | Create admin (with secret) |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/donations` | Get donation history |
| GET | `/api/user/dashboard` | Get dashboard data |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get admin dashboard stats |
| GET | `/api/admin/users` | Get all users (with filters) |
| GET | `/api/admin/users/:id` | Get user details |
| PUT | `/api/admin/users/:id/status` | Toggle user status |
| GET | `/api/admin/donations` | Get all donations |
| GET | `/api/admin/export/users` | Export users data |
| GET | `/api/admin/export/donations` | Export donations data |
| GET | `/api/admin/analytics` | Get analytics data |

### Donation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donation/config` | Get payment gateway config |
| POST | `/api/donation/create-order` | Create Cashfree order |
| POST | `/api/donation/verify-payment` | Verify payment |
| POST | `/api/donation/payment-failed` | Record failed payment |
| POST | `/api/donation/webhook` | Cashfree webhook endpoint |
| GET | `/api/donation/receipt/:id` | Get donation receipt |
| GET | `/api/donation/check-status/:orderId` | Check order payment status |

## 🗄 Database Schema

### User Schema
```javascript
{
  name: String,           // Required
  email: String,          // Required, Unique
  password: String,       // Required, Hashed
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  role: String,           // 'user' or 'admin'
  isActive: Boolean,
  registeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Schema
```javascript
{
  user: ObjectId,         // Reference to User
  amount: Number,         // Required
  currency: String,       // Default: 'INR'
  status: String,         // 'pending', 'success', 'failed'
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  attemptedAt: Date,
  completedAt: Date,
  failureReason: String,
  notes: String,
  receiptId: String,      // Generated on success
  createdAt: Date,
  updatedAt: Date
}
```

## 💳 Payment Integration

This project uses **Razorpay** payment gateway in sandbox/test mode.

### Test Card Details (Sandbox)
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

### Payment Flow
1. User enters donation amount
2. Backend creates Razorpay order
3. Donation record created with 'pending' status
4. Razorpay checkout opens
5. User completes payment
6. Backend verifies payment signature
7. Donation status updated to 'success' or 'failed'

## 📸 Screenshots

### Landing Page
Modern, responsive landing page with call-to-action

### User Dashboard
Overview of donation statistics and recent activity

### Admin Dashboard
Comprehensive analytics with charts and statistics

### Make Donation
Clean donation form with preset amounts and Razorpay integration

## 🧪 Creating Test Admin

To create an admin user, make a POST request:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "adminSecret": "ADMIN_SECRET_KEY"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Utkarsh Kumar**

---

Made with ❤️ for NSS Web Development