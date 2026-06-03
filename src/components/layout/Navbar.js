import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>BookHaven</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className={styles.links}>
          <NavLink to="/books" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Browse
          </NavLink>
          <NavLink to="/books?category=fiction" className={styles.link}>Fiction</NavLink>
          <NavLink to="/books?category=academic" className={styles.link}>Academic</NavLink>
          <NavLink to="/books?category=local" className={styles.link}>Local Authors</NavLink>
        </nav>

        {/* Right side actions */}
        <div className={styles.actions}>
          {/* Cart — hidden for admin */}
          {user?.role !== 'admin' && (
            <Link to="/cart" className={styles.cartBtn} aria-label="Shopping cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <span className={styles.badge}>{totalItems}</span>
              )}
            </Link>
          )}

          {/* Auth */}
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div className={styles.avatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <span className={styles.dropdownName}>{user?.name}</span>
                  {user?.role === 'admin' ? (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link to="/profile" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>My Profile</Link>
                      <Link to="/orders" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>My Library</Link>
                    </>
                  )}
                  <button className={styles.dropdownLogout} onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginBtn}>Login</Link>
              <Link to="/register" className={styles.registerBtn}>Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className={styles.mobileToggle} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
