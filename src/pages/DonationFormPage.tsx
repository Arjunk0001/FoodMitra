import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Utensils,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';

interface DonationFormPageProps {
  onNavigate: (page: string) => void;
}

export const DonationFormPage: React.FC<DonationFormPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default times: prepared 1 hour ago, safe for next 6 hours
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatForInput = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultPrep = new Date(now.getTime() - 60 * 60 * 1000);
  const defaultUseBy = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cooked Meals',
    dietary: 'Vegetarian' as 'Vegetarian' | 'Non-Vegetarian' | 'Vegan',
    quantity: '',
    estimated_servings: 50,
    prep_time: formatForInput(defaultPrep),
    use_by_time: formatForInput(defaultUseBy),
    storage_condition: 'Hot Holding (>63°C)',
    packaging_type: 'Food-grade sealed containers',
    allergens: '',
    pickup_address: user?.address || 'Grand Hotel Ballroom Service Bay 3, S.V. Road',
    city: user?.city || 'Mumbai',
    pickup_window_start: '14:30',
    pickup_window_end: '18:00',
    contact_name: user?.name || 'Chef Executive',
    contact_phone: user?.phone || '+91 98334 45566',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    safety_checklist_agreed: false,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Food image presets for fast selection
  const imagePresets = [
    { label: 'Hot Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Catering Buffet Feast', url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Bakery & Buns', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { label: 'Produce / Veg Crates', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Meal Packs / Boxes', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80' },
    { label: 'Dairy & Milk Items', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' }
  ];

  const calculateHoursLeft = () => {
    const useBy = new Date(formData.use_by_time).getTime();
    const curr = Date.now();
    const diff = useBy - curr;
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
  };

  const hoursLeft = calculateHoursLeft();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Food Safety Enforcement
    const prepDate = new Date(formData.prep_time).getTime();
    const useByDate = new Date(formData.use_by_time).getTime();
    const curr = Date.now();

    if (isNaN(useByDate)) {
      setValidationError('Please specify a valid safe consumption deadline date & time.');
      return;
    }

    if (useByDate <= curr) {
      setValidationError('STRICT SAFETY RULE: Use-by deadline cannot be in the past. FoodMitra never allows expired or unsafe food.');
      return;
    }

    if (useByDate - curr < 60 * 60 * 1000) {
      setValidationError('Food must have at least 1 hour of safe consumption life remaining to allow pickup logistics.');
      return;
    }

    if (prepDate > curr + 15 * 60 * 1000) {
      setValidationError('Preparation date cannot be in the future.');
      return;
    }

    if (!formData.safety_checklist_agreed) {
      setValidationError('You must acknowledge and certify the food safety compliance declaration before listing.');
      return;
    }

    if (!user) {
      warning('Sign In Required', 'Please log in as a Donor or Super Admin to submit food donations.');
      onNavigate('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createDonation(formData);
      success('Donation Listed Successfully!', 'Your surplus food has been verified and published to nearby shelter NGOs.');
      setTimeout(() => {
        onNavigate('available-food');
      }, 800);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to list donation.');
      error('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#066B4B] text-xs font-bold border border-emerald-200">
          <Utensils className="w-3.5 h-3.5" />
          Commercial Donor Rescue Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
          List Surplus Commercial Food
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Provide accurate nutritional, storage, and handling parameters. Our verified NGO network and volunteer fleet will be alerted instantly to claim and transport your food safely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          {validationError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Safety Compliance Alert:</p>
                <p>{validationError}</p>
              </div>
            </div>
          )}

          {/* Section 1: Food Description & Category */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
              1. Food Particulars
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Food Title / Dish Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vegetable Biryani, Paneer Butter Masala & Naan"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Food Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                >
                  <option value="Cooked Meals">Cooked Meals (Buffet / Banquet)</option>
                  <option value="Bakery & Breads">Bakery &amp; Breads</option>
                  <option value="Groceries & Produce">Fresh Produce / Vegetables / Fruits</option>
                  <option value="Dairy Products">Dairy Products &amp; Milk</option>
                  <option value="Packaged Foods">Packaged / Dry Goods</option>
                  <option value="Beverages">Packaged Beverages / Juice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dietary Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Vegetarian', 'Non-Vegetarian', 'Vegan'] as const).map((diet) => (
                    <button
                      type="button"
                      key={diet}
                      onClick={() => setFormData({ ...formData, dietary: diet })}
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition ${
                        formData.dietary === diet
                          ? 'border-[#066B4B] bg-emerald-50 text-[#066B4B] ring-1 ring-[#066B4B]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Large Trays (~25 kg)"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estimated Servings (Number of People) *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={5000}
                  value={formData.estimated_servings}
                  onChange={(e) => setFormData({ ...formData, estimated_servings: Number(e.target.value) })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preparation &amp; Handling Notes
              </label>
              <textarea
                rows={2}
                placeholder="Mention cooking method, ingredients, whether fresh buffer stock from event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
              />
            </div>
          </div>

          {/* Section 2: Critical Food Safety & Temperature Timestamps */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                2. Food Safety &amp; Expiry Windows
              </h3>
              <span className="text-xs font-bold text-gray-500">
                {hoursLeft > 0 ? (
                  <span className={hoursLeft <= 3 ? 'text-amber-600 font-bold' : 'text-emerald-700'}>
                    ⏱️ Safe Window: {hoursLeft} hours remaining
                  </span>
                ) : (
                  <span className="text-red-600 font-bold">⚠️ EXPIRED</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preparation Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Safe Consumption Deadline (Use-By) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.use_by_time}
                  onChange={(e) => setFormData({ ...formData, use_by_time: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Storage Condition *</label>
                <select
                  value={formData.storage_condition}
                  onChange={(e) => setFormData({ ...formData, storage_condition: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                >
                  <option value="Hot Holding (>63°C)">Hot Holding (&gt;63°C) — Bain-marie / Insulated</option>
                  <option value="Refrigerated (0-4°C)">Refrigerated (0-4°C) — Cold chain</option>
                  <option value="Room Temp (20-25°C)">Room Temp (20-25°C) — Bakery / dry produce</option>
                  <option value="Frozen (<-18°C)">Frozen (&lt;-18°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Packaging Type *</label>
                <select
                  value={formData.packaging_type}
                  onChange={(e) => setFormData({ ...formData, packaging_type: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                >
                  <option value="Food-grade sealed containers">Food-grade sealed containers</option>
                  <option value="Foil covered catering trays">Foil covered catering trays</option>
                  <option value="Individual meal boxes">Individual meal boxes (packed)</option>
                  <option value="Sanitized crates & bags">Sanitized crates &amp; boxes</option>
                  <option value="Sealed dairy pouches">Sealed dairy / milk packaging</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Allergens &amp; Intolerance Information *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Contains Dairy (Ghee, Paneer), Cashew nuts. No peanuts. Gluten-free."
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
              />
            </div>
          </div>

          {/* Section 3: Pickup Location & Contact */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
              3. Pickup Location &amp; Windows
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Pickup Address &amp; Bay / Gate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banquet Loading Dock 3, The Grand Royal Hotel, S.V. Road"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Window Start *</label>
                <input
                  type="time"
                  required
                  value={formData.pickup_window_start}
                  onChange={(e) => setFormData({ ...formData, pickup_window_start: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Window End *</label>
                <input
                  type="time"
                  required
                  value={formData.pickup_window_end}
                  onChange={(e) => setFormData({ ...formData, pickup_window_end: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Photo Selection */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
              4. Food Photography
            </h3>
            <p className="text-xs text-gray-500">Pick a preset dish image or specify an image URL:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {imagePresets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setFormData({ ...formData, image_url: preset.url })}
                  className={`p-1.5 rounded-xl border cursor-pointer transition ${
                    formData.image_url === preset.url
                      ? 'border-[#066B4B] ring-2 ring-[#066B4B] bg-emerald-50/50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover rounded-lg" />
                  <p className="text-[11px] font-semibold text-gray-800 text-center mt-1 truncate">
                    {preset.label}
                  </p>
                </div>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
            />
          </div>

          {/* Section 5: Mandatory Food Safety Checklist Declaration */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="safety_cert"
                checked={formData.safety_checklist_agreed}
                onChange={(e) => setFormData({ ...formData, safety_checklist_agreed: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded text-[#066B4B] focus:ring-[#066B4B] cursor-pointer"
              />
              <label htmlFor="safety_cert" className="text-xs text-emerald-950 font-medium cursor-pointer leading-relaxed">
                <strong>Food Safety Certification &amp; Legal Compliance:</strong> I certify that this surplus food was prepared in a hygienic kitchen adhering to applicable food safety standards, has remained uncontaminated, is within its safe consumption window, and is stored at the declared safe temperature.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-base disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Verifying &amp; Publishing...</span>
            ) : (
              <>
                <Utensils className="w-5 h-5 text-[#B9E769]" />
                <span>Publish Food Rescue Listing</span>
              </>
            )}
          </button>
        </form>

        {/* Live Preview Card Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Live Listing Preview
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-100 relative">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                {formData.category}
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-gray-900 text-base leading-snug">
                {formData.title || 'Your Food Title Here'}
              </h4>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {formData.pickup_address || 'Pickup address'}, {formData.city}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Dietary:</span>
                <span className="font-semibold text-gray-900">{formData.dietary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Servings:</span>
                <span className="font-bold text-emerald-800">{formData.estimated_servings} Meals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storage:</span>
                <span className="font-semibold text-gray-900">{formData.storage_condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup Window:</span>
                <span className="font-semibold text-gray-900">{formData.pickup_window_start} - {formData.pickup_window_end}</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 italic border-t pt-2">
              Note: This listing will immediately broadcast to verified shelter NGOs in {formData.city}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
