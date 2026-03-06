import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// import routes
import authRoutes from './routes/auth.js';
import restaurantsRoutes from './routes/restaurants.js';
import itemsRoutes from './routes/items.js';
import favouritesRoutes from './routes/favourites.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import reviewsRoutes from './routes/reviews.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import uploadsRoutes from './routes/uploads.js';
import couponsRoutes from './routes/coupons.js';

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/coupons', couponsRoutes);

app.get('/api/ping', (req,res) => res.json({ ok: true }));

const frontendPath = path.join(__dirname, '../frontend');

// Serve all static files (HTML/CSS/JS/Images) from frontendPath
app.use(express.static(frontendPath));

// Root -> serve frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
