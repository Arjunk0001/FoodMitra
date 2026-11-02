# PROJECT REPORT
## FOODMITRA: TECHNOLOGY-ENABLED SURPLUS FOOD RESCUE & DONATION PLATFORM

---

### 1. PROJECT TITLE & DETAILS
- **Project Name:** FoodMitra
- **Tagline:** “Rescuing Surplus Food, Restoring Dignity”
- **Domain:** Social Impact, Full-Stack Web Development, Supply Chain Logistics & Food Safety
- **Developed By:** Arjun Kushwaha
- **Technology Stack:** 
  - **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Leaflet / React-Leaflet
  - **Backend:** Node.js, Express.js (RESTful Architecture)
  - **Database:** SQLite with relational constraints, foreign keys & indexes
  - **Security & Auth:** JSON Web Tokens (JWT), Bcrypt password hashing, RBAC (Role-Based Access Control)

---

### 2. ABSTRACT (संक्षेप)
Every day, thousands of kilograms of fresh, edible food from wedding banquets, hotels, corporate cafeterias, and event caterers are thrown into garbage dumps. Meanwhile, millions of underprivileged individuals, orphanage children, and shelter home residents suffer from acute malnutrition. 

**FoodMitra** is a full-stack technology solution designed to eliminate commercial food wastage and hunger. It connects commercial food donors with verified non-governmental organizations (NGOs) and volunteer rescue fleets in real time. Built with strict food hygiene standards (HACCP temperature protocols, allergen declarations, and non-negotiable safe-consumption deadlines), FoodMitra ensures food is safely claimed, dispatched, and served within 60 to 90 minutes of surplus generation.

---

### 3. PROBLEM STATEMENT
1. **Massive Commercial Food Wastage:** Banquets and luxury hotels produce 15% to 25% surplus buffer food that ends up in municipal landfills, generating harmful methane emissions.
2. **Logistical Disconnect:** Donors lack an automated, timely mechanism to locate nearby charity shelters before food perishes.
3. **Food Safety & Liability Concerns:** Without verified timestamps, allergen tags, and temperature control (hot holding >63°C, cold chain <4°C), charity institutions hesitate to accept uninspected food.
4. **Lack of Traceability:** In traditional informal donation, there is no digital trail of food quality, pickup confirmation, volunteer assignment, or beneficiary receipt.

---

### 4. PROPOSED SYSTEM & OBJECTIVES
FoodMitra addresses these challenges through a centralized, role-governed digital platform:
- **Zero Expired Food Policy:** Enforces client- and database-level hard gates that programmatically reject expired or past-deadline food listings.
- **Role-Based Access Control (RBAC):** Distinct interfaces and backend-verified permissions for 4 user types:
  1. **Super Admin:** Platform governance, donor verification, moderation, incident auditing, and security logs.
  2. **Food Donors (Hotels, Banquets, Caterers):** Rapid food listing, pickup window setting, ESG certificate generation.
  3. **Verified NGOs & Shelters:** Real-time food discovery, distance filtering, 1-click claim, volunteer allocation.
  4. **Volunteers:** Route directions, contact details of kitchen dispatchers, milestone status progression (`Assigned` ➔ `On the Way` ➔ `Picked Up` ➔ `Delivered`).
- **Live Geospatial Mapping:** Interactive map with pin clustering and urgent countdown timers (<4 hours).
- **Incident & Quality Reporting:** Formal complaint and audit mechanism for damaged containers or temperature violations.

---

### 5. SYSTEM ARCHITECTURE & WORKFLOW

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                    |
|   (React 19 + TypeScript + Tailwind CSS + Leaflet Maps + Instant Demo Switcher)   |
+-----------------------------------------------------------------------------------+
                                         |
                                (REST API / JWT Auth)
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                  BACKEND SERVER                                   |
|               (Node.js + Express.js API Middleware + Security Layer)               |
|                                                                                   |
|  - Auth Routes (/api/auth/*)       - Donation Routes (/api/donations/*)           |
|  - Incident Routes (/api/incidents)- Admin & Audit Routes (/api/admin/*)          |
+-----------------------------------------------------------------------------------+
                                         |
                               (Parameterized SQL)
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                 RELATIONAL DATABASE                               |
|                               (SQLite Engine - persistent)                        |
|                                                                                   |
|  - users              - donations           - incidents                           |
|  - audit_logs         - contact_inquiries   - indexes (status, city, use_by_time) |
+-----------------------------------------------------------------------------------+
```

#### The 6-Step Operational Pipeline:
1. **Listing:** Donor inputs preparation time, safe consumption deadline, servings, temperature, and allergens.
2. **Safety Check:** System evaluates timestamp; expired food is blocked immediately.
3. **Claiming:** Registered NGO receives push alert and reserves the food batch with 1 click.
4. **Volunteer Dispatch:** Volunteer or rescue van is assigned with navigation details and direct phone contact.
5. **Collection:** Handover occurs with physical seal and temperature validation; status changes to `Picked Up`.
6. **Distribution:** Meals are served with dignity at shelter home; delivery is signed off with impact logged permanently.

---

### 6. DATABASE SCHEMA DESIGN

#### 1. `users` Table
- `id` (INTEGER, Primary Key, Auto Increment)
- `name` (TEXT, Not Null)
- `email` (TEXT, Unique, Not Null)
- `password_hash` (TEXT, Bcrypt salted hash)
- `role` (TEXT: `'super_admin'`, `'donor'`, `'ngo'`, `'volunteer'`)
- `organization_name` (TEXT)
- `phone` (TEXT)
- `address` (TEXT)
- `city` (TEXT)
- `is_verified` (INTEGER: 0 or 1)
- `verification_doc` (TEXT - FSSAI license / NGO Trust ID)
- `bio` (TEXT)
- `created_at` (TIMESTAMP)

#### 2. `donations` Table
- `id` (INTEGER, Primary Key)
- `donor_id` (INTEGER, Foreign Key referencing `users.id`)
- `title`, `description`, `category`, `dietary` (Vegetarian / Non-Vegetarian / Vegan)
- `quantity`, `estimated_servings` (INTEGER)
- `prep_time`, `use_by_time` (ISO Timestamps)
- `storage_condition` (Hot Holding >63°C, Cold 0-4°C, Room Temp)
- `packaging_type`, `allergens` (TEXT)
- `pickup_address`, `city`, `latitude`, `longitude`
- `pickup_window_start`, `pickup_window_end`
- `contact_name`, `contact_phone`
- `image_url`
- `safety_certified` (INTEGER, 1)
- `verification_status` (`'pending_verification'`, `'verified'`, `'flagged'`, `'rejected'`)
- `status` (`'available'`, `'claimed'`, `'on_the_way'`, `'picked_up'`, `'delivered'`, `'expired'`, `'cancelled'`)
- `claimed_by_ngo_id`, `assigned_volunteer_id`
- `claimed_at`, `picked_up_at`, `delivered_at`, `delivery_notes`
- `created_at` (TIMESTAMP)

#### 3. `incidents` Table
- `id` (INTEGER, Primary Key)
- `reported_by_user_id` (INTEGER, FK to `users.id`)
- `donation_id` (INTEGER, FK to `donations.id`)
- `type`, `severity` (`'low'`, `'medium'`, `'high'`, `'critical'`)
- `title`, `description`, `status` (`'open'`, `'investigating'`, `'resolved'`, `'dismissed'`)
- `admin_notes`, `created_at`

#### 4. `audit_logs` & `contact_inquiries` Tables
- Tracks immutable system events (logins, status changes, moderations, IP addresses) and partnership inquiries.

---

### 7. KEY MODULES & FUNCTIONALITY

| Module | Features & Capabilities |
| :--- | :--- |
| **Public Landing Platform** | Responsive hero, live stats counter, 6-step timeline, testimonials, FAQ, contact hotline |
| **Available Food Directory** | Search by dish/landmark, city & dietary filters, interactive Leaflet map, distance calculation, countdown badge |
| **Donation Listing Engine** | Strict expiration gate, food photo selector, allergen disclosure, mandatory food safety certification |
| **Role-Based Auth** | JWT sessions, Bcrypt password hashing, instant 1-click demo switcher for project evaluation |
| **Donor Dashboard** | Active listings monitor, claim tracking, CSV ESG export, printable official impact certificate |
| **NGO Dashboard** | Real-time surplus feed, 1-click claim, volunteer fleet dispatch, delivery milestone updates |
| **Volunteer Dashboard** | 4-step progress stepper, dispatcher telephone links, thermal bag checklists, supervisor delivery sign-off |
| **Super Admin Console** | City/Category analytics, user verification toggle, donation moderation, incident triage, security audit logs |
| **Food Safety Desk** | Global modal to report temperature abuse, packaging tears, or hygiene non-compliance |

---

### 8. INNOVATIVE & TECHNICAL HIGHLIGHTS
1. **Full-Stack Single-Repository Integration:** Backend Express REST API runs alongside Vite in development and production without configuration drift.
2. **Server-Side Security Verification:** Privileged operations (claiming, assigning, verifying, moderating) are strictly authenticated on the backend, not solely on the frontend UI.
3. **Environmental Metric (CO₂e Calculation):** Programmatically computes avoided carbon equivalent (1.8 kg CO₂e saved per rescued meal) to quantify sustainability impact.
4. **Pre-Seeded Real-World Dataset:** Includes realistic operational data across Mumbai, Bengaluru, and New Delhi for immediate viva demonstration.

---

### 9. FUTURE ENHANCEMENTS
1. **IoT Temperature Probe Integration:** Automated Bluetooth logging of transport container temperature.
2. **AI-Assisted Portion Estimation:** Image recognition to estimate buffet tray servings automatically.
3. **SMS / WhatsApp Gateway:** Automated automated alerts for volunteers when emergency night pickups are requested.
4. **Direct Route Optimization:** Multi-stop pickup route planning for NGO rescue vans.

---

### 10. CONCLUSION
FoodMitra successfully proves that technology, when applied with rigorous domain discipline and food safety standards, can bridge the gap between commercial surplus food and community hunger. It is robust, user-friendly, responsive, and ready for real-world deployment.
