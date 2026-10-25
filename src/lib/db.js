import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'glassy_touch.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      category TEXT NOT NULL CHECK(category IN ('crockery', 'gifts')),
      image_url TEXT,
      featured INTEGER DEFAULT 0,
      in_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
  `);
}

// ==================== PRODUCT OPERATIONS ====================

export function getAllProducts(category = null) {
  const db = getDb();
  if (category) {
    return db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC').all(category);
  }
  return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
}

export function getFeaturedProducts() {
  const db = getDb();
  return db.prepare('SELECT * FROM products WHERE featured = 1 AND in_stock = 1 ORDER BY created_at DESC LIMIT 8').all();
}

export function getProductById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

export function createProduct({ name, description, price, original_price, category, image_url, featured = 0 }) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, original_price, category, image_url, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, description, price, original_price || null, category, image_url, featured ? 1 : 0);
  return { id: result.lastInsertRowid, name, description, price, original_price, category, image_url, featured };
}

export function updateProduct(id, { name, description, price, original_price, category, image_url, featured, in_stock }) {
  const db = getDb();
  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (price !== undefined) { fields.push('price = ?'); values.push(price); }
  if (original_price !== undefined) { fields.push('original_price = ?'); values.push(original_price); }
  if (category !== undefined) { fields.push('category = ?'); values.push(category); }
  if (image_url !== undefined) { fields.push('image_url = ?'); values.push(image_url); }
  if (featured !== undefined) { fields.push('featured = ?'); values.push(featured ? 1 : 0); }
  if (in_stock !== undefined) { fields.push('in_stock = ?'); values.push(in_stock ? 1 : 0); }

  if (fields.length === 0) return null;

  values.push(id);
  const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getProductById(id);
}

export function deleteProduct(id) {
  const db = getDb();
  const product = getProductById(id);
  if (product && product.image_url) {
    const imagePath = path.join(process.cwd(), 'public', product.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return product;
}

// ==================== ORDER OPERATIONS ====================

export function createOrder({ order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, items, razorpay_order_id }) {
  const db = getDb();
  const insertOrder = db.prepare(`
    INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, razorpay_order_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertOrder.run(order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, razorpay_order_id);
    for (const item of items) {
      insertItem.run(order_id, item.product_id, item.product_name, item.quantity, item.price);
    }
  });

  transaction();
  return getOrderById(order_id);
}

export function updateOrderPayment(order_id, { razorpay_payment_id, razorpay_signature, status }) {
  const db = getDb();
  db.prepare(`
    UPDATE orders SET razorpay_payment_id = ?, razorpay_signature = ?, status = ? WHERE order_id = ?
  `).run(razorpay_payment_id, razorpay_signature, status, order_id);
  return getOrderById(order_id);
}

export function getOrderById(order_id) {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(order_id);
  if (order) {
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order_id);
  }
  return order;
}

export function getAllOrders() {
  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  for (const order of orders) {
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.order_id);
  }
  return orders;
}

// ==================== ENQUIRY OPERATIONS ====================

export function createEnquiry({ name, email, phone, message }) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO enquiries (name, email, phone, message) VALUES (?, ?, ?, ?)');
  const result = stmt.run(name, email, phone, message);
  return { id: result.lastInsertRowid, name, email, phone, message };
}

export function getAllEnquiries() {
  const db = getDb();
  return db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
}

// ==================== ADMIN OPERATIONS ====================

export function getAdminByUsername(username) {
  const db = getDb();
  return db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
}

export function createAdmin(username, password_hash) {
  const db = getDb();
  const existing = getAdminByUsername(username);
  if (existing) return existing;
  const stmt = db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)');
  const result = stmt.run(username, password_hash);
  return { id: result.lastInsertRowid, username };
}

export default getDb;
