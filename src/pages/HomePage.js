import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../components/book/BookCard';
import { bookService } from '../services/api';
import styles from './HomePage.module.css';
import { useAuth } from './..//context/AuthContext';
import hallmarkLogo from './../assets/hallmark.png';

const CATEGORIES = [
  { label: 'Fiction', icon: '✨', value: 'fiction' },
  { label: 'Academic', icon: '🎓', value: 'academic' },
  { label: 'Non-Fiction', icon: '🔍', value: 'non-fiction' },
  { label: 'Local Authors', icon: '🌍', value: 'local' },
  { label: 'Children', icon: '🌈', value: 'children' },
  { label: 'Business', icon: '📊', value: 'business' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    bookService.getAll({ limit: 8, sort: 'newest' })
      .then(res => setFeatured(res.data.books || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/books?search=${encodeURIComponent(search)}`);
  };

  return (
     <>
    {/* University Banner */}
    <div
  style={{
    background: '#1a1a2e',
    color: 'white',
    textAlign: 'center',
    padding: '10px 20px',
    fontSize: '0.85rem',
    letterSpacing: '0.03em',
    lineHeight: '1.6',
  }}
>
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '15px',
    }}
  >
    <img
      src={hallmarkLogo}
      alt="Hallmark University Logo"
      style={{
        width: '150px',
        height: '150px',
        objectFit: 'contain',
      }}
    />

    <div>
      <p style={{ margin: 0, fontWeight: 'bold', fontSize:'1.8rem'}}>
        Hallmark University
      </p>

      <p style={{ margin: 0, opacity: 0.8, fontSize:'1.2rem', fontWeight:'600' }}>
        A Localised Online Bookstore
      </p>
    </div>
  </div>
</div>

    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Your Local Bookstore, Online</p>
            <h1 className={styles.heroTitle}>
              Discover stories <br />
              <em>worth reading</em>
            </h1>
            <p className={styles.heroSub}>
              Browse thousands of books — from bestselling fiction to local authors.
              Secure payment, fast delivery.
            </p>

            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search by title, author, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
                aria-label="Search books"
              />
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.bookStack}>
              <div className={styles.bookSpine} style={{ background: '#c9622f', height: 180 }}>The Art of Fiction</div>
              <div className={styles.bookSpine} style={{ background: '#1a1a2e', height: 200 }}>Modern Nigeria</div>
              <div className={styles.bookSpine} style={{ background: '#2d7a5a', height: 160 }}>Academic Excellence</div>
              <div className={styles.bookSpine} style={{ background: '#c9a84c', height: 190 }}>Local Voices</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.value}
              to={`/books?category=${cat.value}`}
              className={styles.categoryCard}
            >
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catLabel}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>New Arrivals</h2>
          <Link to="/books" className={styles.viewAll}>View all →</Link>
        </div>

        {loading ? (
          <div className={styles.booksGrid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className={styles.booksGrid}>
            {featured.map(book => <BookCard key={book._id} book={book} />)}
          </div>
        ) : (
          <p className={styles.empty}>No books yet. Check back soon!</p>
        )}
      </section>

      {/* CTA Banner
      <section className={styles.cta}>
        <div className="container">
          <h2>Payments made easy</h2>
          <p>We support Paystack, bank transfers, and more — all secure, all fast.</p>
          <Link to="/register" className={styles.ctaBtn}>Create Free Account</Link>
        </div>
      </section> */}

            {/* Replace the CTA section with this: */}
      <section className={styles.cta}>
        <div className="container">
          <h2>Payments made easy</h2>
          <p>We support Paystack, bank transfers, and more — all secure, all fast.</p>
          {!isAuthenticated && (
            <Link to="/register" className={styles.ctaBtn}>Create Free Account</Link>
          )}
        </div>
      </section>
    </div>
      </>
  );
}
