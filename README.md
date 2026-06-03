# BookHaven — Frontend

React.js frontend for the BookHaven online bookstore with Paystack e-payment integration.

## Stack
- **React 18** (Create React App)
- **React Router v6** — client-side routing
- **Axios** — API calls with JWT interceptor
- **React Hot Toast** — notifications
- **CSS Modules** — component-scoped styles

## Project Structure

```
src/
├── components/
│   ├── layout/        # Navbar, Footer
│   ├── ui/            # ProtectedRoute, AdminRoute
│   └── book/          # BookCard
├── context/
│   ├── AuthContext.js  # Global auth state (JWT + user)
│   └── CartContext.js  # Cart state (persisted to localStorage)
├── pages/
│   ├── HomePage.js
│   ├── BooksPage.js    # Browse + filter + search
│   ├── BookDetailPage.js
│   ├── CartPage.js
│   ├── AuthPages.js    # Login + Register
│   ├── CheckoutPage.js # Paystack payment trigger
│   ├── OrderPages.js   # Payment callback + My Orders
│   └── admin/
│       └── AdminDashboard.js  # CRUD books + manage orders
├── services/
│   └── api.js          # All Axios service calls
└── App.js              # Routes
```

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm start
```

## Routes

| Path | Description | Auth |
|------|-------------|------|
| `/` | Home / landing | Public |
| `/books` | Browse + filter | Public |
| `/books/:id` | Book detail | Public |
| `/cart` | Shopping cart | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/checkout` | Place order + pay | 🔐 User |
| `/orders` | My order history | 🔐 User |
| `/payment/callback` | Paystack callback | Public |
| `/admin` | Admin dashboard | 🔐 Admin |

## API Services (`src/services/api.js`)

All backend API calls are centralized here. JWT token is attached automatically.

- `authService` — register, login, getMe
- `bookService` — CRUD books, search, filter
- `orderService` — create order, get orders, update status
- `paymentService` — initiate Paystack, verify payment

## Paystack Flow

1. User fills checkout → POST `/api/orders` → creates order
2. POST `/api/payment/initiate` → backend returns `authorizationUrl`
3. Frontend redirects to Paystack hosted checkout
4. Paystack redirects to `/payment/callback?reference=xxx`
5. Frontend calls GET `/api/payment/verify/:reference`
6. On success: cart cleared, user sees success screen

## Backend API Expected Responses

### POST /api/auth/login
```json
{ "user": { "_id": "...", "name": "...", "email": "...", "role": "user" }, "token": "jwt..." }
```

### GET /api/books
```json
{ "books": [...], "total": 50, "page": 1, "totalPages": 5 }
```

### POST /api/payment/initiate
```json
{ "authorizationUrl": "https://checkout.paystack.com/...", "reference": "..." }
```
