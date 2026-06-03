import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService, authService } from '../services/api';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateMe(form);
      // Update auth context with new user data — re-use existing token
      const token = localStorage.getItem('token');
      login(res.data.user, token);
      toast.success('Profile updated');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_STYLES = {
    pending: { color: '#92400e', background: '#fef3c7' },
    paid: { color: '#065f46', background: '#d1fae5' },
    cancelled: { color: '#991b1b', background: '#fee2e2' },
    refunded: { color: '#1e3a8a', background: '#dbeafe' },
  };

  const totalSpent = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalBooks = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.items.length, 0);

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>My Account</h1>

        <div className={styles.layout}>

          {/* LEFT — Profile card + stats */}
          <aside className={styles.sidebar}>

            {/* Avatar + name */}
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className={styles.userName}>{user?.name}</h2>
              <p className={styles.userEmail}>{user?.email}</p>
              <span className={styles.roleBadge}>
                {user?.role === 'admin' ? '⚙️ Admin' : '📚 Reader'}
              </span>
            </div>

            {/* Stats */}
            <div className={styles.statsCard}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{orders.filter(o => o.status === 'paid').length}</span>
                <span className={styles.statLabel}>Orders</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>{totalBooks}</span>
                <span className={styles.statLabel}>E-books</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>₦{totalSpent.toLocaleString()}</span>
                <span className={styles.statLabel}>Spent</span>
              </div>
            </div>

            {/* Edit profile form */}
            <div className={styles.editCard}>
              <div className={styles.editHeader}>
                <h3 className={styles.editTitle}>Profile Details</h3>
                {!editMode && (
                  <button className={styles.editBtn} onClick={() => setEditMode(true)}>Edit</button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSave} className={styles.editForm}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input value={user?.email} className={styles.input} readOnly />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setEditMode(false)} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.profileInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Name</span>
                    <span className={styles.infoValue}>{user?.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{user?.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>{user?.phone || '—'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Member since</span>
                    <span className={styles.infoValue}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' }) : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT — Purchase history */}
          <main className={styles.main}>
            <h2 className={styles.libraryTitle}>My Library</h2>
            <p className={styles.librarySub}>Your purchased e-books — available for download anytime</p>

            {loadingOrders ? (
              <p className={styles.loading}>Loading your library...</p>
            ) : orders.length === 0 ? (
              <div className={styles.emptyLibrary}>
                <p>📚 Your library is empty.</p>
                <Link to="/books" className={styles.browseBtn}>Browse E-books</Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map(order => (
                  <div key={order._id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <p className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderTotal}>₦{order.totalAmount?.toLocaleString()}</span>
                        <span className={styles.orderStatus} style={STATUS_STYLES[order.status] || {}}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                    </div>

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
                            ) : (
                              <span className={styles.noDownload}>Awaiting payment</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
