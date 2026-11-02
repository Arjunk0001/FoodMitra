import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { User, Donation, PlatformStats, IncidentReport, AuditLog } from '../../types';
import { StatusBadge, DietaryBadge, VerifiedBadge } from '../../components/common/Badge';
import {
  Shield,
  Users,
  Utensils,
  AlertTriangle,
  Building2,
  Bike,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  BarChart3,
  FileText,
  Clock,
  ShieldAlert,
  Trash2,
  Check,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onOpenReportModal?: (donationId?: number, title?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenReportModal }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'donations' | 'incidents' | 'audit'>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [incidentsList, setIncidentsList] = useState<IncidentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for user management
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Incident resolution dialog
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [incidentResolutionStatus, setIncidentResolutionStatus] = useState<'investigating' | 'resolved' | 'dismissed'>('resolved');
  const [adminIncidentNotes, setAdminIncidentNotes] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, dRes, iRes, aRes] = await Promise.all([
        api.getStats(),
        api.getAdminUsers(),
        api.getDonations(),
        api.getIncidents(),
        api.getAuditLogs(),
      ]);
      setStats(sRes.stats);
      setUsersList(uRes.users);
      setDonationsList(dRes.donations);
      setIncidentsList(iRes.incidents);
      setAuditLogs(aRes.logs);
    } catch (err: any) {
      console.error(err);
      error('Admin access error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Toggle user verification
  const handleToggleVerification = async (u: User) => {
    try {
      await api.toggleUserVerification(u.id, !u.is_verified);
      success('Verification Updated', `${u.name} is now ${!u.is_verified ? 'Verified' : 'Unverified'}.`);
      loadAdminData();
    } catch (err: any) {
      error('Failed to update verification', err.message);
    }
  };

  // Moderate donation (approve, flag, reject)
  const handleModerateDonation = async (donationId: number, status: string) => {
    try {
      await api.moderateDonation(donationId, status);
      success('Moderation Applied', `Donation #${donationId} is now marked as ${status}.`);
      loadAdminData();
    } catch (err: any) {
      error('Moderation Error', err.message);
    }
  };

  // Delete / suspend user
  const handleDeleteUser = async (userId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"? This action is logged.`)) return;
    try {
      await api.deleteUser(userId);
      success('User Removed', `Account ${name} has been removed.`);
      loadAdminData();
    } catch (err: any) {
      error('Delete Error', err.message);
    }
  };

  // Resolve incident
  const handleResolveIncident = async () => {
    if (!selectedIncident) return;
    try {
      await api.updateIncident(selectedIncident.id, {
        status: incidentResolutionStatus,
        admin_notes: adminIncidentNotes || 'Inspected by Admin compliance desk. Action completed.',
      });
      success('Incident Updated', `Ticket #${selectedIncident.id} updated to ${incidentResolutionStatus}.`);
      setSelectedIncident(null);
      setAdminIncidentNotes('');
      loadAdminData();
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'All' && u.role !== userRoleFilter) return false;
    if (userSearch) {
      const term = userSearch.toLowerCase();
      const match =
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.organization_name && u.organization_name.toLowerCase().includes(term)) ||
        (u.city && u.city.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const pendingVerificationCount = usersList.filter((u) => !u.is_verified && u.role !== 'super_admin').length;
  const openIncidentsCount = incidentsList.filter((i) => i.status === 'open' || i.status === 'investigating').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-[#064E3B] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-200 text-purple-950 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Super Admin Control Desk
            </span>
            <span className="text-xs text-emerald-300 font-semibold">Real-Time Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            FoodMitra Central Command Center
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80">
            Trust moderation, donor verification, food safety incident triage, and audit trail logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Rescued Servings</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{stats ? stats.rescued_servings.toLocaleString() : '580'}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Safe portions served</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Registered Users</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">{usersList.length}</p>
          <span className="text-[11px] text-gray-500">Donors, NGOs, Volunteers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Pending Verification</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingVerificationCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">Requires document audit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Active Incidents</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-600">{openIncidentsCount}</p>
          <span className="text-[11px] text-red-700 font-medium">Safety tickets filed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">CO₂e Landfill Avoided</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-800">{stats ? stats.co2_saved_kg.toLocaleString() : '1,040'} kg</p>
          <span className="text-[11px] text-teal-600 font-medium">Methane averted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Analytics &amp; City Breakdown
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>User &amp; Org Management</span>
          {pendingVerificationCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-900">
              {pendingVerificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'donations' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Donations Moderation ({donationsList.length})
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'incidents' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Food Safety Incidents</span>
          {openIncidentsCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-900">
              {openIncidentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'audit' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Distribution Chart/Bars */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#066B4B]" />
                  City-Wise Food Rescue Volume
                </h3>
                <span className="text-xs text-gray-500">Top Metros</span>
              </div>

              <div className="space-y-3">
                {stats.city_breakdown.map((item, idx) => {
                  const maxServings = Math.max(...stats.city_breakdown.map((c) => c.servings || 1));
                  const percentage = Math.min(100, Math.round(((item.servings || 1) / maxServings) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-800">{item.city}</span>
                        <span className="font-semibold text-emerald-800">
                          {item.servings} Servings ({item.count} batches)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#066B4B] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#066B4B]" />
                  Food Category Distribution
                </h3>
                <span className="text-xs text-gray-500">By Servings</span>
              </div>

              <div className="space-y-3">
                {stats.category_breakdown.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                    <span className="font-bold text-gray-800">{cat.category}</span>
                    <div className="text-right">
                      <strong className="text-emerald-900">{cat.servings} Servings</strong>
                      <span className="text-gray-500 block text-[11px]">{cat.count} listings</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User & Org Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">User &amp; Organization Directory</h3>
              <p className="text-xs text-gray-500">Verify licenses, manage permissions, and audit compliance</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user, org or city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-300 focus:border-[#066B4B]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-gray-300"
              >
                <option value="All">All Roles</option>
                <option value="donor">Donors</option>
                <option value="ngo">NGOs</option>
                <option value="volunteer">Volunteers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization / Kitchen</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <strong className="block text-gray-900">{u.name}</strong>
                      <span className="text-[11px] text-gray-500">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-gray-800">{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{u.organization_name || '—'}</span>
                      {u.verification_doc && (
                        <span className="block text-[10px] text-gray-400">Doc: {u.verification_doc}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{u.city || 'Mumbai'}</td>
                    <td className="py-3 px-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-[#066B4B]" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleVerification(u)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                            u.is_verified
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-[#066B4B] hover:bg-[#064E3B] text-white shadow-2xs'
                          }`}
                        >
                          {u.is_verified ? 'Revoke Verification' : 'Verify Account'}
                        </button>

                        {u.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Donations Moderation */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">Food Donation Moderation Desk</h3>
              <p className="text-xs text-gray-500">Audit use-by compliance, flag suspicious entries, or inspect packaging integrity</p>
            </div>
            <span className="text-xs text-gray-500">{donationsList.length} Total Listings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Donor Org</th>
                  <th className="py-3 px-4">Servings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Moderation</th>
                  <th className="py-3 px-4 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {donationsList.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 px-4 font-bold text-gray-900">#{d.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{d.title}</td>
                    <td className="py-3 px-4">{d.donor_org || d.donor_name}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{d.estimated_servings}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.verification_status === 'verified'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : d.verification_status === 'flagged'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {d.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleModerateDonation(d.id, 'verified')}
                          className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateDonation(d.id, 'flagged')}
                          className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px]"
                        >
                          Flag
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Food Safety Incidents */}
      {activeTab === 'incidents' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Food Safety Audits &amp; Complaints Log
              </h3>
              <p className="text-xs text-gray-500">Reported issues regarding temperature abuse, seal damage, or late deliveries</p>
            </div>
            <span className="text-xs font-bold text-red-800 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              {openIncidentsCount} Open Tickets
            </span>
          </div>

          {incidentsList.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No safety incidents reported.</p>
          ) : (
            <div className="space-y-4">
              {incidentsList.map((inc) => (
                <div
                  key={inc.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        inc.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : inc.severity === 'high'
                          ? 'bg-orange-500 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {inc.severity} Severity
                      </span>
                      <span className="font-bold text-gray-900 text-sm">#{inc.id}: {inc.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Status: {inc.status}
                      </span>
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-3 py-1 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
                      >
                        Triage / Resolve
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Reported by: <strong>{inc.reporter_name}</strong> ({inc.reporter_role})</span>
                    <span>Date: {new Date(inc.created_at).toLocaleString()}</span>
                  </div>

                  {inc.admin_notes && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                      <strong>Admin Action Note:</strong> {inc.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">System Security &amp; Transaction Audit Log</h3>
              <p className="text-xs text-gray-500">Immutable trace of donor listings, claims, volunteer status shifts, and logins</p>
            </div>
            <span className="text-xs text-gray-500">{auditLogs.length} Events Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 font-mono text-[11px]">
                    <td className="py-2.5 px-4 font-bold text-gray-900">#{log.id}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#066B4B]">{log.action}</td>
                    <td className="py-2.5 px-4">{log.user_name || 'System / Guest'}</td>
                    <td className="py-2.5 px-4 max-w-sm truncate text-gray-800">{log.details}</td>
                    <td className="py-2.5 px-4 text-gray-400">{log.ip_address}</td>
                    <td className="py-2.5 px-4 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incident Resolution Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border space-y-4 animate-scale-in">
            <h3 className="font-bold text-gray-900 text-base">Triage Safety Incident #{selectedIncident.id}</h3>
            <p className="text-xs text-gray-500">{selectedIncident.title}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Set Status</label>
                <select
                  value={incidentResolutionStatus}
                  onChange={(e) => setIncidentResolutionStatus(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                >
                  <option value="investigating">Under Active Kitchen Investigation</option>
                  <option value="resolved">Resolved (Corrective Protocol Enforced)</option>
                  <option value="dismissed">Dismissed (False Report / Retracted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Compliance Audit Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record corrective actions, donor retraining, or batch disposal confirmation..."
                  value={adminIncidentNotes}
                  onChange={(e) => setAdminIncidentNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveIncident}
                className="px-5 py-2.5 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
