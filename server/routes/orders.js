const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');

// Create new order
router.post('/', auth, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isInt().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('addressId').isInt().withMessage('Valid address ID required'),
  body('paymentMethod').isIn(['card', 'upi', 'wallet', 'cod']).withMessage('Valid payment method required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, addressId, paymentMethod, couponCode } = req.body;

    // Start transaction
    await db.query('BEGIN');

    try {
      let totalAmount = 0;

      // Validate products and calculate total
      for (const item of items) {
        const productResult = await db.query(
          'SELECT price, stock FROM products WHERE product_id = $1',
          [item.productId]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const product = productResult.rows[0];
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        totalAmount += product.price * item.quantity;
      }

      // Apply coupon if provided
      if (couponCode) {
        const couponResult = await db.query(
          'SELECT discount FROM coupons WHERE code = $1 AND expiry_date > NOW() AND usage_limit > 0',
          [couponCode]
        );

        if (couponResult.rows.length > 0) {
          const discount = couponResult.rows[0].discount;
          totalAmount = totalAmount * (1 - discount / 100);
        }
      }

      // Create order
      const orderResult = await db.query(`
        INSERT INTO orders (user_id, address_id, total_amount, status, created_at, updated_at, coupon_code)
        VALUES ($1, $2, $3, 'pending', NOW(), NOW(), $4)
        RETURNING order_id, total_amount, status, created_at
      `, [req.user.userId, addressId, totalAmount, couponCode]);

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of items) {
        // Get product price
        const productResult = await db.query(
          'SELECT price FROM products WHERE product_id = $1',
          [item.productId]
        );
        const product = productResult.rows[0];

        // Add order item
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.order_id, item.productId, item.quantity, product.price]
        );

        // Update product stock
        await db.query(
          'UPDATE products SET stock = stock - $1 WHERE product_id = $2',
          [item.quantity, item.productId]
        );
      }

      // Create payment record
      await db.query(
        'INSERT INTO payments (order_id, amount, payment_method, status, transaction_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [order.order_id, totalAmount, paymentMethod, 'pending', `txn_${Date.now()}`]
      );

      // Clear user cart
      await db.query('DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM cart WHERE user_id = $1)', [req.user.userId]);

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.order_id,
          totalAmount: order.total_amount,
          status: order.status,
          createdAt: order.created_at
        }
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Server error creating order' });
  }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await db.query(`
      SELECT o.*, a.street, a.city, a.state, a.country, a.zip_code
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.address_id
      WHERE o.order_id = $1 AND o.user_id = $2
    `, [id, req.user.userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
    `, [id]);

    order.items = itemsResult.rows;

    // Get payment details
    const paymentResult = await db.query(
      'SELECT * FROM payments WHERE order_id = $1',
      [id]
    );

    order.payment = paymentResult.rows[0];

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order can be cancelled
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Update order status
      await db.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2',
        ['cancelled', id]
      );

      // Restore stock
      const itemsResult = await db.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );

      for (const item of itemsResult.rows) {
        await db.query(
          'UPDATE products SET stock = stock + $1 WHERE product_id = $2',
          [item.quantity, item.product_id]
        );
      }

      await db.query('COMMIT');

      res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error cancelling order' });
  }
});

module.exports = router;
