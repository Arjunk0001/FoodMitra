import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Donation } from '../../types';
import { StatusBadge, DietaryBadge, VerifiedBadge, UrgencyBadge } from '../../components/common/Badge';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  Award,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

interface VolunteerDashboardProps {
  onNavigate: (page: string) => void;
  onOpenReportModal?: (donationId?: number, title?: string) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ onNavigate, onOpenReportModal }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Delivery confirmation modal
  const [activeTaskForDelivery, setActiveTaskForDelivery] = useState<Donation | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getDonations();
      // Filter tasks assigned to this volunteer or claimable active runs
      const assigned = res.donations.filter(
        (d) => d.assigned_volunteer_id === user?.id || (user?.role === 'volunteer' && (d.status === 'claimed' || d.status === 'on_the_way' || d.status === 'picked_up'))
      );
      setDonations(assigned);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleUpdateStatus = async (donationId: number, status: string, notes?: string) => {
    setUpdatingId(donationId);
    try {
      await api.updateDonationStatus(donationId, status, notes);
      success('Status Updated', `Task is now: ${status.replace(/_/g, ' ').toUpperCase()}`);
      setActiveTaskForDelivery(null);
      setDeliveryNotes('');
      loadTasks();
    } catch (err: any) {
      error('Failed to update', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeTasks = donations.filter((d) => d.status === 'claimed' || d.status === 'on_the_way' || d.status === 'picked_up');
  const completedTasks = donations.filter((d) => d.status === 'delivered');
  const totalMealsHandled = completedTasks.reduce((acc, c) => acc + c.estimated_servings, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-[#064E3B] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-950">
              Field Volunteer Hub
            </span>
            <span className="flex items-center gap-1 text-xs text-[#B9E769] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified Food Rescue Agent
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/80">
            Assigned pickups, live route coordination, temperature checklists, and delivery confirmations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Deliveries Completed</span>
            <span className="text-2xl font-black text-white">{completedTasks.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Meals Transported</span>
            <span className="text-2xl font-black text-[#B9E769]">{totalMealsHandled.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Active Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#064E3B]">Active Rescue Assignments</h2>
            <p className="text-xs text-gray-500">Pick up from the donor kitchen and transport safely to the destination shelter</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            {activeTasks.length} Active
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border">Loading tasks...</div>
        ) : activeTasks.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#066B4B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">All Caught Up!</h3>
            <p className="text-xs text-gray-500">
              No pending pickup tasks right now. When an NGO schedules you for a meal run, it will appear here with live instructions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTasks.map((task) => {
              const currentStepIndex =
                task.status === 'claimed'
                  ? 0
                  : task.status === 'on_the_way'
                  ? 1
                  : task.status === 'picked_up'
                  ? 2
                  : 3;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={task.image_url}
                        alt={task.title}
                        className="w-20 h-20 rounded-2xl object-cover border shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={task.status} />
                          <DietaryBadge dietary={task.dietary} />
                          <UrgencyBadge hoursRemaining={task.hours_remaining ?? 4} />
                        </div>
                        <h3 className="font-extrabold text-lg text-gray-900">{task.title}</h3>
                        <p className="text-xs text-gray-500">
                          {task.estimated_servings} Servings ({task.quantity}) • Storage: {task.storage_condition}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block">Pickup Window</span>
                      <strong className="text-sm text-gray-900">{task.pickup_window_start} - {task.pickup_window_end}</strong>
                    </div>
                  </div>

                  {/* 4-Step Interactive Status Stepper */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Live Delivery Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {[
                        { key: 'claimed', label: '1. Assigned' },
                        { key: 'on_the_way', label: '2. On The Way' },
                        { key: 'picked_up', label: '3. Picked Up' },
                        { key: 'delivered', label: '4. Delivered' },
                      ].map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div
                            key={step.key}
                            className={`p-2.5 rounded-xl border transition ${
                              isCurrent
                                ? 'bg-[#066B4B] text-white font-bold shadow-xs border-[#066B4B]'
                                : isDone
                                ? 'bg-emerald-50 text-[#066B4B] font-semibold border-emerald-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200'
                            }`}
                          >
                            {step.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Directions & Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-500 uppercase text-[10px]">Pickup Location &amp; Dispatcher</span>
                      <p className="font-bold text-gray-900 text-sm">{task.donor_org || task.donor_name}</p>
                      <p className="text-gray-600 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#066B4B] shrink-0 mt-0.5" />
                        {task.pickup_address}, {task.city}
                      </p>
                      <p className="text-[#066B4B] font-bold pt-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {task.contact_name}: {task.contact_phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-gray-500 uppercase text-[10px]">Destination NGO &amp; Shelter</span>
                      <p className="font-bold text-blue-900 text-sm">{task.claimed_by_ngo_org || task.claimed_by_ngo_name || 'Community Shelter'}</p>
                      <p className="text-gray-600">
                        Please verify container temperature before loading into your thermal insulated backpack.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenReportModal) onOpenReportModal(task.id, task.title);
                        }}
                        className="text-red-600 hover:text-red-700 font-semibold pt-1 block"
                      >
                        Report packaging damage or temperature issue →
                      </button>
                    </div>
                  </div>

                  {/* Status Progression Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {task.status === 'claimed' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'on_the_way')}
                        disabled={updatingId === task.id}
                        className="px-5 py-2.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Bike className="w-4 h-4 text-[#B9E769]" />
                        <span>I am On the Way to Kitchen</span>
                      </button>
                    )}

                    {task.status === 'on_the_way' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'picked_up')}
                        disabled={updatingId === task.id}
                        className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Food Picked Up (In Thermal Bag)</span>
                      </button>
                    )}

                    {task.status === 'picked_up' && (
                      <button
                        onClick={() => setActiveTaskForDelivery(task)}
                        className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4 text-[#B9E769]" />
                        <span>Confirm Delivery to Shelter</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">Your Completed Rescue Missions</h3>
            <p className="text-xs text-gray-500">Every delivered meal saves food waste and nourishes communities.</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {completedTasks.length} Delivered
          </span>
        </div>

        {completedTasks.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No completed runs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Donor Origin</th>
                  <th className="py-3 px-4">Servings</th>
                  <th className="py-3 px-4">Destination Shelter</th>
                  <th className="py-3 px-4">Delivered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {completedTasks.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-bold text-gray-900">{c.title}</td>
                    <td className="py-3 px-4">{c.donor_org || c.donor_name}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{c.estimated_servings} Meals</td>
                    <td className="py-3 px-4 font-medium text-blue-900">{c.claimed_by_ngo_org || 'Local Shelter'}</td>
                    <td className="py-3 px-4 text-gray-500">{c.delivered_at ? new Date(c.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Confirmation Dialog */}
      {activeTaskForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border space-y-4 animate-scale-in">
            <div className="flex items-center gap-2.5 text-teal-800">
              <Award className="w-6 h-6 text-teal-600" />
              <h3 className="font-extrabold text-base text-gray-900">Confirm Shelter Delivery</h3>
            </div>
            <p className="text-xs text-gray-600">
              Confirming handover of {activeTaskForDelivery.estimated_servings} servings ({activeTaskForDelivery.title}) to the shelter coordinator.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Shelter Coordinator / Delivery Proof Notes
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Handed over 180 hot meal boxes to Manager Ritu at Asha Shelter. Temperature verified at 65°C."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setActiveTaskForDelivery(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(activeTaskForDelivery.id, 'delivered', deliveryNotes)}
                disabled={updatingId === activeTaskForDelivery.id}
                className="px-5 py-2.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {updatingId === activeTaskForDelivery.id ? 'Recording Delivery...' : 'Sign Off & Complete Mission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
