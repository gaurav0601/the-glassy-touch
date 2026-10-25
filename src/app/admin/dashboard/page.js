'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageCropper from '@/components/ImageCropper';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [token, setToken] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/edit product form
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode, object = edit mode
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', original_price: '', category: 'crockery', featured: false, in_stock: true,
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const fileInputRef = useRef(null);

  // Image cropper state
  const [cropperImage, setCropperImage] = useState(null); // data URL to crop
  const [rawFile, setRawFile] = useState(null); // raw file before crop

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      router.push('/admin/login');
      return;
    }
    setToken(t);
    fetchData(t);
  }, [router]);

  const authHeaders = (t) => ({
    'Authorization': `Bearer ${t || token}`,
    'Content-Type': 'application/json',
  });

  const fetchData = async (t) => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers: { 'Authorization': `Bearer ${t}` } }),
      ]);
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      if (prodData.success) setProducts(prodData.products);
      if (orderData.success) setOrders(orderData.orders);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; Max-Age=0; path=/';
    router.push('/admin/login');
  };

  // ========== IMAGE HANDLING ==========

  // Compress image client-side
  const compressImage = (file, maxWidth = 1200, maxSizeMB = 0.8) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/') || file.size < maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })),
            'image/jpeg',
            0.82
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // When user selects a file, show the cropper
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For videos, skip cropper and upload directly
    if (file.type.startsWith('video/')) {
      uploadFile(file);
      return;
    }

    // For images, show the cropper
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawFile(file);
      setCropperImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files[0]) {
      handleFileSelect({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  // Crop completed — upload the cropped blob
  const handleCropComplete = async (blob) => {
    setCropperImage(null);
    setRawFile(null);
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
    await uploadFile(file);
  };

  // Cancel cropper — upload raw file compressed
  const handleCropCancel = () => {
    setCropperImage(null);
    if (rawFile) {
      uploadFile(rawFile);
      setRawFile(null);
    }
  };

  // Upload a file to the server
  const uploadFile = async (file) => {
    setUploading(true);
    setFormMessage('⏳ Compressing and uploading...');

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadedImageUrl(data.url);
        setFormMessage('✅ Image uploaded! Fill in details and save.');
      } else {
        setFormMessage(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setFormMessage('❌ Upload failed. Try again.');
    }
    setUploading(false);
  };

  // Remove image from form
  const handleRemoveImage = () => {
    setUploadedImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormMessage('Image removed. Upload a new one or save without image.');
  };

  // ========== PRODUCT CRUD ==========

  // Open edit mode
  const startEditing = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      category: product.category || 'crockery',
      featured: !!product.featured,
      in_stock: product.in_stock !== 0,
    });
    setUploadedImageUrl(product.image_url || '');
    setFormMessage('');
    setActiveTab('add');
  };

  // Cancel edit
  const cancelEditing = () => {
    setEditingProduct(null);
    resetForm();
    setActiveTab('products');
  };

  // Reset form
  const resetForm = () => {
    setProductForm({ name: '', description: '', price: '', original_price: '', category: 'crockery', featured: false, in_stock: true });
    setUploadedImageUrl('');
    setFormMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add or Update product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage('');

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      category: productForm.category,
      image_url: uploadedImageUrl || null,
      featured: productForm.featured,
      in_stock: productForm.in_stock,
    };

    try {
      let res;
      if (editingProduct) {
        // UPDATE
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        res = await fetch('/api/products', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setFormMessage(editingProduct ? '✅ Product updated successfully!' : '✅ Product added successfully!');
        setEditingProduct(null);
        resetForm();
        fetchData(token);
        // Switch to products tab after short delay
        setTimeout(() => setActiveTab('products'), 800);
      } else {
        setFormMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setFormMessage('❌ Failed to save product');
    }
    setSubmitting(false);
  };

  // Toggle stock status directly from products list
  const toggleStock = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ in_stock: !product.in_stock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === product.id ? { ...p, in_stock: p.in_stock ? 0 : 1 } : p));
      }
    } catch (err) {
      alert('Failed to update stock status');
    }
  };

  // Toggle featured directly
  const toggleFeatured = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ featured: !product.featured }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === product.id ? { ...p, featured: p.featured ? 0 : 1 } : p));
      }
    } catch (err) {
      alert('Failed to update featured status');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container"><div className="loading-spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <button className="btn-admin-logout" onClick={handleLogout}>Logout</button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); setEditingProduct(null); }}>
          🍽️ Products ({products.length})
        </button>
        <button className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => { if (!editingProduct) resetForm(); setActiveTab('add'); }}>
          {editingProduct ? '✏️ Edit Product' : '➕ Add Product'}
        </button>
        <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          📦 Orders ({orders.length})
        </button>
      </div>

      {/* ============ ADD / EDIT PRODUCT TAB ============ */}
      {activeTab === 'add' && (
        <div className="admin-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2>{editingProduct ? `✏️ Editing: ${editingProduct.name}` : '➕ Add New Product'}</h2>
            {editingProduct && (
              <button onClick={cancelEditing} className="btn-cancel-edit">✕ Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSaveProduct}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Royal Blue Dinner Set"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="crockery">Crockery</option>
                  <option value="gifts">Gifts</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g., 1499"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Original Price (₹) — for discount</label>
                <input
                  type="number"
                  placeholder="e.g., 1999"
                  value={productForm.original_price}
                  onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description / Caption</label>
              <textarea
                placeholder="Describe your product... This text appears on the product card and modal."
                rows="3"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              ></textarea>
            </div>

            {/* Image Upload / Edit */}
            <div className="form-group">
              <label>Product Image / Video</label>

              {/* Current image preview */}
              {uploadedImageUrl && (
                <div className="current-image-preview">
                  <img src={uploadedImageUrl} alt="Current" />
                  <div className="current-image-actions">
                    <button type="button" className="btn-crop-image" onClick={() => setCropperImage(uploadedImageUrl)}>
                      ✂️ Crop / Resize
                    </button>
                    <button type="button" className="btn-replace-image" onClick={() => fileInputRef.current?.click()}>
                      🔄 Replace
                    </button>
                    <button type="button" className="btn-remove-image" onClick={handleRemoveImage}>
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Upload area (shown when no image, or for replacing) */}
              {!uploadedImageUrl && (
                <div
                  className="file-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
                  onDrop={handleDrop}
                >
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} />
                  {uploading ? (
                    <p>⏳ Uploading...</p>
                  ) : (
                    <>
                      <p>📸 Click or drag & drop an image/video here</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>JPG, PNG, WebP, GIF, MP4 (max 10MB)</p>
                    </>
                  )}
                </div>
              )}

              {/* Hidden input for replace flow */}
              {uploadedImageUrl && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              )}
            </div>

            {/* Stock & Featured toggles */}
            <div className="form-toggles-row">
              <div className="form-toggle">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                />
                <label htmlFor="featured-check">⭐ Featured (shown on homepage)</label>
              </div>
              <div className="form-toggle">
                <input
                  type="checkbox"
                  id="stock-check"
                  checked={productForm.in_stock}
                  onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                />
                <label htmlFor="stock-check">📦 In Stock</label>
              </div>
            </div>

            <button type="submit" className="btn-admin-submit" disabled={submitting || uploading}>
              {submitting ? 'Saving...' : uploading ? '⏳ Wait — uploading...' : editingProduct ? '💾 Update Product' : '✅ Add Product'}
            </button>

            {formMessage && (
              <p style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: formMessage.includes('✅') ? 'rgba(46,204,113,0.1)' : formMessage.includes('❌') ? 'rgba(231,76,60,0.1)' : 'rgba(212,168,83,0.1)' }}>
                {formMessage}
              </p>
            )}
          </form>
        </div>
      )}

      {/* ============ PRODUCTS TAB ============ */}
      {activeTab === 'products' && (
        <>
          {products.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">📦</div>
              <h2>No Products Yet</h2>
              <p>Click &quot;Add Product&quot; to add your first product!</p>
            </div>
          ) : (
            <div className="admin-products-grid">
              {products.map(product => (
                <div key={product.id} className={`admin-product-card ${!product.in_stock ? 'out-of-stock' : ''}`}>
                  {/* Stock badge */}
                  {!product.in_stock && <div className="stock-badge out">Out of Stock</div>}
                  {product.featured ? <div className="stock-badge featured">⭐ Featured</div> : null}

                  <div className="admin-product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                        {product.category === 'crockery' ? '🍽️' : '🎁'}
                      </div>
                    )}
                  </div>
                  <div className="admin-product-info">
                    <h4>{product.name}</h4>
                    <p className="admin-product-category">{product.category}</p>
                    <p className="price">
                      ₹{product.price?.toLocaleString('en-IN')}
                      {product.original_price && (
                        <span className="original-price"> ₹{product.original_price?.toLocaleString('en-IN')}</span>
                      )}
                    </p>
                    {product.description && (
                      <p className="admin-product-desc">{product.description.slice(0, 80)}{product.description.length > 80 ? '...' : ''}</p>
                    )}
                  </div>
                  <div className="admin-product-actions">
                    <button className="btn-admin-edit" onClick={() => startEditing(product)} title="Edit product">
                      ✏️ Edit
                    </button>
                    <button
                      className={`btn-admin-stock ${product.in_stock ? 'in-stock' : 'oos'}`}
                      onClick={() => toggleStock(product)}
                      title={product.in_stock ? 'Mark as out of stock' : 'Mark as in stock'}
                    >
                      {product.in_stock ? '📦 In Stock' : '🚫 Out of Stock'}
                    </button>
                    <button
                      className={`btn-admin-feature ${product.featured ? 'featured' : ''}`}
                      onClick={() => toggleFeatured(product)}
                      title={product.featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      {product.featured ? '⭐ Featured' : '☆ Feature'}
                    </button>
                    <button className="btn-admin-delete" onClick={() => handleDeleteProduct(product.id)} title="Delete product">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ ORDERS TAB ============ */}
      {activeTab === 'orders' && (
        <>
          {orders.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">📦</div>
              <h2>No Orders Yet</h2>
              <p>Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {orders.map(order => (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-header">
                    <strong>{order.order_id}</strong>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="admin-order-details">
                    <p><strong>Customer:</strong> {order.customer_name}</p>
                    <p><strong>Email:</strong> {order.customer_email}</p>
                    <p><strong>Phone:</strong> {order.customer_phone}</p>
                    <p><strong>Address:</strong> {order.customer_address}</p>
                    <p><strong>Total:</strong> ₹{order.total_amount?.toLocaleString('en-IN')}</p>
                    <p><strong>Items:</strong> {order.items?.map(i => `${i.product_name} × ${i.quantity}`).join(', ')}</p>
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString('en-IN')}</p>
                    {order.razorpay_payment_id && <p><strong>Payment ID:</strong> {order.razorpay_payment_id}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ IMAGE CROPPER MODAL ============ */}
      {cropperImage && (
        <ImageCropper
          imageUrl={cropperImage}
          onCrop={handleCropComplete}
          onCancel={() => {
            setCropperImage(null);
            setRawFile(null);
          }}
        />
      )}
    </div>
  );
}
