import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './BookCard.module.css';

export default function BookCard({ book }) {
  const { addItem, items } = useCart();
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const inCart = items.some(i => i._id === book._id);

  const handleAddToCart = (e) => {
    e.preventDefault(); // don't navigate on button click
    // Block if auth hasn't resolved or user is admin
    if (loading || isAdmin) return;
    addItem(book);
    if (!inCart) {
      toast.success(`"${book.title}" added to cart`);
    }
  };

  // Don't render cart button until auth state is known
  const showCartBtn = !loading && !isAdmin;

  return (
    <Link to={`/books/${book._id}`} className={styles.card}>
      <div className={styles.cover}>
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} />
        ) : (
          <div className={styles.coverPlaceholder}>
            <span>{book.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.category}>{book.category}</p>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>by {book.author}</p>

        <div className={styles.footer}>
          <span className={styles.price}>₦{book.price?.toLocaleString()}</span>
          <button
            className={`${styles.addBtn} ${inCart ? styles.inCart : ''}`}
            onClick={handleAddToCart}
            aria-label={inCart ? 'Already in cart' : 'Add to cart'}
          >
            {inCart ? '✓ In Cart' : '+ Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
