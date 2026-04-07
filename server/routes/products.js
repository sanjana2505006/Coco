const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE 1=1
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND c.name = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (minPrice) {
      countQuery += ` AND p.price >= $${countParamIndex}`;
      countParams.push(minPrice);
      countParamIndex++;
    }

    if (maxPrice) {
      countQuery += ` AND p.price <= $${countParamIndex}`;
      countParams.push(maxPrice);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasNext: page * limit < totalProducts,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.product_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product reviews
    const reviewsResult = await db.query(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.user_id 
      WHERE r.product_id = $1 
      ORDER BY r.created_at DESC
    `, [id]);

    const product = result.rows[0];
    product.reviews = reviewsResult.rows;

    res.json(product);

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(p.product_id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.category_id = p.category_id 
      GROUP BY c.category_id 
      ORDER BY c.name
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

module.exports = router;
