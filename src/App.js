import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Route guards
import { ProtectedRoute, AdminRoute, CustomerRoute } from './components/ui/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import CheckoutPage from './pages/CheckoutPage';
import { PaymentCallbackPage, OrdersPage } from './pages/OrderPages';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Bridges AuthContext and CartContext — registers cart callbacks with auth
// so logout clears the cart and login loads the right user's cart
function CartAuthBridge() {
  const { setCartCallbacks } = useAuth();
  const { clearCart, loadUserCart } = useCart();

  useEffect(() => {
    setCartCallbacks({ clearCart, loadUserCart });
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CartAuthBridge />
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/cart" element={
                <CustomerRoute><CartPage /></CustomerRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Payment callback (Paystack redirects here — must be logged in to verify) */}
              <Route path="/payment/callback" element={
                <ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>
              } />

              {/* Customer only routes (logged in, non-admin) */}
              <Route path="/checkout" element={
                <CustomerRoute><CheckoutPage /></CustomerRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><OrdersPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminRoute><AdminDashboard /></AdminRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <h2>Page not found</h2>
                  <a href="/" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'block' }}>← Go home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                borderRadius: '8px',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
