# FoodHungama

A full-stack **food delivery / restaurant** web application. Customers can browse restaurants, add items to cart, apply coupons, place orders, and leave reviews. Admins manage restaurants, menu items, orders, users, coupons, reviews, and deliveries through a dedicated admin panel.

---

## Features

### Customer (frontend)
- **Auth** — Sign up, login (email + password)
- **Home** — Browse restaurants (with images and ratings), search
- **Restaurant / Menu** — View food items by category, add/remove from cart, see cart summary
- **Favourites** — Save favourite restaurants
- **Reviews** — View and submit restaurant reviews (rating 1–5 + comment)
- **Cart** — Side drawer with items per restaurant, remove restaurant, go to checkout
- **Payment** — Order summary, coupon code, delivery info, payment method (e.g. Cash on Delivery), place order
- **Order confirmation** — Success page with order ID and items
- **Profile** — View profile; **Options** — Logout

### Admin (frontend `/admin`)
- **Dashboard** — Quick links and server ping
- **Restaurants** — CRUD, optional image URL
- **Items** — CRUD, optional image URL, link to restaurant
- **Orders** — List, update status
- **Users** — List, edit (name, phone, role, wallet, address)
- **Coupons** — CRUD (code, discount %, expiry, active)
- **Reviews** — List, delete
- **Deliveries** — List, create, edit

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Backend  | **Node.js**, **Express**, **PostgreSQL** (with `pg`) |
| Auth     | **JWT**, **bcrypt** |
| Frontend | Vanilla **HTML / CSS / JavaScript** (ES modules), no framework |
| Other    | **CORS**, **dotenv**, **multer** (uploads), **uuid** |

---

## Project structure

```
DB_Project_Complete/
├── backend/
│   ├── server.js           # Express app, static frontend, API routes
│   ├── db/
│   │   └── pool.js         # PostgreSQL connection pool
│   ├── middleware/         # auth, role (admin)
│   ├── routes/             # auth, restaurants, items, cart, orders, reviews, users, admin, coupons, uploads
│   ├── migrations/
│   │   └── init.sql        # DB schema (tables)
│   ├── seed/
│   │   └── seed.sql        # Sample data (optional)
│   ├── scripts/
│   │   ├── run-init.js     # Run init.sql
│   │   ├── run-seed.js     # Run seed.sql
│   │   └── create-admin.js # Create admin user
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html          # Login
│   ├── signup.html
│   ├── home.html            # Restaurant list
│   ├── food.html             # Restaurant menu + cart + reviews
│   ├── payment.html          # Checkout
│   ├── order-confirm.html    # Order success
│   ├── profile.html
│   ├── options.html
│   ├── favourite.html
│   ├── admin/                # Admin UI (dashboard, restaurants, items, orders, users, coupons, reviews, deliveries)
│   ├── Scripts/              # index, signup, home, food, general, payment, order-confirm, profile, etc.
│   ├── Styles/
│   └── Images/
└── README.md
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **PostgreSQL** (create a database, e.g. `foodhungama`)

---

## Setup

### 1. Clone / open project

```bash
cd DB_Project_Complete
```

### 2. Backend env and install

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — PostgreSQL connection string, e.g.  
  `postgres://USER:PASSWORD@localhost:5432/foodhungama`
- `JWT_SECRET` — Strong random string for JWT signing
- `PORT` — Server port (default `4000`)
- `BCRYPT_SALT_ROUNDS` — Optional (default 10)

```bash
npm install
```

### 3. Database

Create the database in PostgreSQL, then:

```bash
# Create tables (migrations/init.sql)
npm run init-db

# Optional: seed data
npm run seed-db

# Create an admin user (prompts for email + password)
npm run create-admin
```

### 4. Run the app

```bash
npm start
```

Or, for development with auto-restart:

```bash
npm run dev
```

- App: **http://localhost:4000**
- Frontend is served from `frontend/`; API is under **http://localhost:4000/api**

---

## Environment variables (.env)

| Variable          | Description                          | Example |
|-------------------|--------------------------------------|---------|
| `PORT`            | Server port                          | `4000`  |
| `DATABASE_URL`    | PostgreSQL connection string         | `postgres://user:pass@localhost:5432/foodhungama` |
| `JWT_SECRET`      | Secret for signing JWTs              | Long random string |
| `BCRYPT_SALT_ROUNDS` | Rounds for password hashing       | `10`    |

---

## API overview

| Base path        | Description |
|------------------|-------------|
| `POST /api/auth/login`   | Login (email, password) → token + user |
| `POST /api/auth/signup` | Sign up → token + user |
| `GET /api/restaurants`  | List restaurants (public) |
| `GET /api/restaurants/:id` | One restaurant (public) |
| `GET /api/items/by-restaurant/:resid` | Menu items for restaurant (public) |
| `GET/POST /api/cart`     | Get cart / add item (auth) |
| `POST /api/cart/remove`  | Remove item from cart (auth) |
| `POST /api/orders/place` | Place order (auth); optional `coupon_code` |
| `GET /api/orders`        | My orders (auth) |
| `GET /api/orders/:id`    | One order with items (auth) |
| `GET /api/reviews/by-restaurant/:resid` | Reviews for restaurant (public) |
| `POST /api/reviews`      | Submit review (auth) |
| `GET /api/favourites`    | My favourites (auth) |
| `POST /api/favourites`   | Add favourite (auth) |
| `GET /api/coupons/validate?code=XXX` | Validate coupon (public) → `{ valid, discount_percent }` |
| `GET /api/ping`          | Health check → `{ ok: true }` |
| `/api/admin/*`           | Restaurants, items, orders, users, coupons, reviews, deliveries (auth + admin role) |

---

## Frontend pages (customer)

| Page               | Path                | Purpose |
|--------------------|---------------------|--------|
| Login              | `/` or `index.html` | Sign in |
| Sign up            | `signup.html`       | Register |
| Home               | `home.html`         | Restaurant list, search |
| Restaurant / Menu  | `food.html?resid=...` | Menu, cart, reviews, checkout entry |
| Payment            | `payment.html?resid=...` | Checkout, coupon, place order |
| Order confirmed    | `order-confirm.html?order_id=...` | Order success |
| Profile            | `profile.html`      | User info |
| Options            | `options.html`      | Logout |
| Favourites         | `favourite.html`    | Saved restaurants |

---

## Admin

- **Login:** `admin/login.html` (user must have role `admin`).
- **Dashboard:** `admin/dashboard.html` — links to Restaurants, Items, Orders, Users, Coupons, Reviews, Deliveries.
- All admin API calls require `Authorization: Bearer <token>` and admin role.

---

## Image URLs

- **Restaurants** and **food items** support an optional **image URL** (e.g. `https://...`).
- In **Admin** → Restaurants / Items, use the “Image URL” field when creating or editing; the URL is stored and shown on the customer frontend (home, menu, cart, payment, order confirm).

---

## License

This project is for educational use (e.g. FAST University full-stack / DB course).
