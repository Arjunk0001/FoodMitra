import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Donation, User } from '../../types';
import { StatusBadge, DietaryBadge, VerifiedBadge, UrgencyBadge } from '../../components/common/Badge';
import {
  Building2,
  Utensils,
  MapPin,
  Clock,
  Bike,
  CheckCircle2,
  Phone,
  Search,
  Filter,
  Check,
  Award,
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';

interface NgoDashboardProps {
  onNavigate: (page: string) => void;
  onOpenReportModal?: (donationId?: number, title?: string) => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({ onNavigate, onOpenReportModal }) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'available' | 'claimed' | 'history'>('claimed');
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Delivery status update dialog state
  const [selectedDonationForStatus, setSelectedDonationForStatus] = useState<Donation | null>(null);
  const [newStatus, setNewStatus] = useState('on_the_way');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Volunteer assignment dialog state
  const [selectedDonationForVolunteer, setSelectedDonationForVolunteer] = useState<Donation | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | ''>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [donationsRes, volRes] = await Promise.all([
        api.getDonations(),
        api.getVolunteers(),
      ]);
      setAllDonations(donationsRes.donations);
      setVolunteers(volRes.volunteers);
    } catch (err: any) {
      console.error(err);
      error('Failed to load', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Filter datasets
  // 1. Available to claim in city
  const availableFood = allDonations.filter((d) => d.status === 'available');

  // 2. Claimed or in-progress by this NGO
  const myClaimedPickups = allDonations.filter(
    (d) => d.claimed_by_ngo_id === user?.id && (d.status === 'claimed' || d.status === 'on_the_way' || d.status === 'picked_up')
  );

  // 3. Completed historical rescues by this NGO
  const myCompletedHistory = allDonations.filter(
    (d) => d.claimed_by_ngo_id === user?.id && d.status === 'delivered'
  );

  const totalMealsFed = myCompletedHistory.reduce((acc, curr) => acc + curr.estimated_servings, 0);

  const handleClaim = async (donation: Donation) => {
    try {
      await api.claimDonation(donation.id);
      success('Donation Claimed!', `Reserved "${donation.title}". Please assign a volunteer or pickup van.`);
      loadData();
      setActiveTab('claimed');
    } catch (err: any) {
      error('Claim Failed', err.message);
    }
  };

  const handleAssignVolunteer = async () => {
    if (!selectedDonationForVolunteer || !selectedVolunteerId) return;
    try {
      await api.assignVolunteer(selectedDonationForVolunteer.id, Number(selectedVolunteerId));
      success('Volunteer Assigned', 'Field volunteer has been assigned and dispatched.');
      setSelectedDonationForVolunteer(null);
      setSelectedVolunteerId('');
      loadData();
    } catch (err: any) {
      error('Assignment Error', err.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedDonationForStatus) return;
    setIsUpdatingStatus(true);
    try {
      await api.updateDonationStatus(selectedDonationForStatus.id, newStatus, deliveryNotes);
      success('Status Updated', `Donation marked as ${newStatus.replace(/_/g, ' ')}.`);
      setSelectedDonationForStatus(null);
      setDeliveryNotes('');
      loadData();
    } catch (err: any) {
      error('Update Error', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#064E3B] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
              NGO Partner Dashboard
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-200 font-semibold">
              <VerifiedBadge text="Verified Relief Charity" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.organization_name || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80">
            Rapid food claim, volunteer route assignment, and community shelter delivery tracker
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('available')}
            className="px-5 py-3 bg-[#B9E769] hover:bg-[#a5d852] text-[#064E3B] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
          >
            <Utensils className="w-4 h-4 text-[#064E3B]" />
            <span>Browse Available Surplus ({availableFood.length})</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Active Pickups</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">{myClaimedPickups.length}</p>
          <span className="text-[11px] text-blue-700 font-medium">Currently en route</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Meals Distributed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{totalMealsFed.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Served to beneficiaries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Completed Rescues</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{myCompletedHistory.length}</p>
          <span className="text-[11px] text-gray-500">Successful drops</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500">Available Nearby</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{availableFood.length}</p>
          <span className="text-[11px] text-gray-500">Unclaimed food batches</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('claimed')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'claimed' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Active Claimed Pickups</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
            {myClaimedPickups.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'available' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Claim Available Food</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-[#066B4B]">
            {availableFood.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'history' ? 'border-[#066B4B] text-[#066B4B]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Distribution History ({myCompletedHistory.length})
        </button>
      </div>

      {/* Tab 1: Active Claimed Pickups (Manage, assign volunteer, update status) */}
      {activeTab === 'claimed' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border">Loading pickups...</div>
          ) : myClaimedPickups.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">No Pickups In Progress</h3>
              <p className="text-xs text-gray-500">
                You have not claimed any active food batches. Check the available food tab to claim surplus meals for your shelter.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-4 py-2 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Browse Available Surplus
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myClaimedPickups.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={item.status} size="sm" />
                          <DietaryBadge dietary={item.dietary} />
                          <UrgencyBadge hoursRemaining={item.hours_remaining ?? 4} />
                        </div>
                        <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500">
                          {item.estimated_servings} Servings ({item.quantity}) • Storage: {item.storage_condition}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDonationForVolunteer(item);
                          setSelectedVolunteerId(item.assigned_volunteer_id || '');
                        }}
                        className="px-3 py-2 rounded-xl border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Bike className="w-4 h-4 text-blue-700" />
                        <span>{item.volunteer_name ? `Assigned: ${item.volunteer_name}` : 'Assign Volunteer'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDonationForStatus(item);
                          setNewStatus(item.status === 'claimed' ? 'on_the_way' : 'delivered');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#066B4B] hover:bg-[#064E3B] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#B9E769]" />
                        <span>Update Delivery Status</span>
                      </button>
                    </div>
                  </div>

                  {/* Donor Contact & Pickup Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px]">Donor Kitchen</span>
                      <strong className="text-gray-900 text-sm">{item.donor_org || item.donor_name}</strong>
                      <p className="text-gray-600 mt-0.5">{item.pickup_address}, {item.city}</p>
                    </div>

                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px]">Direct Kitchen Contact</span>
                      <strong className="text-gray-900">{item.contact_name}</strong>
                      <p className="text-[#066B4B] font-bold mt-0.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {item.contact_phone}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px]">Allergens &amp; Seal</span>
                      <p className="text-gray-700">{item.allergens || 'None declared'}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Packaging: {item.packaging_type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Available Food Listings (Nearby available to claim) */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">
              Surplus Meals Ready for Rescue in Your Region
            </h3>
            <span className="text-xs text-gray-500">{availableFood.length} batches available</span>
          </div>

          {availableFood.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3">
              <Utensils className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500">No surplus batches currently available in this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableFood.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-xl overflow-hidden bg-gray-100">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <DietaryBadge dietary={item.dietary} />
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <UrgencyBadge hoursRemaining={item.hours_remaining ?? 6} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.donor_org || item.donor_name}</p>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl space-y-1 text-xs text-gray-600">
                      <p>👥 <strong>{item.estimated_servings} Servings</strong> ({item.quantity})</p>
                      <p>📍 {item.pickup_address}, {item.city}</p>
                      <p>⏱️ Window: {item.pickup_window_start} - {item.pickup_window_end}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(item)}
                    className="w-full py-2.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4 text-[#B9E769]" />
                    <span>Claim for Our Shelter</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Distribution History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Completed Food Rescues &amp; Beneficiary Record</h3>
            <span className="text-xs text-gray-500">{myCompletedHistory.length} Total Deliveries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Donor Kitchen</th>
                  <th className="py-3 px-4">Servings Delivered</th>
                  <th className="py-3 px-4">Volunteer</th>
                  <th className="py-3 px-4">Delivered At</th>
                  <th className="py-3 px-4">Destination Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {myCompletedHistory.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-bold text-gray-900">#{d.id}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{d.title}</td>
                    <td className="py-3 px-4">{d.donor_org || d.donor_name}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{d.estimated_servings} Meals</td>
                    <td className="py-3 px-4">{d.volunteer_name || 'NGO Fleet'}</td>
                    <td className="py-3 px-4 text-gray-500">{d.delivered_at ? new Date(d.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed'}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{d.delivery_notes || 'Distributed to shelter residents with dignity'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Volunteer Assignment Modal */}
      {selectedDonationForVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border space-y-4 animate-scale-in">
            <h3 className="font-bold text-gray-900 text-base">Assign Volunteer to Pickup</h3>
            <p className="text-xs text-gray-500">
              Select an active volunteer from the FoodMitra fleet to collect #{selectedDonationForVolunteer.id} ({selectedDonationForVolunteer.title}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Choose Volunteer</label>
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
              >
                <option value="">Select an active volunteer...</option>
                {volunteers.map((vol) => (
                  <option key={vol.id} value={vol.id}>
                    {vol.name} ({vol.city}) — Phone: {vol.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedDonationForVolunteer(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignVolunteer}
                disabled={!selectedVolunteerId}
                className="px-5 py-2.5 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedDonationForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border space-y-4 animate-scale-in">
            <h3 className="font-bold text-gray-900 text-base">Update Delivery Milestones</h3>
            <p className="text-xs text-gray-500">
              Set the tracking milestone for donation #{selectedDonationForStatus.id} — {selectedDonationForStatus.title}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">New Milestone Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                >
                  <option value="on_the_way">Volunteer On the Way to Kitchen</option>
                  <option value="picked_up">Picked Up &amp; En Route to Shelter</option>
                  <option value="delivered">Successfully Distributed (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Beneficiary &amp; Distribution Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Received 110 portions in excellent thermal condition. Served to 110 children at Bandra Night Shelter."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedDonationForStatus(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-5 py-2.5 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
