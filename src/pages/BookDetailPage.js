import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/api';
import toast from 'react-hot-toast';
import styles from './BookDetailPage.module.css';

export default function BookDetailPage() {
  const { id } = useParams();
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const inCart = items.some(i => i._id === id);

  useEffect(() => {
    bookService.getById(id)
      .then(res => setBook(res.data.book))
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!book) return (
    <div className={styles.notFound}>
      <h2>Book not found</h2>
      <Link to="/books">← Back to Books</Link>
    </div>
  );

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(book);
    if (!inCart) {
      toast.success(`"${book.title}" added to cart`);
    } else {
      toast.success(`Cart updated`);
    }
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <Link to="/books" className={styles.backLink}>← Back to Books</Link>

        <div className={styles.detail}>
          {/* Cover */}
          <div className={styles.coverWrap}>
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className={styles.cover} />
            ) : (
              <div className={styles.coverPlaceholder}>
                {book.title.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.category}>{book.category}</span>
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>by <strong>{book.author}</strong></p>

            {book.isbn && <p className={styles.meta}>ISBN: {book.isbn}</p>}
            {book.publisher && <p className={styles.meta}>Publisher: {book.publisher}</p>}
            {book.year && <p className={styles.meta}>Year: {book.year}</p>}
            {book.pages && <p className={styles.meta}>Pages: {book.pages}</p>}
            {book.fileFormat && <p className={styles.meta}>Format: {book.fileFormat}</p>}

            <p className={styles.description}>{book.description || 'No description available.'}</p>

            {/* Admin sees edit shortcut instead of purchase box */}
            {isAdmin ? (
              <div className={styles.adminNotice}>
                <p className={styles.adminNoticeTitle}>⚙️ Admin View</p>
                <p className={styles.adminNoticeText}>
                  You are viewing this book as an admin. Admins cannot purchase books.
                </p>
                <Link to="/admin" className={styles.adminEditLink}>
                  Edit this book in Admin Panel →
                </Link>
              </div>
            ) : (
              <div className={styles.purchaseBox}>
                <p className={styles.price}>₦{book.price?.toLocaleString()}</p>

                <div className={styles.qtyWrap}>
                  <label htmlFor="qty" className={styles.qtyLabel}>Quantity</label>
                  <div className={styles.qtyControls}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className={styles.qtyBtn}>−</button>
                    <span className={styles.qtyNum}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className={styles.qtyBtn}>+</button>
                  </div>
                </div>

                <button
                  className={`${styles.addBtn} ${inCart ? styles.inCart : ''}`}
                  onClick={handleAddToCart}
                >
                  {inCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <Link to="/cart" className={styles.viewCartLink}>View Cart →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

