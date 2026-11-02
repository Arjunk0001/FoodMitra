import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Donation } from '../../types';
import { StatusBadge, DietaryBadge, VerifiedBadge, UrgencyBadge } from '../../components/common/Badge';
import {
  Utensils,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  Truck,
  FileText,
  MapPin,
  Calendar,
  XCircle,
  Phone,
  User,
  ShieldCheck,
  Award
} from 'lucide-react';

interface DonorDashboardProps {
  onNavigate: (page: string) => void;
  onOpenReportModal?: (donationId?: number, title?: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate, onOpenReportModal }) => {
  const { user, updateProfile } = useAuth();
  const { success, error, info } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'history' | 'impact' | 'profile'>('listings');

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Mumbai',
    organization_name: user?.organization_name || '',
    bio: user?.bio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadDonorDonations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getDonations({ donor_id: user.id });
      setDonations(res.donations);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonorDonations();
  }, [user]);

  const handleCancelDonation = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this food donation?')) return;
    try {
      await api.cancelDonation(id);
      success('Donation Cancelled', 'The listing has been marked as cancelled.');
      loadDonorDonations();
    } catch (err: any) {
      error('Failed to cancel', err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      success('Profile Updated', 'Organization details saved successfully.');
    } catch (err: any) {
      error('Failed to update', err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Export report as CSV
  const handleExportCSV = () => {
    if (donations.length === 0) {
      info('No Data', 'No donations recorded yet to export.');
      return;
    }

    const headers = ['Donation ID', 'Title', 'Category', 'Servings', 'Quantity', 'City', 'Status', 'Claimed By NGO', 'Date Listed'];
    const rows = donations.map((d) => [
      d.id,
      `"${d.title.replace(/"/g, '""')}"`,
      d.category,
      d.estimated_servings,
      `"${d.quantity}"`,
      d.city,
      d.status,
      `"${d.claimed_by_ngo_org || d.claimed_by_ngo_name || 'Unclaimed'}"`,
      d.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FoodMitra_Donation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Report Exported', 'CSV summary downloaded successfully.');
  };

  // Metrics
  const activeListings = donations.filter((d) => d.status === 'available' || d.status === 'claimed' || d.status === 'on_the_way' || d.status === 'picked_up');
  const deliveredListings = donations.filter((d) => d.status === 'delivered');
  const totalServingsRescued = donations.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.estimated_servings : 0), 0);
  const totalCo2Saved = Math.round(totalServingsRescued * 1.8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#064E3B] to-[#066B4B] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B9E769] text-[#064E3B]">
              Donor Workspace
            </span>
            {user?.is_verified ? (
              <span className="flex items-center gap-1 text-xs text-emerald-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B9E769]" /> Verified Kitchen Partner
              </span>
            ) : (
              <span className="text-xs text-amber-300 font-medium">Pending Admin Document Review</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.organization_name || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            {user?.address ? `${user.address}, ${user.city}` : 'Manage surplus food dispatches & verify safety compliance'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('donate-food')}
            className="px-5 py-3 bg-[#B9E769] hover:bg-[#a5d852] text-[#064E3B] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#064E3B]" />
            <span>List New Surplus Food</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 shrink-0"
            title="Download CSV report of all your listings"
          >
            <Download className="w-4 h-4" />
            <span>Export ESG Report</span>
          </button>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Active Listings</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{activeListings.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Live on platform</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Total Servings Rescued</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{totalServingsRescued.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500">Meals fed to shelters</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Successful Pickups</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{deliveredListings.length}</p>
          <span className="text-[11px] text-gray-500">Completed cycles</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">CO₂e Emissions Averted</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{totalCo2Saved.toLocaleString()} kg</p>
          <span className="text-[11px] text-teal-700 font-medium">Organic landfill savings</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-gray-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'listings' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Active Food Listings ({activeListings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'history' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Donation History ({donations.length})
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'impact' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Impact &amp; ESG Certificate
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'profile' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Kitchen &amp; Organization Profile
        </button>
      </div>

      {/* Tab 1: Active Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border">Loading active listings...</div>
          ) : activeListings.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#066B4B] flex items-center justify-center mx-auto">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">No Active Surplus Listings</h3>
              <p className="text-xs text-gray-500">
                You have no active food batches waiting for pickup right now. List surplus buffets or bakery items anytime.
              </p>
              <button
                onClick={() => onNavigate('donate-food')}
                className="px-4 py-2 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Create Food Listing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} size="sm" />
                        <DietaryBadge dietary={item.dietary} />
                        <UrgencyBadge hoursRemaining={item.hours_remaining ?? 4} />
                      </div>
                      <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">
                        {item.estimated_servings} Servings ({item.quantity}) • Storage: {item.storage_condition}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Pickup window: <strong>{item.pickup_window_start} - {item.pickup_window_end}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Status / Claim details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                    {item.claimed_by_ngo_org ? (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-0.5">
                        <span className="font-bold block text-blue-800">Claimed by Partner NGO:</span>
                        <p className="font-semibold">{item.claimed_by_ngo_org}</p>
                        {item.volunteer_name && (
                          <p className="text-[11px] text-blue-700">
                            Volunteer: <strong>{item.volunteer_name}</strong> ({item.volunteer_phone || 'Assigned'})
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        Awaiting NGO claim
                      </div>
                    )}

                    {item.status === 'available' && (
                      <button
                        onClick={() => handleCancelDonation(item.id)}
                        className="p-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
                        title="Cancel listing"
                      >
                        Cancel Listing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Donation History Table */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Historical Food Rescue Records</h3>
            <span className="text-xs text-gray-500">{donations.length} Total records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Servings</th>
                  <th className="py-3 px-4">Claiming NGO</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">#{d.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{d.title}</td>
                    <td className="py-3 px-4">{d.category}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{d.estimated_servings}</td>
                    <td className="py-3 px-4">{d.claimed_by_ngo_org || d.claimed_by_ngo_name || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Impact & ESG Certificate */}
      {activeTab === 'impact' && (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#066B4B] text-xs font-bold mb-2">
                <Award className="w-4 h-4" /> Official CSR &amp; ESG Statement
              </div>
              <h2 className="text-2xl font-extrabold text-[#064E3B]">
                Surplus Food Diversion Certificate
              </h2>
              <p className="text-xs text-gray-500">Generated by FoodMitra Central Audit Authority</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 self-start"
            >
              <Download className="w-4 h-4" />
              <span>Print / Download Certificate</span>
            </button>
          </div>

          <div className="border-4 border-emerald-100 rounded-2xl p-6 sm:p-8 bg-[#FBFDFB] space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-bold text-[#066B4B] tracking-widest">
                Certificate of Social Impact
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {user?.organization_name || user?.name}
              </h3>
              <p className="text-xs text-gray-500">
                Registered Food Rescue Donor • Location: {user?.city || 'Mumbai'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-medium">Meals Rescued</span>
                <p className="text-2xl font-extrabold text-[#064E3B]">{totalServingsRescued.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-medium">Shelter Deliveries</span>
                <p className="text-2xl font-extrabold text-[#064E3B]">{deliveredListings.length}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-xs text-gray-500 font-medium">CO₂e Diverted</span>
                <p className="text-2xl font-extrabold text-[#064E3B]">{totalCo2Saved.toLocaleString()} kg</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed text-center max-w-xl mx-auto">
              This confirms that the above commercial donor has maintained certified compliance with FoodMitra hygienic redistribution guidelines, successfully preventing banquet food waste and supporting local under-resourced communities with dignity.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Kitchen Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Organization &amp; Dispatch Bay Details</h3>
            <p className="text-xs text-gray-500">Keep your pickup address and contact details accurate for prompt volunteer dispatch.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization / Hotel Name</label>
              <input
                type="text"
                required
                value={profileForm.organization_name}
                onChange={(e) => setProfileForm({ ...profileForm, organization_name: e.target.value })}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Dispatch Manager</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Direct Kitchen Phone</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dispatch Bay Address &amp; Gate</label>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Kitchen / Cuisine Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            {savingProfile ? 'Saving...' : 'Save Organization Details'}
          </button>
        </form>
      )}
    </div>
  );
};
