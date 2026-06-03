import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService, orderService } from '../services/api';
import { useCart } from '../context/CartContext';
import styles from './OrderPages.module.css';

// ---- Payment Callback Page ----
export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const { clearCart } = useCart();

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    // No reference means someone navigated here directly — not a real callback
    if (!reference) {
      setStatus('failed');
      return;
    }

    paymentService.verify(reference)
      .then(res => {
        if (res.data.status === 'success') {
          clearCart();
          setStatus('success');
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('failed'));
  }, []);

  if (status === 'verifying') {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={styles.center}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.heading}>Payment Successful!</h1>
        <p className={styles.sub}>Your e-books are ready. Go to your library to download them.</p>
        <div className={styles.actions}>
          <Link to="/profile" className={styles.primaryBtn}>Go to My Library</Link>
          <Link to="/books" className={styles.secondaryBtn}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.center}>
      <div className={styles.failIcon}>✕</div>
      <h1 className={styles.heading}>Payment Failed</h1>
      <p className={styles.sub}>Something went wrong. Your card was not charged.</p>
      <Link to="/checkout" className={styles.primaryBtn}>Try Again</Link>
    </div>
  );
}

// ---- My Orders Page (used inside Profile) ----
export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const STATUS_STYLES = {
    pending: { color: '#92400e', background: '#fef3c7' },
    paid: { color: '#065f46', background: '#d1fae5' },
    cancelled: { color: '#991b1b', background: '#fee2e2' },
    refunded: { color: '#1e3a8a', background: '#dbeafe' },
  };

  return (
    <div className="container">
      <div className={styles.ordersPage}>
        <h1 className={styles.ordersTitle}>My Library</h1>
        <p className={styles.ordersSub}>Your purchased e-books — download anytime</p>

        {loading ? (
          <p>Loading your library...</p>
        ) : orders.length === 0 ? (
          <div className={styles.emptyOrders}>
            <p>📚 You haven't purchased any e-books yet.</p>
            <Link to="/books" className={styles.primaryBtn}>Browse Books</Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map(order => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <p className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span
                    className={styles.orderStatus}
                    style={STATUS_STYLES[order.status] || {}}
                  >
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </div>

                {/* Books in this order */}
                <div className={styles.bookList}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className={styles.bookRow}>
                      <div className={styles.bookInfo}>
                        <span className={styles.bookTitle}>{item.book?.title || 'E-book'}</span>
                        <span className={styles.bookAuthor}>by {item.book?.author}</span>
                        {item.book?.fileFormat && (
                          <span className={styles.formatBadge}>{item.book.fileFormat}</span>
                        )}
                      </div>
                      <div className={styles.bookActions}>
                        <span className={styles.bookPrice}>₦{item.price?.toLocaleString()}</span>
                        {order.status === 'paid' && item.downloadUrl ? (
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadBtn}
                            download
                          >
                            ↓ Download
                          </a>
                        ) : order.status === 'paid' ? (
                          <span className={styles.noDownload}>Link coming soon</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <strong>Total: ₦{order.totalAmount?.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
