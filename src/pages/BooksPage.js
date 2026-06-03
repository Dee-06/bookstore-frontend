import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/book/BookCard';
import { bookService } from '../services/api';
import styles from './BooksPage.module.css';

const CATEGORIES = ['All', 'fiction', 'non-fiction', 'academic', 'local', 'children', 'business'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Title A–Z', value: 'title_asc' },
];

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const searchQ = searchParams.get('search') || '';
  const categoryQ = searchParams.get('category') || '';
  const sortQ = searchParams.get('sort') || 'newest';
  const pageQ = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(searchQ);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    const params = {
      page: pageQ,
      sort: sortQ,
      ...(searchQ && { search: searchQ }),
      ...(categoryQ && categoryQ !== 'All' && { category: categoryQ }),
    };
    bookService.getAll(params)
      .then(res => {
        setBooks(res.data.books || []);
        setPagination({
          page: res.data.page || 1,
          totalPages: res.data.totalPages || 1,
          total: res.data.total || 0,
        });
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [searchQ, categoryQ, sortQ, pageQ]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Categories</h3>
          <ul className={styles.categoryList}>
            {CATEGORIES.map(cat => (
              <li key={cat}>
                <button
                  className={`${styles.catBtn} ${(categoryQ || 'All') === cat ? styles.catActive : ''}`}
                  onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                type="search"
                placeholder="Search books, authors..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>Go</button>
            </form>

            <div className={styles.sortWrap}>
              <label htmlFor="sort" className={styles.sortLabel}>Sort by</label>
              <select
                id="sort"
                value={sortQ}
                onChange={e => updateParam('sort', e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results info */}
          {!loading && (
            <p className={styles.resultsInfo}>
              {pagination.total > 0
                ? `Showing ${books.length} of ${pagination.total} books`
                : 'No books found'}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : books.length > 0 ? (
            <div className={styles.grid}>
              {books.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No books match your search.</p>
              <button onClick={() => setSearchParams({})} className={styles.clearBtn}>Clear filters</button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => updateParam('page', pageQ - 1)}
                disabled={pageQ === 1}
                className={styles.pageBtn}
              >← Prev</button>

              <span className={styles.pageInfo}>Page {pageQ} of {pagination.totalPages}</span>

              <button
                onClick={() => updateParam('page', pageQ + 1)}
                disabled={pageQ === pagination.totalPages}
                className={styles.pageBtn}
              >Next →</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
