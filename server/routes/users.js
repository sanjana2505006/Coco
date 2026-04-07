const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT user_id, name, email, phone, created_at, updated_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone } = req.body;
    
    const result = await db.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW() WHERE user_id = $3 RETURNING user_id, name, email, phone, updated_at',
      [name, phone, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Get user addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Server error fetching addresses' });
  }
});

// Add new address
router.post('/addresses', auth, [
  body('street').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('zipCode').notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { street, city, state, country, zipCode, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [req.user.userId]
      );
    }

    const result = await db.query(
      'INSERT INTO addresses (user_id, street, city, state, country, zip_code, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.userId, street, city, state, country, zipCode, isDefault || false]
    );

    res.status(201).json({
      message: 'Address added successfully',
      address: result.rows[0]
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Server error adding address' });
  }
});

// Get user orders
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT o.*, oi.quantity, oi.price as item_price, p.name as product_name, p.image_url
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.userId, limit, offset]);

    // Group by order
    const orders = {};
    result.rows.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          total_amount: row.total_amount,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: []
        };
      }
      orders[row.order_id].items.push({
        quantity: row.quantity,
        price: row.item_price,
        product_name: row.product_name,
        image_url: row.image_url
      });
    });

    res.json(Object.values(orders));

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

module.exports = router;
