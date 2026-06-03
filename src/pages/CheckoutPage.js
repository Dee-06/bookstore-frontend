import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api';
import toast from 'react-hot-toast';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Your cart is empty');
    setLoading(true);

    try {
      // 1. Create order
      const orderRes = await orderService.create({
        items: items.map(i => ({ book: i._id, quantity: i.quantity, price: i.price })),
        totalAmount: totalPrice,
      });
      const order = orderRes.data.order;

      // 2. Initiate Paystack payment
      const payRes = await paymentService.initiate({
        orderId: order._id,
        amount: totalPrice,
        email: user.email,
      });

      // 3. Redirect to Paystack — use replace to fully leave the React app
      const authUrl = payRes.data.authorizationUrl;
      if (!authUrl) {
        throw new Error('No authorization URL returned from Paystack');
      }
      toast.success('Redirecting to Paystack...');
      setTimeout(() => {
        window.location.replace(authUrl);
      }, 500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.layout}>
          {/* Account info — no delivery form needed for e-books */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Account Details</h2>
            <p className={styles.ebookNote}>
              📥 This is a digital purchase. Your e-books will be available for download immediately after payment.
            </p>

            <div className={styles.accountCard}>
              <div className={styles.accountAvatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.accountDetails}>
                <p className={styles.accountName}>{user?.name}</p>
                <p className={styles.accountEmail}>{user?.email}</p>
              </div>
            </div>

            <div className={styles.infoBox}>
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxIcon}>📧</span>
                <div>
                  <p className={styles.infoBoxLabel}>Download links will be sent to</p>
                  <p className={styles.infoBoxValue}>{user?.email}</p>
                </div>
              </div>
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxIcon}>⚡</span>
                <div>
                  <p className={styles.infoBoxLabel}>Availability</p>
                  <p className={styles.infoBoxValue}>Instant access after payment</p>
                </div>
              </div>
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxIcon}>🔒</span>
                <div>
                  <p className={styles.infoBoxLabel}>Security</p>
                  <p className={styles.infoBoxValue}>256-bit SSL encrypted payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside className={styles.summary}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>

            <div className={styles.itemList}>
              {items.map(item => (
                <div key={item._id} className={styles.orderItem}>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.title}</span>
                    <span className={styles.itemFormat}>{item.fileFormat || 'PDF'}</span>
                  </div>
                  <span className={styles.itemAmt}>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>Total</span>
              <strong>₦{totalPrice.toLocaleString()}</strong>
            </div>

            <div className={styles.paystackNote}>
              <span>🔒 Secured by Paystack</span>
            </div>

            <button
              onClick={handlePayment}
              className={styles.payBtn}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ₦${totalPrice.toLocaleString()}`}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
