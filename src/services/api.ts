import { User, Donation, PlatformStats, IncidentReport, AuditLog } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('foodmitra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async register(userData: any): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async login(credentials: { email: string; password: string }): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData: Partial<User>): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async resetPassword(email: string, new_password?: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, new_password }),
    });
    return handleResponse(res);
  },

  // Donations
  async getDonations(params?: {
    category?: string;
    dietary?: string;
    city?: string;
    status?: string;
    search?: string;
    urgentOnly?: boolean;
    donor_id?: number;
  }): Promise<{ donations: Donation[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/donations?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getDonationById(id: number): Promise<{ donation: Donation }> {
    const res = await fetch(`${API_BASE}/donations/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async createDonation(data: any): Promise<{ message: string; donationId: number }> {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async claimDonation(id: number): Promise<{ message: string; claimedAt: string }> {
    const res = await fetch(`${API_BASE}/donations/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async assignVolunteer(donationId: number, volunteerId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/donations/${donationId}/assign-volunteer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ volunteer_id: volunteerId }),
    });
    return handleResponse(res);
  },

  async updateDonationStatus(
    id: number,
    status: string,
    delivery_notes?: string
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/donations/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, delivery_notes }),
    });
    return handleResponse(res);
  },

  async cancelDonation(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/donations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Stats
  async getStats(): Promise<{ stats: PlatformStats }> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res);
  },

  // Incidents
  async getIncidents(): Promise<{ incidents: IncidentReport[] }> {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async reportIncident(data: {
    donation_id?: number | null;
    type: string;
    severity: string;
    title: string;
    description: string;
  }): Promise<{ message: string; incidentId: number }> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateIncident(id: number, data: { status: string; admin_notes?: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminUsers(params?: { role?: string; is_verified?: string; search?: string }): Promise<{ users: User[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async toggleUserVerification(userId: number, is_verified: boolean): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ is_verified }),
    });
    return handleResponse(res);
  },

  async deleteUser(userId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async moderateDonation(donationId: number, verification_status: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/donations/${donationId}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ verification_status }),
    });
    return handleResponse(res);
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getVolunteers(): Promise<{ volunteers: User[] }> {
    const res = await fetch(`${API_BASE}/volunteers`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Contact
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    inquiry_type?: string;
  }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};
