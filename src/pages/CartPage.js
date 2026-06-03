import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container">
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse our collection and add something you love.</p>
          <Link to="/books" className={styles.browseBtn}>Browse Books</Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <button onClick={clearCart} className={styles.clearBtn}>Clear cart</button>
        </div>

        <div className={styles.layout}>
          {/* Cart items */}
          <div className={styles.items}>
            {items.map(item => (
              <div key={item._id} className={styles.item}>
                {/* Cover thumbnail */}
                <div className={styles.thumb}>
                  {item.coverImage
                    ? <img src={item.coverImage} alt={item.title} />
                    : <div className={styles.thumbPlaceholder}>{item.title.charAt(0)}</div>
                  }
                </div>

                {/* Details */}
                <div className={styles.itemInfo}>
                  <Link to={`/books/${item._id}`} className={styles.itemTitle}>{item.title}</Link>
                  <p className={styles.itemAuthor}>by {item.author}</p>
                  <p className={styles.itemPrice}>₦{item.price?.toLocaleString()} each</p>
                </div>

                {/* Quantity */}
                <div className={styles.qtyControls}>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className={styles.qtyBtn}>−</button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className={styles.qtyBtn}>+</button>
                </div>

                {/* Line total */}
                <p className={styles.lineTotal}>₦{(item.price * item.quantity).toLocaleString()}</p>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item._id)}
                  className={styles.removeBtn}
                  aria-label="Remove item"
                >✕</button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Items ({totalItems})</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            {/* <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span className={styles.free}>FREE</span>
            </div> */}

            <div className={styles.summaryDivider} />

            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>

            <button onClick={handleCheckout} className={styles.checkoutBtn}>
              Proceed to Checkout
            </button>

            {!isAuthenticated && (
              <p className={styles.loginNote}>
                You'll need to <Link to="/login">log in</Link> to complete your order.
              </p>
            )}
            <p className={styles.ebookNote}>
              📥 Digital purchase — download instantly after payment
            </p>

            <Link to="/books" className={styles.continueLink}>← Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
