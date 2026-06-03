import React, { useState, useEffect } from 'react';
import { bookService, orderService, uploadService } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './AdminDashboard.module.css';

const EMPTY_BOOK = { title: '', author: '', price: '', category: 'fiction', description: '', isbn: '', publisher: '', year: '', pages: '', fileFormat: 'PDF', downloadUrl: '', coverImage: '' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_BOOK);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

   const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show local preview immediately
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setForm(f => ({ ...f, coverImage: res.data.url }));
      toast.success('Cover image uploaded');
    } catch {
      toast.error('Image upload failed. Please try again.');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (tab === 'books') fetchBooks();
    if (tab === 'orders') fetchOrders();
  }, [tab]);

  const fetchBooks = () => {
    bookService.getAll({ limit: 100 })
      .then(r => setBooks(r.data.books || []))
      .catch(() => {});
  };

  const fetchOrders = () => {
    orderService.getAll()
      .then(r => setOrders(r.data.orders || []))
      .catch(() => {});
  };

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm(EMPTY_BOOK); setShowForm(true); };
  const openEdit = (book) => { setEditing(book._id); setForm({ ...EMPTY_BOOK, ...book, price: book.price?.toString(), pages: book.pages?.toString(), year: book.year?.toString() }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      pages: form.pages ? parseInt(form.pages) : undefined,
      year: form.year ? parseInt(form.year) : undefined,
    };
    // remove empty strings
    Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k]);
    try {
      if (editing) {
        await bookService.update(editing, payload);
        toast.success('Book updated');
      } else {
        await bookService.create(payload);
        toast.success('Book added');
      }
      setShowForm(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await bookService.delete(id);
      toast.success('Book deleted');
      fetchBooks();
    } catch { toast.error('Delete failed'); }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Admin Panel</h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'books' ? styles.activeTab : ''}`} onClick={() => setTab('books')}>Books</button>
          <button className={`${styles.tab} ${tab === 'orders' ? styles.activeTab : ''}`} onClick={() => setTab('orders')}>Orders</button>
        </div>

        {/* Books Tab */}
        {tab === 'books' && (
          <div>
            <div className={styles.tabHeader}>
              <p className={styles.tabCount}>{books.length} books</p>
              <button className={styles.addBtn} onClick={openAdd}>+ Add Book</button>
            </div>

            {/* Book Form Modal */}
            {showForm && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>{editing ? 'Edit Book' : 'Add New Book'}</h2>
                <form onSubmit={handleSave} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.label}>Title *</label>
                      <input name="title" required value={form.title} onChange={handleFormChange} className={styles.input} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Author *</label>
                      <input name="author" required value={form.author} onChange={handleFormChange} className={styles.input} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Price (₦) *</label>
                      <input name="price" type="number" required min="0" value={form.price} onChange={handleFormChange} className={styles.input} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Category</label>
                      <select name="category" value={form.category} onChange={handleFormChange} className={styles.input}>
                        {['fiction','non-fiction','academic','local','children','business'].map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>File Format</label>
                      <select name="fileFormat" value={form.fileFormat} onChange={handleFormChange} className={styles.input}>
                        {['PDF','EPUB','MOBI'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Pages</label>
                      <input name="pages" type="number" min="1" value={form.pages} onChange={handleFormChange} className={styles.input} placeholder="e.g. 320" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>ISBN</label>
                      <input name="isbn" value={form.isbn} onChange={handleFormChange} className={styles.input} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Publisher</label>
                      <input name="publisher" value={form.publisher} onChange={handleFormChange} className={styles.input} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Year</label>
                      <input name="year" type="number" value={form.year} onChange={handleFormChange} className={styles.input} placeholder="e.g. 2023" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Featured</label>
                      <select name="featured" value={form.featured} onChange={handleFormChange} className={styles.input}>
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                      </select>
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                      <label className={styles.label}>Cover Image</label>
                      {/* Image preview */}
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Cover preview"
                          className={styles.coverPreview}
                        />
                      )}
                      {/* File upload */}
                      <div className={styles.uploadRow}>
                        <label className={styles.uploadBtn}>
                          {uploading ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Cover Image'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {imagePreview && (
                          <button
                            type="button"
                            className={styles.removeImgBtn}
                            onClick={() => { setImagePreview(''); setForm(f => ({ ...f, coverImage: '' })); }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {/* Fallback URL input */}
                      <input
                        name="coverImage"
                        value={form.coverImage}
                        onChange={e => { handleFormChange(e); setImagePreview(e.target.value); }}
                        className={styles.input}
                        placeholder="Or paste an image URL directly"
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                      <label className={styles.label}>Download URL *</label>
                      <input name="downloadUrl" value={form.downloadUrl} onChange={handleFormChange} className={styles.input} placeholder="https://drive.google.com/... or direct PDF link" />
                      <span style={{fontSize:'11px', color:'var(--ink-muted)', marginTop:'3px'}}>Paste a Google Drive, Dropbox, or direct PDF/EPUB link. Users see this only after purchase.</span>
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                      <label className={styles.label}>Description</label>
                      <textarea name="description" rows={3} value={form.description} onChange={handleFormChange} className={styles.textarea} />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>{loading ? 'Saving...' : 'Save Book'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* Books Table */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th><th>Author</th><th>Category</th><th>Format</th><th>Price</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book._id}>
                      <td className={styles.bookTitle}>{book.title}</td>
                      <td>{book.author}</td>
                      <td><span className={styles.catBadge}>{book.category}</span></td>
                      <td><span className={styles.catBadge}>{book.fileFormat || 'PDF'}</span></td>
                      <td>₦{book.price?.toLocaleString()}</td>
                      <td className={styles.actionCell}>
                        <button onClick={() => openEdit(book)} className={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(book._id)} className={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            <p className={styles.tabCount}>{orders.length} orders</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Update</th></tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</td>
                      <td>{order.user?.name || '—'}</td>
                      <td>₦{order.totalAmount?.toLocaleString()}</td>
                      <td><span className={`${styles.statusBadge} ${styles[order.status]}`}>{order.status}</span></td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={e => handleOrderStatus(order._id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          {['pending','paid','cancelled','refunded'].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}