# 🍫 Choco E-Commerce Platform

A full-featured e-commerce platform built with Node.js, Express, React, and PostgreSQL.

## 🚀 Features

### For Customers
- **User Authentication**: Secure registration and login with JWT
- **Product Catalog**: Browse and search products with advanced filtering
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Place orders, track status, and view history
- **User Profile**: Manage personal information and addresses
- **Reviews & Ratings**: Share feedback on products
- **Wishlist**: Save products for later
- **Digital Wallet**: Store balance for quick payments
- **Coupons & Discounts**: Apply promotional codes

### For Admins
- **Product Management**: Add, edit, and remove products
- **Order Management**: Monitor and process orders
- **User Management**: View and manage customer accounts
- **Analytics**: Track sales and performance metrics
- **Coupon Management**: Create and manage discount codes

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Frontend (Planned)
- **React** - UI framework
- **Redux** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Database
- **PostgreSQL** - Primary database
- **Redis** - Caching (planned)

## 📁 Project Structure

```
choco-ecommerce/
├── server/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product routes
│   │   ├── users.js             # User management routes
│   │   ├── orders.js            # Order management routes
│   │   └── cart.js              # Shopping cart routes
│   └── index.js                 # Main server file
├── database/
│   └── schema.sql               # Database schema
├── client/                      # React frontend (to be created)
├── docs/                        # Documentation
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd choco-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your database credentials and other settings.

4. **Set up the database**
   ```bash
   # Create database
   createdb choco_db
   
   # Import schema
   psql -d choco_db -f database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API server will run on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Product Endpoints
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/list` - Get all categories

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address
- `GET /api/users/orders` - Get user orders

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Comprehensive input validation using express-validator
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Proper cross-origin resource sharing setup
- **Security Headers** - Helmet.js for security headers
- **SQL Injection Protection** - Parameterized queries

## 🎯 Database Schema

The application uses a comprehensive database schema with the following main entities:
- Users and Addresses
- Products and Categories
- Shopping Cart and Cart Items
- Orders and Order Items
- Payments and Payment Gateways
- Reviews and Ratings
- Wishlists
- Coupons and Discounts
- Notifications
- Admin Users

See `database/schema.sql` for the complete schema definition.

## 🚀 Deployment

### Environment Variables
Make sure to set the following environment variables in production:
- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (use a strong, random secret)
- `PORT` (default: 5000)

### Production Build
```bash
# Build client
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built following the comprehensive design in `idea.md`
- Database design based on `ErDiagram.md`
- API structure following best practices for e-commerce platforms

## 📞 Support

For support, please contact the development team or open an issue in the repository.
