const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');

// Get user cart
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ci.*, p.name, p.price as current_price, p.image_url, p.stock
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = (SELECT cart_id FROM cart WHERE user_id = $1)
    `, [req.user.userId]);

    const cart = result.rows;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      items: cart,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error fetching cart' });
  }
});

// Add item to cart
router.post('/add', auth, [
  body('productId').isInt().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Check if product exists and has sufficient stock
    const productResult = await db.query(
      'SELECT price, stock FROM products WHERE product_id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Get or create user cart
    let cartResult = await db.query(
      'SELECT cart_id FROM cart WHERE user_id = $1',
      [req.user.userId]
    );

    if (cartResult.rows.length === 0) {
      cartResult = await db.query(
        'INSERT INTO cart (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING cart_id',
        [req.user.userId]
      );
    }

    const cartId = cartResult.rows[0].cart_id;

    // Check if item already in cart
    const existingItemResult = await db.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (existingItemResult.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItemResult.rows[0].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      await db.query(
        'UPDATE cart_items SET quantity = $1, price = $2 WHERE cart_item_id = $3',
        [newQuantity, product.price, existingItemResult.rows[0].cart_item_id]
      );
    } else {
      // Add new item
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [cartId, productId, quantity, product.price]
      );
    }

    // Update cart timestamp
    await db.query(
      'UPDATE cart SET updated_at = NOW() WHERE cart_id = $1',
      [cartId]
    );

    res.json({ message: 'Item added to cart successfully' });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error adding item to cart' });
  }
});

// Update cart item quantity
router.put('/update', auth, [
  body('productId').isInt().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be at least 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Get cart ID
    const cartResult = await db.query(
      'SELECT cart_id FROM cart WHERE user_id = $1',
      [req.user.userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartId = cartResult.rows[0].cart_id;

    if (quantity === 0) {
      // Remove item from cart
      await db.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
    } else {
      // Check stock
      const productResult = await db.query(
        'SELECT stock FROM products WHERE product_id = $1',
        [productId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = productResult.rows[0];

      if (product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Update quantity
      const result = await db.query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING cart_item_id',
        [quantity, cartId, productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
    }

    // Update cart timestamp
    await db.query(
      'UPDATE cart SET updated_at = NOW() WHERE cart_id = $1',
      [cartId]
    );

    res.json({ message: 'Cart updated successfully' });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Get cart ID
    const cartResult = await db.query(
      'SELECT cart_id FROM cart WHERE user_id = $1',
      [req.user.userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartId = cartResult.rows[0].cart_id;

    const result = await db.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING cart_item_id',
      [cartId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Update cart timestamp
    await db.query(
      'UPDATE cart SET updated_at = NOW() WHERE cart_id = $1',
      [cartId]
    );

    res.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error removing item from cart' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM cart WHERE user_id = $1)',
      [req.user.userId]
    );

    // Update cart timestamp
    await db.query(
      'UPDATE cart SET updated_at = NOW() WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({ 
      message: 'Cart cleared successfully',
      itemsRemoved: result.rowCount
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error clearing cart' });
  }
});

module.exports = router;
