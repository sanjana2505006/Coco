const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

// Mock data for demonstration
const mockUsers = [
  { user_id: 1, name: 'Demo User', email: 'demo@example.com', password: 'demo123' }
];

const mockProducts = [
  { product_id: 1, name: 'Wireless Headphones', price: 199.99, rating: 4.5, category_name: 'Electronics', stock: 50, image_url: null },
  { product_id: 2, name: 'Smartphone', price: 899.99, rating: 4.8, category_name: 'Electronics', stock: 30, image_url: null },
  { product_id: 3, name: 'Designer T-Shirt', price: 49.99, rating: 4.2, category_name: 'Fashion', stock: 100, image_url: null },
  { product_id: 4, name: 'Running Shoes', price: 129.99, rating: 4.6, category_name: 'Fashion', stock: 75, image_url: null },
  { product_id: 5, name: 'Coffee Maker', price: 249.99, rating: 4.7, category_name: 'Home & Kitchen', stock: 25, image_url: null }
];

const mockCategories = [
  { name: 'Electronics' },
  { name: 'Fashion' },
  { name: 'Home & Kitchen' },
  { name: 'Books' },
  { name: 'Sports' }
];

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🍫 Choco Demo API', version: '1.0.0' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      message: 'Login successful',
      token: 'demo_token_' + Date.now(),
      user: { id: user.user_id, name: user.name, email: user.email }
    });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const newUser = {
    user_id: mockUsers.length + 1,
    name,
    email,
    password
  };
  mockUsers.push(newUser);
  
  res.json({
    message: 'Registration successful',
    token: 'demo_token_' + Date.now(),
    user: { id: newUser.user_id, name, email }
  });
});

// Product routes
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filteredProducts = mockProducts;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category_name === category);
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    products: filteredProducts,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProducts: filteredProducts.length
    }
  });
});

app.get('/api/products/categories/list', (req, res) => {
  res.json(mockCategories);
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.product_id == req.params.id);
  if (product) {
    product.reviews = [];
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Cart routes (mock)
app.get('/api/cart', (req, res) => {
  res.json({
    items: [],
    total: 0,
    itemCount: 0
  });
});

app.post('/api/cart/add', (req, res) => {
  res.json({ message: 'Item added to cart (demo)' });
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({
    user_id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+1234567890',
    created_at: new Date().toISOString()
  });
});

app.get('/api/users/orders', (req, res) => {
  res.json([]);
});

app.get('/api/users/addresses', (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`🚀 Choco Demo Server running on port ${PORT}`);
  console.log('📊 This is a demo server with mock data');
});
