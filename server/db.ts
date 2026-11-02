import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'foodmitra.db');
export const db = new DatabaseSync(dbPath);

// Initialize schema
export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('super_admin', 'donor', 'ngo', 'volunteer')),
      organization_name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      is_verified INTEGER DEFAULT 0,
      verification_doc TEXT,
      bio TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      dietary TEXT NOT NULL,
      quantity TEXT NOT NULL,
      estimated_servings INTEGER NOT NULL,
      prep_time TEXT NOT NULL,
      use_by_time TEXT NOT NULL,
      storage_condition TEXT NOT NULL,
      packaging_type TEXT NOT NULL,
      allergens TEXT,
      pickup_address TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      pickup_window_start TEXT NOT NULL,
      pickup_window_end TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      image_url TEXT,
      safety_certified INTEGER DEFAULT 1,
      verification_status TEXT DEFAULT 'verified' CHECK(verification_status IN ('pending_verification', 'verified', 'flagged', 'rejected')),
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'claimed', 'on_the_way', 'picked_up', 'delivered', 'expired', 'cancelled')),
      claimed_by_ngo_id INTEGER REFERENCES users(id),
      assigned_volunteer_id INTEGER REFERENCES users(id),
      claimed_at TEXT,
      picked_up_at TEXT,
      delivered_at TEXT,
      delivery_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reported_by_user_id INTEGER NOT NULL REFERENCES users(id),
      donation_id INTEGER REFERENCES donations(id),
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'dismissed')),
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      inquiry_type TEXT DEFAULT 'general',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
    CREATE INDEX IF NOT EXISTS idx_donations_city ON donations(city);
    CREATE INDEX IF NOT EXISTS idx_donations_use_by ON donations(use_by_time);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Seed default accounts and donations if empty
  seedDatabase();
}

function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount && userCount.count > 0) {
    return;
  }

  console.log('Seeding initial FoodMitra database...');

  const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

  // 1. Super Admin
  const adminStmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, organization_name, phone, address, city, is_verified, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  adminStmt.run(
    'Super Admin FoodMitra',
    'admin@foodmitra.org',
    hashPassword('Admin@FoodMitra123'),
    'super_admin',
    'FoodMitra Central Trust',
    '+91 98200 11223',
    '401, Social Impact Hub, BKC',
    'Mumbai',
    1,
    'Chief Platform Administrator'
  );

  // 2. Donors
  const donor1Result = adminStmt.run(
    'The Grand Royal Banquet & Hotel',
    'grandpalace@donors.foodmitra.org',
    hashPassword('Donor@123'),
    'donor',
    'Royal Hospitality Pvt Ltd',
    '+91 98334 45566',
    'S.V. Road, Near Bandra West Station',
    'Mumbai',
    1,
    'Luxury wedding venue & banquet catering serving over 500 guests daily.'
  );

  const donor2Result = adminStmt.run(
    'Spice Symphony Caterers',
    'spicesymphony@donors.foodmitra.org',
    hashPassword('Donor@123'),
    'donor',
    'Spice Symphony Events',
    '+91 98765 12345',
    'Indiranagar 100ft Road',
    'Bengaluru',
    1,
    'Premium event caterers specializing in north and south Indian feasts.'
  );

  const donor3Result = adminStmt.run(
    'Green Harvest Bakery & Cafe',
    'greenharvest@donors.foodmitra.org',
    hashPassword('Donor@123'),
    'donor',
    'Green Harvest Organics',
    '+91 91234 56780',
    'Connaught Place, Outer Circle',
    'New Delhi',
    1,
    'Artisanal bakery and organic kitchen with zero-waste policy.'
  );

  // 3. NGOs
  const ngo1Result = adminStmt.run(
    'AnnaSeva Welfare Foundation',
    'contact@annaseva.org',
    hashPassword('Ngo@123'),
    'ngo',
    'AnnaSeva NGO (Reg. #MH/2018/0091)',
    '+91 98210 99887',
    'Dharavi Community Center, 60ft Road',
    'Mumbai',
    1,
    'Distributing 2,000+ hot meals daily to shelter homes, day-laborers and orphanages.'
  );

  const ngo2Result = adminStmt.run(
    'Roti Bank Karnataka',
    'hope@rotibankka.org',
    hashPassword('Ngo@123'),
    'ngo',
    'Roti Bank Karnataka Trust',
    '+91 99000 88776',
    'Shivajinagar Relief Base',
    'Bengaluru',
    1,
    'Dedicated fleet of food rescue vans servicing under-resourced communities.'
  );

  // 4. Volunteers
  const vol1Result = adminStmt.run(
    'Rahul Sharma',
    'rahul.sharma@volunteers.org',
    hashPassword('Volunteer@123'),
    'volunteer',
    'Independent Youth Volunteer',
    '+91 97690 12345',
    'Khar West',
    'Mumbai',
    1,
    'Active volunteer with electric two-wheeler and thermal insulated bags.'
  );

  const vol2Result = adminStmt.run(
    'Priya Patel',
    'priya.patel@volunteers.org',
    hashPassword('Volunteer@123'),
    'volunteer',
    'Robin Hood Army Associate',
    '+91 98450 67890',
    'Koramangala 4th Block',
    'Bengaluru',
    1,
    'Weekend food rescue squad lead and logistics volunteer.'
  );

  // Future valid timestamps for donations (e.g. 3-8 hours from now)
  const now = new Date();
  const makeFutureISO = (hoursAhead: number) => {
    const d = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    return d.toISOString();
  };
  const makePastISO = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return d.toISOString();
  };

  // 5. Seed Real, High-Quality Donations
  const donStmt = db.prepare(`
    INSERT INTO donations (
      donor_id, title, description, category, dietary, quantity, estimated_servings,
      prep_time, use_by_time, storage_condition, packaging_type, allergens,
      pickup_address, city, latitude, longitude, pickup_window_start, pickup_window_end,
      contact_name, contact_phone, image_url, safety_certified, verification_status, status,
      claimed_by_ngo_id, assigned_volunteer_id, claimed_at, picked_up_at, delivered_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  // Listing 1: Available Cooked Banquet Meal (Mumbai)
  donStmt.run(
    Number(donor1Result.lastInsertRowid),
    'Fresh Paneer Biryani & Dal Makhani Feast',
    'Surplus from high-end corporate banquet. Cooked under strict HACCP safety protocol. Packed in food-grade insulated thermal containers.',
    'Cooked Meals',
    'Vegetarian',
    '4 Large Containers (~35 kg)',
    110,
    makePastISO(2),
    makeFutureISO(6),
    'Hot Holding (>63°C)',
    'Food-grade sealed containers',
    'Dairy (Paneer, Butter), Cashew paste',
    'The Grand Royal Banquet, S.V. Road, Bandra West',
    'Mumbai',
    19.0596,
    72.8295,
    '15:00',
    '18:30',
    'Chef Vikram Deshmukh',
    '+91 98334 45566',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    1,
    'verified',
    'available',
    null,
    null,
    null,
    null,
    null
  );

  // Listing 2: Available Fresh Bakery Breads & Pastries (Delhi)
  donStmt.run(
    Number(donor3Result.lastInsertRowid),
    'Artisanal Whole Wheat Loaves & Multigrain Buns',
    'Freshly baked this morning at 6:00 AM. Untouched surplus inventory from morning delivery batch. Healthy whole grains.',
    'Bakery & Breads',
    'Vegetarian',
    '85 Loaves & 120 Buns',
    150,
    makePastISO(4),
    makeFutureISO(18),
    'Room Temp (20-25°C)',
    'Biodegradable bakery boxes & moisture seal',
    'Gluten (Wheat), Sesame seeds',
    'Green Harvest Bakery, Outer Circle, Connaught Place',
    'New Delhi',
    28.6315,
    77.2167,
    '16:00',
    '20:00',
    'Aman Oberoi',
    '+91 91234 56780',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    1,
    'verified',
    'available',
    null,
    null,
    null,
    null,
    null
  );

  // Listing 3: Claimed / In-Transit Donation (Bengaluru)
  donStmt.run(
    Number(donor2Result.lastInsertRowid),
    'South Indian Festive Meals (Sambar, Rice, Poriyal, Curd Rice)',
    'Weddings buffet surplus. Freshly prepared, blast chilled as per cold-chain standards within 90 minutes of preparation.',
    'Cooked Meals',
    'Vegetarian',
    '6 Aluminum Trays (~45 kg)',
    140,
    makePastISO(3),
    makeFutureISO(5),
    'Refrigerated (0-4°C)',
    'Foil covered catering trays',
    'Dairy (Curd), Mustard seeds',
    'Spice Symphony Events, 100ft Road, Indiranagar',
    'Bengaluru',
    12.9784,
    77.6408,
    '14:00',
    '17:00',
    'Kavita Reddy',
    '+91 98765 12345',
    'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    1,
    'verified',
    'on_the_way',
    Number(ngo2Result.lastInsertRowid),
    Number(vol2Result.lastInsertRowid),
    makePastISO(1),
    makePastISO(0.5),
    null
  );

  // Listing 4: Successfully Delivered Donation (Mumbai)
  donStmt.run(
    Number(donor1Result.lastInsertRowid),
    'Pulao, Vegetable Korma & Chapati Packs',
    'Lunch conference surplus food. Packed neatly in 180 single-serve hygienic meal boxes.',
    'Cooked Meals',
    'Vegetarian',
    '180 Individual Meal Boxes',
    180,
    makePastISO(7),
    makePastISO(1),
    'Room Temp (20-25°C)',
    'Individual sealed meal boxes',
    'Gluten, Dairy',
    'The Grand Royal Banquet, Bandra West',
    'Mumbai',
    19.0596,
    72.8295,
    '12:30',
    '14:00',
    'Chef Vikram Deshmukh',
    '+91 98334 45566',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    1,
    'verified',
    'delivered',
    Number(ngo1Result.lastInsertRowid),
    Number(vol1Result.lastInsertRowid),
    makePastISO(6),
    makePastISO(5),
    makePastISO(4)
  );

  // Listing 5: Available Fresh Farm Produce & Dairy (Mumbai)
  donStmt.run(
    Number(donor1Result.lastInsertRowid),
    'Fresh Milk Pouches & Organic Vegetable Crates',
    'Surplus breakfast buffet stock: 40 liters pasteurized milk and 60 kg seasonal tomatoes, carrots and greens.',
    'Groceries & Produce',
    'Vegetarian',
    '40 Liters Milk + 6 Crates Veggies',
    200,
    makePastISO(2),
    makeFutureISO(12),
    'Refrigerated (0-4°C)',
    'Sealed crates & dairy crates',
    'Dairy (Milk)',
    'Grand Royal Logistics Bay 2, Bandra',
    'Mumbai',
    19.0601,
    72.8312,
    '16:30',
    '21:00',
    'Rajesh Verma',
    '+91 98334 45567',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    1,
    'verified',
    'available',
    null,
    null,
    null,
    null,
    null
  );

  // Seed sample incident for Admin overview
  db.prepare(`
    INSERT INTO incidents (reported_by_user_id, donation_id, type, severity, title, description, status, admin_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(ngo1Result.lastInsertRowid),
    null,
    'packaging_damage',
    'medium',
    'Minor outer seal tear during transport',
    'Volunteer observed outer foil carton had a slight tear during loading. Inner thermal foil remained intact and food temperature was validated at 67°C upon arrival.',
    'resolved',
    'Food temperature confirmed safe. Volunteer retrained on securing carton latches.'
  );

  console.log('FoodMitra database successfully seeded with initial realistic data!');
}
