export type UserRole = 'super_admin' | 'donor' | 'ngo' | 'volunteer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  is_verified: boolean;
  verification_doc?: string;
  bio?: string;
  created_at?: string;
}

export type DonationStatus = 'available' | 'claimed' | 'on_the_way' | 'picked_up' | 'delivered' | 'expired' | 'cancelled';
export type VerificationStatus = 'pending_verification' | 'verified' | 'flagged' | 'rejected';

export interface Donation {
  id: number;
  donor_id: number;
  title: string;
  description: string;
  category: string;
  dietary: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
  quantity: string;
  estimated_servings: number;
  prep_time: string;
  use_by_time: string;
  storage_condition: string;
  packaging_type: string;
  allergens?: string;
  pickup_address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  pickup_window_start: string;
  pickup_window_end: string;
  contact_name: string;
  contact_phone: string;
  image_url: string;
  safety_certified: boolean;
  verification_status: VerificationStatus;
  status: DonationStatus;
  claimed_by_ngo_id?: number | null;
  assigned_volunteer_id?: number | null;
  claimed_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  delivery_notes?: string | null;
  created_at: string;

  // Joined fields
  donor_name?: string;
  donor_org?: string;
  donor_verified?: boolean;
  claimed_by_ngo_name?: string;
  claimed_by_ngo_org?: string;
  claimed_by_ngo_phone?: string;
  volunteer_name?: string;
  volunteer_phone?: string;
  hours_remaining?: number;
  is_expired?: boolean;
  is_urgent?: boolean;
}

export interface PlatformStats {
  total_donations: number;
  rescued_servings: number;
  completed_pickups: number;
  active_available: number;
  active_donors: number;
  partner_ngos: number;
  active_volunteers: number;
  co2_saved_kg: number;
  city_breakdown: Array<{ city: string; count: number; servings: number }>;
  category_breakdown: Array<{ category: string; count: number; servings: number }>;
  recent_activity: Array<{
    id: number;
    title: string;
    category: string;
    estimated_servings: number;
    city: string;
    status: DonationStatus;
    created_at: string;
    donor_org?: string;
    ngo_org?: string;
  }>;
}

export interface IncidentReport {
  id: number;
  reported_by_user_id: number;
  donation_id?: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_role?: string;
  donation_title?: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
}
