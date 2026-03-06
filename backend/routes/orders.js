import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.post('/place', authMiddleware, async (req, res) => {
  const { restaurant_id, delivery_address, payment_method, coupon_code } = req.body;
  try {
    const cartRes = await pool.query('SELECT cart_id FROM carts WHERE user_id=$1', [req.user.user_id]);
    if (!cartRes.rows.length) return res.status(400).json({ error: 'cart empty' });
    const cartId = cartRes.rows[0].cart_id;
    const itemsRes = await pool.query('SELECT * FROM cart_items WHERE cart_id=$1', [cartId]);
    if (!itemsRes.rows.length) return res.status(400).json({ error: 'cart empty' });
    let subtotal = 0;
    itemsRes.rows.forEach(it => { subtotal += Number(it.price) * Number(it.quantity); });
    let total = subtotal;
    if (coupon_code && String(coupon_code).trim()) {
      const couponRes = await pool.query(
        'SELECT discount_percent FROM coupons WHERE UPPER(code)=$1 AND is_active=true AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)',
        [String(coupon_code).trim().toUpperCase()]
      );
      if (couponRes.rows.length) {
        const pct = Number(couponRes.rows[0].discount_percent) || 0;
        total = Math.max(0, subtotal * (1 - pct / 100));
      }
    }
    const ord = await pool.query('INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address, payment_status) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.user.user_id, restaurant_id, total, delivery_address, 'paid']);
    const orderId = ord.rows[0].order_id;
    const insertPromises = itemsRes.rows.map(it => pool.query('INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ($1,$2,$3,$4)', [orderId, it.item_id, it.quantity, it.price]));
    await Promise.all(insertPromises);
    await pool.query('INSERT INTO payments (order_id, payment_method, amount, payment_status) VALUES ($1,$2,$3,$4)', [orderId, payment_method, total, 'success']);
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]);
    res.json({ ok: true, order_id: orderId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.user_id]);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const orderId = req.params.id;
  try {
    const ordRes = await pool.query('SELECT * FROM orders WHERE order_id=$1 AND user_id=$2', [orderId, req.user.user_id]);
    if (!ordRes.rows.length) return res.status(404).json({ error: 'not found' });
    const order = ordRes.rows[0];
    const itemsRes = await pool.query(
      'SELECT oi.quantity, oi.price, fi.name, fi.image FROM order_items oi LEFT JOIN food_items fi ON oi.item_id=fi.item_id WHERE oi.order_id=$1',
      [orderId]
    );
    res.json({ ...order, items: itemsRes.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
