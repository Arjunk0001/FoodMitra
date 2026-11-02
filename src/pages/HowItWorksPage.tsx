import React from 'react';
import {
  Utensils,
  ShieldCheck,
  Building2,
  Bike,
  Award,
  Thermometer,
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  FileText
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: 1,
      title: 'Donor Submits Surplus Food Details',
      subtitle: 'Fast 2-minute digital handover',
      description:
        'When banquets, weddings, corporate events, or restaurants finish a service with excess fresh food, the kitchen staff logs the dish name, exact quantity, number of servings, preparation time, safe use-by deadline, and storage conditions.',
      icon: Utensils,
      color: 'bg-emerald-50 text-[#066B4B]',
      tags: ['Prep Timestamp', 'Servings Count', 'Allergen Profile', 'Storage Temperature']
    },
    {
      step: 2,
      title: 'FoodMitra Safety Verification Engine',
      subtitle: 'Automated compliance & verification',
      description:
        'Our algorithm verifies that the consumption deadline is within safe bounds (minimum 1–2 hours window remaining) and ensures the donor has certified hygiene standards. Suspicious or expired listings are automatically rejected.',
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-700',
      tags: ['Expiry Window Check', 'Hygiene Declaration', 'FSSAI Alignment', 'Donor Authentication']
    },
    {
      step: 3,
      title: 'Verified NGO Accepts the Request',
      subtitle: 'Instant push alerts to local shelters',
      description:
        'Registered charities, night shelters, and community kitchens within proximity receive live alerts. An authorized NGO coordinator reviews the menu and claims the batch with a single click.',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700',
      tags: ['Geographic Proximity', 'Beneficiary Capacity Match', '1-Click Reservation']
    },
    {
      step: 4,
      title: 'Pickup Scheduled & Assigned to Volunteer',
      subtitle: 'Rapid logistics coordination',
      description:
        'The claiming NGO assigns a trained field volunteer or dispatches their food rescue van. The volunteer receives precise pickup address, gate instructions, and the donor kitchen dispatcher phone number.',
      icon: Bike,
      color: 'bg-amber-50 text-amber-800',
      tags: ['Route Navigation', 'Direct Dispatcher Contact', 'Insulated Thermal Gear']
    },
    {
      step: 5,
      title: 'Food Collected & Sensory Handover Check',
      subtitle: 'Safe cold/hot chain preservation',
      description:
        'The volunteer arrives during the agreed window. Both parties verify container seal and physical temperature before loading into thermal bags. Status is marked "Picked Up" in real-time.',
      icon: Thermometer,
      color: 'bg-purple-50 text-purple-700',
      tags: ['Physical Seal Check', 'Temperature Verification', 'Live Handover Timestamp']
    },
    {
      step: 6,
      title: 'Dignified Distribution & Permanent Audit Log',
      subtitle: 'Warm nourishing meals served with care',
      description:
        'Food arrives at the shelter home and is served warm to residents with dignity. The NGO confirms delivery, and FoodMitra updates public impact metrics, CO₂e diversion, and donor ESG statements.',
      icon: Award,
      color: 'bg-emerald-100 text-[#064E3B]',
      tags: ['Immediate Serving', 'Delivery Receipt', 'CSR Impact Certificate', 'Zero Landfill Methane']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#066B4B] text-xs font-bold border border-emerald-200">
          End-to-End Operational Transparency
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#064E3B] tracking-tight">
          How FoodMitra Rescues Food
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Surplus food rescue is a race against time and temperature. Here is how our technology, verified partners, and field volunteers work seamlessly to redirect commercial meals to people in need.
        </p>
      </div>

      {/* Step by step timeline */}
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-emerald-200 hidden lg:block">
        {steps.map((st, idx) => {
          const isEven = idx % 2 === 0;
          const Icon = st.icon;
          return (
            <div key={st.step} className="relative flex items-center justify-between group">
              {/* Timeline Center Dot */}
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#066B4B] text-[#B9E769] font-black text-sm flex items-center justify-center border-4 border-white shadow-md z-10">
                {st.step}
              </div>

              {/* Left or Right Content */}
              <div className={`w-[45%] ${isEven ? 'text-right pr-12' : 'ml-auto text-left pl-12'}`}>
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-md transition">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold mb-3 ${st.color}`}>
                    <Icon className="w-4 h-4" />
                    <span>Step {st.step}: {st.subtitle}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{st.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">{st.description}</p>
                  <div className={`flex flex-wrap gap-1.5 ${isEven ? 'justify-end' : 'justify-start'}`}>
                    {st.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet Card Stack View */}
      <div className="space-y-6 lg:hidden">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.step} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${st.color}`}>
                  <Icon className="w-4 h-4" />
                  <span>Step {st.step}</span>
                </div>
                <span className="text-xs font-bold text-gray-400">{st.subtitle}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{st.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{st.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {st.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-[#066B4B] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold max-w-xl mx-auto">
          Ready to prevent food waste in your city?
        </h2>
        <p className="text-emerald-100/90 text-sm max-w-lg mx-auto">
          Join hundreds of conscious culinary leaders and community relief partners across India.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('donate-food')}
            className="px-6 py-3 bg-[#B9E769] hover:bg-[#a6d853] text-[#064E3B] font-bold text-sm rounded-xl shadow-xs transition"
          >
            Donate Surplus Food
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition"
          >
            Register as NGO Partner
          </button>
        </div>
      </div>
    </div>
  );
};
