// backend/routes/admin.js
import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
import { permit } from '../middleware/role.js';
const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(permit('admin'));

/**
 * RESTAURANTS CRUD
 */
router.get('/restaurants', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT restaurant_id, owner_id, name, address, phone, opening_hours, rating, image, created_at FROM restaurants ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/restaurants', err);
    res.status(500).json({ error: 'server' });
  }
});

router.post('/restaurants', async (req, res) => {
  try {
    const { name, address, phone, opening_hours, rating, owner_id, image } = req.body;
    const q = `INSERT INTO restaurants (owner_id, name, address, phone, opening_hours, rating, image)
               VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const values = [owner_id || null, name, address || null, phone || null, opening_hours || null, rating || 0, image || null];
    const { rows } = await pool.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /admin/restaurants', err);
    res.status(500).json({ error: 'server' });
  }
});

router.put('/restaurants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, address, phone, opening_hours, rating, owner_id, image } = req.body;
    const q = `UPDATE restaurants SET owner_id=$1, name=$2, address=$3, phone=$4, opening_hours=$5, rating=$6, image=$7
               WHERE restaurant_id=$8 RETURNING *`;
    const values = [owner_id || null, name, address || null, phone || null, opening_hours || null, rating || 0, image || null, id];
    const { rows } = await pool.query(q, values);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /admin/restaurants/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

router.delete('/restaurants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM restaurants WHERE restaurant_id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /admin/restaurants/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

/**
 * ITEMS CRUD
 */
router.get('/items', async (req, res) => {
  try {
    const q = `SELECT fi.item_id, fi.restaurant_id, fi.name, fi.description, fi.price, fi.availability, fi.image,
                      fi.category_id, c.name as category_name, r.name as restaurant_name
               FROM food_items fi
               LEFT JOIN categories c ON fi.category_id = c.category_id
               LEFT JOIN restaurants r ON fi.restaurant_id = r.restaurant_id
               ORDER BY fi.created_at DESC`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/items', err);
    res.status(500).json({ error: 'server' });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { restaurant_id, name, description, price, category_id, availability, image } = req.body;
    const q = `INSERT INTO food_items (restaurant_id, name, description, price, category_id, availability, image)
               VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const values = [restaurant_id, name, description || null, price, category_id || null, availability !== false, image || null];
    const { rows } = await pool.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /admin/items', err);
    res.status(500).json({ error: 'server' });
  }
});

router.put('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { restaurant_id, name, description, price, category_id, availability, image } = req.body;
    const q = `UPDATE food_items SET restaurant_id=$1, name=$2, description=$3, price=$4, category_id=$5, availability=$6, image=$7
               WHERE item_id=$8 RETURNING *`;
    const values = [restaurant_id, name, description || null, price, category_id || null, availability !== false, image || null, id];
    const { rows } = await pool.query(q, values);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /admin/items/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM food_items WHERE item_id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /admin/items/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

/**
 * ORDERS - list & update status
 */
router.get('/orders', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/orders', err);
    res.status(500).json({ error: 'server' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, payment_status } = req.body;
    const q = `UPDATE orders SET status = COALESCE($1, status), payment_status = COALESCE($2, payment_status) WHERE order_id=$3 RETURNING *`;
    const { rows } = await pool.query(q, [status || null, payment_status || null, id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /admin/orders/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

/**
 * USERS - list & edit
 */
router.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT user_id, name, email, phone, role, wallet_balance, address, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/users', err);
    res.status(500).json({ error: 'server' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone, role, address, wallet_balance } = req.body;
    const q = `UPDATE users SET name=$1, phone=$2, role=$3, address=$4, wallet_balance=COALESCE($5, wallet_balance) WHERE user_id=$6 RETURNING user_id, name, email, phone, role, wallet_balance, address`;
    const values = [name, phone, role, address, wallet_balance !== undefined ? wallet_balance : null, id];
    const { rows } = await pool.query(q, values);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /admin/users/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

/**
 * COUPONS - CRUD
 */
router.get('/coupons', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM coupons ORDER BY expiry_date DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/coupons', err);
    res.status(500).json({ error: 'server' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, description, discount_percent, expiry_date, is_active } = req.body;
    const q = `INSERT INTO coupons (code, description, discount_percent, expiry_date, is_active) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const values = [code, description || null, discount_percent || 0, expiry_date || null, is_active !== false];
    const { rows } = await pool.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /admin/coupons', err);
    res.status(500).json({ error: 'server' });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { code, description, discount_percent, expiry_date, is_active } = req.body;
    const q = `UPDATE coupons SET code=$1, description=$2, discount_percent=$3, expiry_date=$4, is_active=$5 WHERE coupon_id=$6 RETURNING *`;
    const values = [code, description || null, discount_percent || 0, expiry_date || null, is_active !== false, id];
    const { rows } = await pool.query(q, values);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /admin/coupons/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM coupons WHERE coupon_id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /admin/coupons/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

/**
 * REVIEWS moderation
 */
router.get('/reviews', async (req, res) => {
  try {
    const q = `SELECT r.review_id, r.user_id, u.name as user_name, r.restaurant_id, rest.name as restaurant_name, r.rating, r.comment, r.review_date
               FROM reviews r
               LEFT JOIN users u ON r.user_id = u.user_id
               LEFT JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id
               ORDER BY r.review_date DESC`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/reviews', err);
    res.status(500).json({ error: 'server' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM reviews WHERE review_id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /admin/reviews/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

/**
 * DELIVERIES - list & update
 */

/**
 * DELIVERIES - CREATE
 */
router.post('/deliveries', async (req, res) => {
  try {
    const { order_id, delivery_person_id, contact, delivery_status, delivery_time } = req.body;

    const q = `INSERT INTO deliveries (order_id, delivery_person_id, contact, delivery_status, delivery_time)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;

    const values = [
      order_id,
      delivery_person_id || null,
      contact || null,
      delivery_status || 'assigned',
      delivery_time || null
    ];

    const { rows } = await pool.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /admin/deliveries', err);
    res.status(500).json({ error: 'server' });
  }
});

router.get('/deliveries', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM deliveries ORDER BY delivery_time DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/deliveries', err);
    res.status(500).json({ error: 'server' });
  }
});

router.put('/deliveries/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { delivery_person_id, contact, delivery_status, delivery_time } = req.body;
    const q = `UPDATE deliveries SET delivery_person_id=$1, contact=$2, delivery_status=$3, delivery_time=$4 WHERE delivery_id=$5 RETURNING *`;
    const values = [delivery_person_id || null, contact || null, delivery_status || null, delivery_time || null, id];
    const { rows } = await pool.query(q, values);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /admin/deliveries/:id', err);
    res.status(500).json({ error: 'server' });
  }
});

export default router;
