import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>📚 BookHaven</span>
          <p>Your local online bookstore. Quality books, secure payments, delivered to you.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Browse</h4>
            <Link to="/books?category=fiction">Fiction</Link>
            <Link to="/books?category=non-fiction">Non-Fiction</Link>
            <Link to="/books?category=academic">Academic</Link>
            <Link to="/books?category=local">Local Authors</Link>
          </div>
          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/orders">My Orders</Link>
          </div>
          <div className={styles.col}>
            <h4>Info</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} BookHaven. All rights reserved.</p>
      </div>
    </footer>
  );
}
