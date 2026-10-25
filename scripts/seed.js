const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'glassy_touch.db');

// Ensure data directory
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('🗄️  Initializing database...\n');

// Create tables
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
`);

console.log('✅ Tables created successfully\n');

// Create admin user
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GlassyTouch@2024';

const existingAdmin = db.prepare('SELECT id FROM admin WHERE username = ?').get(ADMIN_USERNAME);

if (!existingAdmin) {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run(ADMIN_USERNAME, hash);
  console.log(`👤 Admin user created:`);
  console.log(`   Username: ${ADMIN_USERNAME}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!\n`);
} else {
  console.log(`👤 Admin user "${ADMIN_USERNAME}" already exists\n`);
}

// Add sample products
const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();

if (existingProducts.count === 0) {
  console.log('📦 Adding sample products...\n');

  const sampleProducts = [
    {
      name: 'Royal Gold Dinner Set (24 Pcs)',
      description: 'An exquisite 24-piece dinner set with elegant gold rim detailing. Includes 6 dinner plates, 6 quarter plates, 6 bowls, and 6 cups with saucers. Made of premium bone china.',
      price: 3499,
      original_price: 4999,
      category: 'crockery',
      featured: 1,
    },
    {
      name: 'Crystal Clear Glass Set (6 Pcs)',
      description: 'Premium crystal glass set perfect for special occasions. Each glass is handcrafted with precision for a sparkling clarity that elevates your dining experience.',
      price: 899,
      original_price: 1299,
      category: 'crockery',
      featured: 1,
    },
    {
      name: 'Floral Ceramic Mug Collection (4 Pcs)',
      description: 'Beautiful hand-painted floral mugs in four unique designs. Perfect for your morning tea or coffee. Microwave and dishwasher safe.',
      price: 599,
      original_price: 799,
      category: 'crockery',
      featured: 1,
    },
    {
      name: 'Premium Tea Set — Blue Willow',
      description: 'Classic Blue Willow pattern tea set including teapot, 6 cups with saucers, sugar bowl, and milk pitcher. A timeless addition to your kitchen.',
      price: 2799,
      original_price: 3499,
      category: 'crockery',
      featured: 1,
    },
    {
      name: 'Decorative Crystal Showpiece',
      description: 'Stunning crystal showpiece perfect for your living room or office desk. Catches light beautifully and creates mesmerizing reflections.',
      price: 1299,
      original_price: 1799,
      category: 'gifts',
      featured: 1,
    },
    {
      name: 'Personalized Photo Frame — Rose Gold',
      description: 'Elegant rose gold photo frame with engraving option. Available in 4x6 and 5x7 sizes. Makes a perfect gift for weddings, anniversaries, and birthdays.',
      price: 699,
      original_price: 999,
      category: 'gifts',
      featured: 1,
    },
    {
      name: 'Aromatic Candle Gift Box',
      description: 'Premium set of 4 aromatic candles in luxurious packaging. Scents include Lavender, Vanilla, Jasmine, and Ocean Breeze. Burns for 30+ hours each.',
      price: 899,
      original_price: 1199,
      category: 'gifts',
      featured: 1,
    },
    {
      name: 'Handcrafted Wooden Music Box',
      description: 'Beautiful handcrafted wooden music box with intricate carvings. Plays a soothing melody when opened. A unique gift that will be cherished forever.',
      price: 1499,
      original_price: 1999,
      category: 'gifts',
      featured: 1,
    },
    {
      name: 'Serving Bowl Set — Marble Finish',
      description: 'Set of 3 serving bowls with stunning marble finish. Perfect for salads, snacks, and main courses. Food-safe and easy to clean.',
      price: 1199,
      category: 'crockery',
      featured: 0,
    },
    {
      name: 'Luxury Gift Hamper — Celebrations',
      description: 'Beautifully packed gift hamper containing premium chocolates, dry fruits, scented candle, and a personalized card. Perfect for any celebration.',
      price: 2499,
      original_price: 2999,
      category: 'gifts',
      featured: 0,
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, original_price, category, featured)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const p of sampleProducts) {
    insertProduct.run(p.name, p.description, p.price, p.original_price || null, p.category, p.featured);
    console.log(`   ✅ ${p.name}`);
  }

  console.log(`\n📦 ${sampleProducts.length} sample products added\n`);
} else {
  console.log(`📦 ${existingProducts.count} products already exist — skipping sample data\n`);
}

db.close();

console.log('═══════════════════════════════════════════');
console.log('  🎉 Database seeded successfully!');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('  Next steps:');
console.log('  1. Update .env.local with your Razorpay & SMTP credentials');
console.log('  2. Run: npm run dev');
console.log('  3. Open: http://localhost:3000');
console.log('  4. Admin: http://localhost:3000/admin/login');
console.log(`     Username: ${ADMIN_USERNAME}`);
console.log(`     Password: ${ADMIN_PASSWORD}`);
console.log('');
