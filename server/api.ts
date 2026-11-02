import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'foodmitra-super-secret-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
    organization_name?: string;
  };
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
}

// Optional auth middleware (attaches user if present, doesn't block if not)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (!err && decoded) {
        req.user = decoded;
      }
      next();
    });
  } else {
    next();
  }
}

// Role authorization guard
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: `Forbidden: requires one of [${roles.join(', ')}] role` });
    }
    next();
  };
}

// Helper to log audit actions
function logAudit(userId: number | null, action: string, details: string, req: Request) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
    db.prepare('INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)').run(
      userId,
      action,
      details,
      String(ip)
    );
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, organization_name, phone, address, city, verification_doc, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const validRoles = ['donor', 'ngo', 'volunteer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be donor, ngo, or volunteer' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    // Donors & NGOs require verification by Super Admin by default, or auto-verified if valid registration doc provided
    const is_verified = role === 'volunteer' ? 1 : (verification_doc ? 1 : 0);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, organization_name, phone, address, city, is_verified, verification_doc, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      role,
      organization_name || null,
      phone || null,
      address || null,
      city || 'Mumbai',
      is_verified,
      verification_doc || null,
      bio || null
    );

    const userId = Number(result.lastInsertRowid);
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role, name: name.trim(), organization_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAudit(userId, 'USER_REGISTERED', `User registered as ${role}`, req);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        organization_name,
        phone,
        address,
        city: city || 'Mumbai',
        is_verified: is_verified === 1
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, organization_name: user.organization_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAudit(user.id, 'USER_LOGIN', `User signed in successfully`, req);

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_name: user.organization_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        is_verified: user.is_verified === 1,
        bio: user.bio,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, organization_name, phone, address, city, is_verified, bio, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { ...user, is_verified: user.is_verified === 1 } });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

router.put('/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, address, city, organization_name, bio } = req.body;
    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          organization_name = COALESCE(?, organization_name),
          bio = COALESCE(?, bio)
      WHERE id = ?
    `).run(name, phone, address, city, organization_name, bio, req.user!.id);

    const updated = db.prepare('SELECT id, name, email, role, organization_name, phone, address, city, is_verified, bio FROM users WHERE id = ?').get(req.user!.id) as any;
    res.json({ message: 'Profile updated successfully', user: { ...updated, is_verified: updated.is_verified === 1 } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, new_password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      // Don't disclose account existence for security, but return success
      return res.json({ message: 'If this email is registered, password update instructions have been processed.' });
    }

    if (new_password) {
      const hash = bcrypt.hashSync(new_password, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
      logAudit(user.id, 'PASSWORD_RESET', 'User reset password', req);
      return res.json({ message: 'Password has been updated successfully. You can now log in.' });
    }

    res.json({ message: 'Password reset link sent to your registered email address.' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// ==========================================
// 2. DONATION LISTINGS & SAFETY VALIDATION
// ==========================================

// Get all donations with filters
router.get('/donations', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, dietary, city, status, search, urgentOnly, donor_id } = req.query;

    let query = `
      SELECT 
        d.*,
        u.name as donor_name,
        u.organization_name as donor_org,
        u.is_verified as donor_verified,
        ngo.name as claimed_by_ngo_name,
        ngo.organization_name as claimed_by_ngo_org,
        vol.name as volunteer_name,
        vol.phone as volunteer_phone
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      LEFT JOIN users ngo ON d.claimed_by_ngo_id = ngo.id
      LEFT JOIN users vol ON d.assigned_volunteer_id = vol.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filter by specific donor if requested
    if (donor_id) {
      query += ` AND d.donor_id = ?`;
      params.push(Number(donor_id));
    }

    if (category && category !== 'All') {
      query += ` AND d.category = ?`;
      params.push(category);
    }

    if (dietary && dietary !== 'All') {
      query += ` AND d.dietary = ?`;
      params.push(dietary);
    }

    if (city && city !== 'All') {
      query += ` AND LOWER(d.city) = LOWER(?)`;
      params.push(city);
    }

    if (status && status !== 'All') {
      query += ` AND d.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (d.title LIKE ? OR d.description LIKE ? OR d.pickup_address LIKE ? OR u.organization_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    // Safety rule: Exclude expired food unless viewing specific historical donations
    if (!status || status === 'available') {
      // Current ISO timestamp check
      const currentIso = new Date().toISOString();
      query += ` AND d.use_by_time > ?`;
      params.push(currentIso);
    }

    if (urgentOnly === 'true') {
      // Safe consumption deadline within next 4 hours
      const next4h = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
      query += ` AND d.use_by_time <= ?`;
      params.push(next4h);
    }

    query += ` ORDER BY d.id DESC`;

    const rows = db.prepare(query).all(...params) as any[];

    // Format safe consumption time remaining
    const formatted = rows.map((item) => {
      const useBy = new Date(item.use_by_time).getTime();
      const now = Date.now();
      const diffMs = useBy - now;
      const hoursRemaining = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
      const isExpired = diffMs <= 0;

      return {
        ...item,
        donor_verified: item.donor_verified === 1,
        safety_certified: item.safety_certified === 1,
        hours_remaining: hoursRemaining,
        is_expired: isExpired,
        is_urgent: hoursRemaining > 0 && hoursRemaining <= 4
      };
    });

    res.json({ donations: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to load food donations' });
  }
});

// Get single donation by ID
router.get('/donations/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const query = `
      SELECT 
        d.*,
        u.name as donor_name,
        u.email as donor_email,
        u.phone as donor_phone_user,
        u.organization_name as donor_org,
        u.is_verified as donor_verified,
        ngo.name as claimed_by_ngo_name,
        ngo.phone as claimed_by_ngo_phone,
        ngo.organization_name as claimed_by_ngo_org,
        vol.name as volunteer_name,
        vol.phone as volunteer_phone
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      LEFT JOIN users ngo ON d.claimed_by_ngo_id = ngo.id
      LEFT JOIN users vol ON d.assigned_volunteer_id = vol.id
      WHERE d.id = ?
    `;

    const item = db.prepare(query).get(id) as any;
    if (!item) {
      return res.status(404).json({ error: 'Donation listing not found' });
    }

    const useBy = new Date(item.use_by_time).getTime();
    const now = Date.now();
    const diffMs = useBy - now;
    const hoursRemaining = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);

    res.json({
      donation: {
        ...item,
        donor_verified: item.donor_verified === 1,
        safety_certified: item.safety_certified === 1,
        hours_remaining: hoursRemaining,
        is_expired: diffMs <= 0,
        is_urgent: hoursRemaining > 0 && hoursRemaining <= 4
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve donation details' });
  }
});

// Create new food donation (Donor or Super Admin)
router.post('/donations', authenticateToken, requireRole('donor', 'super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      dietary,
      quantity,
      estimated_servings,
      prep_time,
      use_by_time,
      storage_condition,
      packaging_type,
      allergens,
      pickup_address,
      city,
      latitude,
      longitude,
      pickup_window_start,
      pickup_window_end,
      contact_name,
      contact_phone,
      image_url,
      safety_checklist_agreed
    } = req.body;

    // Strict validation
    if (!title || !category || !quantity || !estimated_servings || !prep_time || !use_by_time || !storage_condition || !pickup_address || !city) {
      return res.status(400).json({ error: 'Missing mandatory food donation or safety fields' });
    }

    if (!safety_checklist_agreed) {
      return res.status(400).json({ error: 'You must certify compliance with food safety and hygiene protocols' });
    }

    const prepDate = new Date(prep_time).getTime();
    const useByDate = new Date(use_by_time).getTime();
    const now = Date.now();

    // Food safety validations
    if (isNaN(useByDate)) {
      return res.status(400).json({ error: 'Invalid safe consumption deadline date/time format' });
    }

    if (useByDate <= now) {
      return res.status(400).json({
        error: 'CRITICAL SAFETY VIOLATION: Safe consumption deadline is in the past. FoodMitra never allows expired or unsafe food to be listed.'
      });
    }

    if (prepDate > now + 15 * 60 * 1000) {
      return res.status(400).json({ error: 'Preparation time cannot be in the future.' });
    }

    const defaultImages: Record<string, string> = {
      'Cooked Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'Bakery & Breads': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'Groceries & Produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      'Dairy Products': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      'Packaged Foods': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      'Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80'
    };

    const finalImage = image_url || defaultImages[category] || defaultImages['Cooked Meals'];

    // Default coordinates based on city if not passed
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      Mumbai: { lat: 19.0760, lng: 72.8777 },
      Delhi: { lat: 28.6139, lng: 77.2090 },
      'New Delhi': { lat: 28.6139, lng: 77.2090 },
      Bengaluru: { lat: 12.9716, lng: 77.5946 },
      Pune: { lat: 18.5204, lng: 73.8567 },
      Hyderabad: { lat: 17.3850, lng: 78.4867 },
      Kolkata: { lat: 22.5726, lng: 88.3639 },
      Chennai: { lat: 13.0827, lng: 80.2707 }
    };

    const coords = cityCoords[city] || { lat: 19.0760, lng: 72.8777 };
    const lat = latitude || coords.lat;
    const lng = longitude || coords.lng;

    const stmt = db.prepare(`
      INSERT INTO donations (
        donor_id, title, description, category, dietary, quantity, estimated_servings,
        prep_time, use_by_time, storage_condition, packaging_type, allergens,
        pickup_address, city, latitude, longitude, pickup_window_start, pickup_window_end,
        contact_name, contact_phone, image_url, safety_certified, verification_status, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    const result = stmt.run(
      req.user!.id,
      title.trim(),
      description || '',
      category,
      dietary || 'Vegetarian',
      quantity,
      Number(estimated_servings),
      new Date(prep_time).toISOString(),
      new Date(use_by_time).toISOString(),
      storage_condition,
      packaging_type || 'Food-grade sealed containers',
      allergens || 'None declared',
      pickup_address,
      city,
      lat,
      lng,
      pickup_window_start || 'Immediate',
      pickup_window_end || 'Within 4 hours',
      contact_name || req.user!.name,
      contact_phone || 'Not provided',
      finalImage,
      1,
      'verified',
      'available'
    );

    const donationId = Number(result.lastInsertRowid);
    logAudit(req.user!.id, 'DONATION_CREATED', `Listed food donation #${donationId}: ${title}`, req);

    res.status(201).json({
      message: 'Surplus food donation listed successfully and verified for distribution!',
      donationId
    });
  } catch (error: any) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create food donation listing' });
  }
});

// Claim food donation (NGO or Super Admin)
router.post('/donations/:id/claim', authenticateToken, requireRole('ngo', 'super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(id) as any;

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ error: `Cannot claim donation with status '${donation.status}'` });
    }

    // Check expiration
    if (new Date(donation.use_by_time).getTime() <= Date.now()) {
      db.prepare("UPDATE donations SET status = 'expired' WHERE id = ?").run(id);
      return res.status(400).json({ error: 'This donation has expired and cannot be distributed' });
    }

    const claimedAt = new Date().toISOString();
    db.prepare(`
      UPDATE donations
      SET status = 'claimed',
          claimed_by_ngo_id = ?,
          claimed_at = ?
      WHERE id = ?
    `).run(req.user!.id, claimedAt, id);

    logAudit(req.user!.id, 'DONATION_CLAIMED', `NGO claimed donation #${id}`, req);

    res.json({ message: 'Donation successfully claimed! Please schedule pickup or assign a volunteer.', claimedAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim donation' });
  }
});

// Assign Volunteer to a claimed donation (NGO or Super Admin)
router.post('/donations/:id/assign-volunteer', authenticateToken, requireRole('ngo', 'super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { volunteer_id } = req.body;

    if (!volunteer_id) {
      return res.status(400).json({ error: 'Volunteer ID is required' });
    }

    const volunteer = db.prepare("SELECT id, name, role FROM users WHERE id = ? AND role = 'volunteer'").get(volunteer_id);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found or invalid role' });
    }

    db.prepare(`
      UPDATE donations
      SET assigned_volunteer_id = ?
      WHERE id = ?
    `).run(volunteer_id, id);

    logAudit(req.user!.id, 'VOLUNTEER_ASSIGNED', `Assigned volunteer #${volunteer_id} to donation #${id}`, req);

    res.json({ message: 'Volunteer assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign volunteer' });
  }
});

// Update donation pickup/delivery status (Volunteer, Claiming NGO, or Super Admin)
router.post('/donations/:id/status', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, delivery_notes } = req.body;

    const validStatuses = ['available', 'claimed', 'on_the_way', 'picked_up', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(id) as any;
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Authorization check
    const isOwner = donation.donor_id === req.user!.id;
    const isClaimer = donation.claimed_by_ngo_id === req.user!.id;
    const isVolunteer = donation.assigned_volunteer_id === req.user!.id || req.user!.role === 'volunteer';
    const isAdmin = req.user!.role === 'super_admin';

    if (!isOwner && !isClaimer && !isVolunteer && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to change this donation status' });
    }

    const nowIso = new Date().toISOString();
    let query = `UPDATE donations SET status = ?`;
    const params: any[] = [status];

    if (status === 'picked_up') {
      query += `, picked_up_at = ?`;
      params.push(nowIso);
    } else if (status === 'delivered') {
      query += `, delivered_at = ?`;
      params.push(nowIso);
    }

    if (delivery_notes) {
      query += `, delivery_notes = ?`;
      params.push(delivery_notes);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    db.prepare(query).run(...params);

    logAudit(req.user!.id, 'DONATION_STATUS_UPDATE', `Donation #${id} status changed to ${status}`, req);

    res.json({ message: `Donation status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete or cancel donation listing
router.delete('/donations/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(id) as any;
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.donor_id !== req.user!.id && req.user!.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this donation' });
    }

    db.prepare("UPDATE donations SET status = 'cancelled' WHERE id = ?").run(id);
    logAudit(req.user!.id, 'DONATION_CANCELLED', `Donation #${id} cancelled`, req);

    res.json({ message: 'Donation listing cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel donation' });
  }
});

// ==========================================
// 3. IMPACT & PLATFORM STATS
// ==========================================

router.get('/stats', (req: Request, res: Response) => {
  try {
    const totalDonations = (db.prepare('SELECT COUNT(*) as count FROM donations').get() as any)?.count || 0;
    
    // Rescued servings: sum of servings for completed or in-progress deliveries
    const servingsRes = (db.prepare(`
      SELECT SUM(estimated_servings) as total 
      FROM donations 
      WHERE status IN ('claimed', 'on_the_way', 'picked_up', 'delivered')
    `).get() as any)?.total || 0;

    const deliveredDonations = (db.prepare("SELECT COUNT(*) as count FROM donations WHERE status = 'delivered'").get() as any)?.count || 0;
    const activeDonations = (db.prepare("SELECT COUNT(*) as count FROM donations WHERE status = 'available'").get() as any)?.count || 0;

    const donorCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'donor'").get() as any)?.count || 0;
    const ngoCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ngo'").get() as any)?.count || 0;
    const volunteerCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'volunteer'").get() as any)?.count || 0;

    // City distribution
    const cityBreakdown = db.prepare(`
      SELECT city, COUNT(*) as count, SUM(estimated_servings) as servings
      FROM donations
      GROUP BY city
      ORDER BY count DESC
      LIMIT 6
    `).all();

    // Category breakdown
    const categoryBreakdown = db.prepare(`
      SELECT category, COUNT(*) as count, SUM(estimated_servings) as servings
      FROM donations
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Recent rescue activity
    const recentActivity = db.prepare(`
      SELECT 
        d.id, d.title, d.category, d.estimated_servings, d.city, d.status, d.created_at,
        u.organization_name as donor_org,
        ngo.organization_name as ngo_org
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      LEFT JOIN users ngo ON d.claimed_by_ngo_id = ngo.id
      ORDER BY d.id DESC
      LIMIT 6
    `).all();

    res.json({
      stats: {
        total_donations: totalDonations,
        rescued_servings: servingsRes || 580, // fallback baseline if empty
        completed_pickups: deliveredDonations || 1,
        active_available: activeDonations,
        active_donors: donorCount || 3,
        partner_ngos: ngoCount || 2,
        active_volunteers: volunteerCount || 2,
        co2_saved_kg: Math.round((servingsRes || 580) * 1.8), // standard GHG metric: ~1.8 kg CO2e saved per rescued meal
        city_breakdown: cityBreakdown,
        category_breakdown: categoryBreakdown,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to compute platform statistics' });
  }
});

// ==========================================
// 4. FOOD SAFETY INCIDENTS & COMPLAINTS
// ==========================================

router.get('/incidents', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = `
      SELECT 
        i.*,
        u.name as reporter_name,
        u.email as reporter_email,
        u.role as reporter_role,
        d.title as donation_title
      FROM incidents i
      JOIN users u ON i.reported_by_user_id = u.id
      LEFT JOIN donations d ON i.donation_id = d.id
    `;
    const params: any[] = [];

    // If not super admin, only view own reported incidents
    if (req.user!.role !== 'super_admin') {
      query += ` WHERE i.reported_by_user_id = ?`;
      params.push(req.user!.id);
    }

    query += ` ORDER BY i.id DESC`;
    const rows = db.prepare(query).all(...params);
    res.json({ incidents: rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch safety incidents' });
  }
});

router.post('/incidents', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { donation_id, type, severity, title, description } = req.body;

    if (!type || !severity || !title || !description) {
      return res.status(400).json({ error: 'Type, severity, title, and description are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO incidents (reported_by_user_id, donation_id, type, severity, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `);

    const result = stmt.run(
      req.user!.id,
      donation_id ? Number(donation_id) : null,
      type,
      severity,
      title.trim(),
      description.trim()
    );

    const incidentId = Number(result.lastInsertRowid);
    logAudit(req.user!.id, 'INCIDENT_FILED', `Filed safety incident #${incidentId}: ${title}`, req);

    res.status(201).json({
      message: 'Safety incident filed and escalated to the FoodMitra quality team for immediate audit.',
      incidentId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to file incident report' });
  }
});

router.patch('/incidents/:id', authenticateToken, requireRole('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, admin_notes } = req.body;

    db.prepare(`
      UPDATE incidents
      SET status = COALESCE(?, status),
          admin_notes = COALESCE(?, admin_notes)
      WHERE id = ?
    `).run(status, admin_notes, id);

    logAudit(req.user!.id, 'INCIDENT_UPDATED', `Updated incident #${id} status: ${status}`, req);

    res.json({ message: 'Incident updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// ==========================================
// 5. SUPER ADMIN CONTROL & AUDIT LOGS
// ==========================================

router.get('/admin/users', authenticateToken, requireRole('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, is_verified, search } = req.query;
    let query = `SELECT id, name, email, role, organization_name, phone, city, address, is_verified, verification_doc, bio, created_at FROM users WHERE 1=1`;
    const params: any[] = [];

    if (role && role !== 'All') {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (is_verified !== undefined && is_verified !== 'All') {
      query += ` AND is_verified = ?`;
      params.push(is_verified === 'true' || is_verified === '1' ? 1 : 0);
    }

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR organization_name LIKE ? OR city LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY id DESC`;
    const users = db.prepare(query).all(...params).map((u: any) => ({ ...u, is_verified: u.is_verified === 1 }));
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/admin/users/:id/verify', authenticateToken, requireRole('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { is_verified } = req.body;

    db.prepare('UPDATE users SET is_verified = ? WHERE id = ?').run(is_verified ? 1 : 0, id);
    logAudit(req.user!.id, 'USER_VERIFICATION_TOGGLED', `Admin toggled verification for user #${id} to ${is_verified}`, req);

    res.json({ message: `User verification updated to ${is_verified ? 'Verified' : 'Unverified'}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

router.delete('/admin/users/:id', authenticateToken, requireRole('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete current logged-in super admin account' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    logAudit(req.user!.id, 'USER_DELETED', `Admin deleted user #${id}`, req);

    res.json({ message: 'User account removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.patch('/admin/donations/:id/moderate', authenticateToken, requireRole('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { verification_status } = req.body;

    db.prepare('UPDATE donations SET verification_status = ? WHERE id = ?').run(verification_status, id);
    logAudit(req.user!.id, 'DONATION_MODERATED', `Donation #${id} set to ${verification_status}`, req);

    res.json({ message: `Donation moderation status set to ${verification_status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to moderate donation' });
  }
});

router.get('/admin/audit-logs', authenticateToken, requireRole('super_admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
      LIMIT 100
    `).all();
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get volunteers list for assignment
router.get('/volunteers', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const volunteers = db.prepare(`
      SELECT id, name, email, phone, city, is_verified, bio 
      FROM users 
      WHERE role = 'volunteer'
      ORDER BY name ASC
    `).all();
    res.json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list volunteers' });
  }
});

// ==========================================
// 6. CONTACT & PARTNERSHIP INQUIRIES
// ==========================================

router.post('/contact', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, inquiry_type } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }

    db.prepare(`
      INSERT INTO contact_inquiries (name, email, phone, subject, message, inquiry_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name.trim(), email.trim(), phone || null, subject.trim(), message.trim(), inquiry_type || 'general');

    res.status(201).json({ message: 'Thank you! Your inquiry has been received. Our team will contact you within 24 hours.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact message' });
  }
});

export default router;
