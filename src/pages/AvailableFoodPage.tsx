import React, { useState, useEffect } from 'react';
import { Donation } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, DietaryBadge, VerifiedBadge, UrgencyBadge } from '../components/common/Badge';
import { FoodMap } from '../components/common/FoodMap';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Utensils,
  Map as MapIcon,
  LayoutGrid,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Truck,
  Compass
} from 'lucide-react';

interface AvailableFoodPageProps {
  onNavigate: (page: string) => void;
  onOpenReportModal?: (donationId?: number, title?: string) => void;
}

export const AvailableFoodPage: React.FC<AvailableFoodPageProps> = ({ onNavigate, onOpenReportModal }) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Modal detail
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // User location for distance calculation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Geolocation declined or unavailable, default gracefully
        }
      );
    }
  }, []);

  const loadDonations = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getDonations({
        category: selectedCategory,
        city: selectedCity,
        dietary: selectedDietary,
        search,
        urgentOnly,
        status: 'available',
      });
      setDonations(res.donations);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [selectedCategory, selectedCity, selectedDietary, urgentOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDonations();
  };

  const handleClaim = async (donation: Donation) => {
    if (!user) {
      warning('Sign In Required', 'Please sign in with a verified NGO account to claim food donations.');
      onNavigate('login');
      return;
    }

    if (user.role !== 'ngo' && user.role !== 'super_admin') {
      warning('NGO Authorization Needed', 'Only registered NGO and shelter accounts can claim food batches.');
      return;
    }

    setClaimingId(donation.id);
    try {
      await api.claimDonation(donation.id);
      success('Donation Claimed!', `You have reserved "${donation.title}". Please assign a volunteer for pickup.`);
      setSelectedDonation(null);
      loadDonations();
    } catch (err: any) {
      error('Claim Failed', err.message);
    } finally {
      setClaimingId(null);
    }
  };

  // Distance helper (Haversine formula in km)
  const calculateDistance = (lat?: number, lng?: number) => {
    if (!userCoords || !lat || !lng) return null;
    const R = 6371; // km
    const dLat = ((lat - userCoords.lat) * Math.PI) / 180;
    const dLng = ((lng - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  };

  const categories = ['All', 'Cooked Meals', 'Bakery & Breads', 'Groceries & Produce', 'Dairy Products', 'Packaged Foods'];
  const cities = ['All', 'Mumbai', 'Bengaluru', 'New Delhi', 'Pune', 'Hyderabad', 'Kolkata'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & View Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#066B4B] text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            Real-Time Available Surplus Feed
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight mt-1">
            Safe Surplus Food Ready for Rescue
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Browse verified commercial listings. Claimed items are dispatched immediately to local shelters.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'grid'
                ? 'bg-[#066B4B] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Card View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'map'
                ? 'bg-[#066B4B] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by food dish, banquet hall, street, or landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#066B4B] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-2xs transition"
          >
            Filter Listings
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1 text-gray-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </div>

          {/* City select */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="rounded-lg border border-gray-300 py-1 px-2.5 text-xs text-gray-700 bg-white"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                City: {c}
              </option>
            ))}
          </select>

          {/* Category select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 py-1 px-2.5 text-xs text-gray-700 bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Dietary toggle */}
          <select
            value={selectedDietary}
            onChange={(e) => setSelectedDietary(e.target.value)}
            className="rounded-lg border border-gray-300 py-1 px-2.5 text-xs text-gray-700 bg-white"
          >
            <option value="All">Dietary: All</option>
            <option value="Vegetarian">Vegetarian Only</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="Vegan">Vegan</option>
          </select>

          {/* Urgency button */}
          <button
            type="button"
            onClick={() => setUrgentOnly(!urgentOnly)}
            className={`py-1 px-3 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
              urgentOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900 ring-1 ring-amber-300'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Urgent (&lt;4h Left)</span>
          </button>
        </div>
      </div>

      {/* Map View Display */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <FoodMap
            donations={donations}
            selectedDonation={selectedDonation}
            onSelectDonation={(d) => setSelectedDonation(d)}
            height="460px"
          />
          <p className="text-xs text-gray-500 text-center">
            Click on any pin on the map to inspect pickup details, food safety metrics, and claim the donation.
          </p>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-gray-100 animate-pulse space-y-4">
              <div className="w-full h-44 bg-gray-200 rounded-2xl" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-gray-900">Failed to Load Food Listings</h3>
          <p className="text-xs text-red-700">{errorMessage}</p>
          <button
            onClick={loadDonations}
            className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-lg mt-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !errorMessage && donations.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#066B4B] flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Food Listings Found</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            There are currently no surplus food donations matching your active filters. Try clearing filters or check back shortly as banquets finish evening services.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedCity('All');
              setSelectedDietary('All');
              setUrgentOnly(false);
              setSearch('');
            }}
            className="px-4 py-2 bg-emerald-100 text-[#066B4B] font-bold text-xs rounded-xl hover:bg-emerald-200 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !errorMessage && donations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((item) => {
            const distance = calculateDistance(item.latitude, item.longitude);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xs hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col group"
              >
                {/* Photo & Category Overlays */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <DietaryBadge dietary={item.dietary} />
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <UrgencyBadge hoursRemaining={item.hours_remaining ?? 6} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {item.donor_org || item.donor_name}
                      </span>
                      {item.donor_verified && <VerifiedBadge text="Verified Donor" />}
                    </div>

                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#066B4B] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Surplus catering buffer prepared under hygienic conditions.'}
                    </p>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="p-3 bg-gray-50/80 rounded-xl space-y-2 text-xs border border-gray-100">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-[#066B4B]" /> Servings:
                      </span>
                      <span className="text-gray-900 font-bold">{item.estimated_servings} Meals ({item.quantity})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location:
                      </span>
                      <span className="text-gray-700 truncate max-w-[170px]" title={item.pickup_address}>
                        {item.pickup_address}, {item.city}
                      </span>
                    </div>

                    {distance !== null && (
                      <div className="flex items-center justify-between text-[11px] text-blue-700 font-medium">
                        <span className="flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" /> Distance:
                        </span>
                        <span>~{distance} km away</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> Pickup Window:
                      </span>
                      <span className="font-medium text-gray-900">{item.pickup_window_start} - {item.pickup_window_end}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedDonation(item)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs transition"
                    >
                      View Details &amp; Safety
                    </button>

                    <button
                      onClick={() => handleClaim(item)}
                      disabled={claimingId === item.id}
                      className="py-2.5 px-4 rounded-xl bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs transition shadow-2xs flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <Building2 className="w-4 h-4 text-[#B9E769]" />
                      <span>{claimingId === item.id ? 'Reserving...' : 'Claim Food'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">
            {/* Header image banner */}
            <div className="relative h-48 sm:h-56 shrink-0 bg-gray-900">
              <img
                src={selectedDonation.image_url}
                alt={selectedDonation.title}
                className="w-full h-full object-cover opacity-90"
              />
              <button
                onClick={() => setSelectedDonation(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedDonation.category}
                </span>
                <UrgencyBadge hoursRemaining={selectedDonation.hours_remaining ?? 6} />
              </div>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DietaryBadge dietary={selectedDonation.dietary} />
                  {selectedDonation.donor_verified && <VerifiedBadge text="FSSAI & Hygiene Verified" />}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#064E3B]">
                  {selectedDonation.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Donated by: <strong>{selectedDonation.donor_org || selectedDonation.donor_name}</strong>
                </p>
              </div>

              {selectedDonation.description && (
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {selectedDonation.description}
                </p>
              )}

              {/* Strict Food Safety & Storage Parameters */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Food Safety &amp; Preservation Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-gray-500 block text-[11px]">Storage Condition</span>
                    <strong className="text-emerald-900">{selectedDonation.storage_condition}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-gray-500 block text-[11px]">Packaging Type</span>
                    <strong className="text-emerald-900">{selectedDonation.packaging_type}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-gray-500 block text-[11px]">Estimated Servings</span>
                    <strong className="text-emerald-900">{selectedDonation.estimated_servings} Persons ({selectedDonation.quantity})</strong>
                  </div>
                </div>
              </div>

              {/* Allergens warning */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Allergen Notice:</strong> {selectedDonation.allergens || 'No allergens declared.'}
                </div>
              </div>

              {/* Pickup details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Pickup Coordination
                </h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#066B4B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900">Pickup Address:</strong>
                      <span className="text-gray-700">{selectedDonation.pickup_address}, {selectedDonation.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#066B4B] shrink-0" />
                    <div>
                      <strong className="text-gray-900">Pickup Window: </strong>
                      <span className="text-gray-700">{selectedDonation.pickup_window_start} to {selectedDonation.pickup_window_end}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#066B4B] shrink-0" />
                    <div>
                      <strong className="text-gray-900">On-Site Dispatcher: </strong>
                      <span className="text-gray-700">{selectedDonation.contact_name} ({selectedDonation.contact_phone})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenReportModal) onOpenReportModal(selectedDonation.id, selectedDonation.title);
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
              >
                Report Quality Concern
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
                <button
                  onClick={() => handleClaim(selectedDonation)}
                  disabled={claimingId === selectedDonation.id}
                  className="px-5 py-2.5 rounded-xl bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs transition shadow-xs flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#B9E769]" />
                  <span>{claimingId === selectedDonation.id ? 'Claiming...' : 'Claim for My NGO Shelter'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
