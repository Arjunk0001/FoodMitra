import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Building2,
  Bike,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Heart,
  ChevronDown,
  Sparkles,
  Award,
  Users,
  Leaf,
  Thermometer,
  FileCheck,
  Send
} from 'lucide-react';
import { PlatformStats } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenReportModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenReportModal }) => {
  const { success, error } = useToast();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'Food Donation Inquiry', message: '' });
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getStats();
        setStats(res.stats);
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }
    loadStats();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      error('Missing fields', 'Please fill in your name, email, and message.');
      return;
    }
    setSubmittingContact(true);
    try {
      await api.submitContact(contactForm);
      success('Inquiry Sent', 'Thank you! Our rescue team will respond within 24 hours.');
      setContactForm({ name: '', email: '', subject: 'Food Donation Inquiry', message: '' });
    } catch (err: any) {
      error('Submission Error', err.message || 'Failed to send inquiry.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const faqs = [
    {
      q: 'What types of food can be donated on FoodMitra?',
      a: 'We accept freshly prepared surplus cooked food from banquet halls, caterers, hotels and corporate cafeterias, unexpired bakery and dairy items, produce crates, and sealed packaged dry groceries. Food must be kept under safe temperature controls and have at least 2 hours of safe consumption life remaining.'
    },
    {
      q: 'How does FoodMitra guarantee food safety and legal compliance?',
      a: 'Safety is non-negotiable. Donors must certify preparation timestamps, storage temperatures (Hot >63°C, Cold <4°C), and allergen profiles. Expired listings are programmatically blocked. In addition, recipient NGOs and volunteers conduct sensory and thermal checks upon pickup.'
    },
    {
      q: 'How quickly does food pickup happen after listing?',
      a: 'Most surplus listings are claimed by our verified NGO network within 15–30 minutes. Volunteer logistics teams or NGO rescue vans are dispatched immediately to collect the meal containers before the pickup window expires.'
    },
    {
      q: 'Are NGOs and shelter homes verified before receiving food?',
      a: 'Yes. Every receiving NGO undergoes strict verification of their trust registration documents, food distribution facilities, hygiene practices, and beneficiary capacity before they can claim meals.'
    },
    {
      q: 'Can wedding and event organizers schedule pickups in advance?',
      a: 'Yes! Caterers and event planners can schedule advance surplus food alerts so our volunteer fleet is pre-notified for late-night pickups after wedding receptions.'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF5EF] via-[#F5F8F6] to-white pt-12 pb-20 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#066B4B] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-[#066B4B]" />
                Food Rescue &amp; Dignity Redistribution
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#064E3B] tracking-tight leading-[1.12]">
                Good Food Should <br />
                <span className="text-[#066B4B] relative inline-block">
                  Never Go to Waste.
                  <span className="absolute left-0 bottom-1 w-full h-2 bg-[#B9E769]/50 -z-10 rounded"></span>
                </span>
              </h1>

              <p className="text-lg text-gray-700 leading-relaxed max-w-2xl font-normal">
                FoodMitra bridges banquet halls, restaurants, hotels and caterers with verified grassroots NGOs and local volunteers. We turn excess commercial food into hot, nutritious meals for shelter homes, orphanages, and daily-wage families—with speed, dignity, and certified safety.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('donate-food')}
                  className="px-7 py-3.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-base group"
                >
                  <Utensils className="w-5 h-5 text-[#B9E769] group-hover:rotate-12 transition-transform" />
                  <span>Donate Surplus Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('available-food')}
                  className="px-7 py-3.5 bg-white hover:bg-emerald-50 text-[#066B4B] border-2 border-[#066B4B] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-xs"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Find Food / Join as NGO</span>
                </button>
              </div>

              {/* Safety Badges Under Hero */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#066B4B]" />
                  Zero-Tolerance Food Safety
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#066B4B]" />
                  100% Verified Partners
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#066B4B]" />
                  Temperature-Controlled Transport
                </span>
              </div>
            </div>

            {/* Right Hero Image & Live Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 group">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80"
                  alt="Volunteers sharing hot surplus meals with children and families"
                  className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                {/* Overlaid Live Pickup Notification Card */}
                <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#066B4B] flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Live Rescue in Transit
                      </span>
                      <span className="text-[10px] text-gray-400">Just now</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 truncate">
                      140 Hot Meals claimed by Roti Bank Bengaluru
                    </p>
                  </div>
                </div>

                {/* Bottom Quote Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white p-4 rounded-2xl border border-white/20">
                  <p className="text-xs italic leading-relaxed text-gray-200">
                    “FoodMitra turned what used to be painful banquet waste into a lifeline for 120 kids at our shelter every single weekend.”
                  </p>
                  <p className="text-[11px] font-bold text-[#B9E769] mt-2">
                    — Sister Mary, Asha Kiran Shelter Home
                  </p>
                </div>
              </div>

              {/* Decorative Accent Glow */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#B9E769]/30 rounded-full blur-3xl -z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Impact Metrics Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              Verified Real-Time Impact Dashboard
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Every meal recorded, audited, and tracked through our secure database
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Metric 1 */}
            <div className="pt-4 lg:pt-0 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-[#066B4B] mb-1">
                <Utensils className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                {stats ? stats.rescued_servings.toLocaleString() : '580'}+
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Servings Rescued</p>
              <p className="text-[11px] text-emerald-600 font-medium">Safe &amp; warm meals delivered</p>
            </div>

            {/* Metric 2 */}
            <div className="pt-4 lg:pt-0 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-700 mb-1">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                {stats ? stats.active_donors : '3'}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Active Donor Partners</p>
              <p className="text-[11px] text-gray-500 font-medium">Hotels, caterers &amp; bakeries</p>
            </div>

            {/* Metric 3 */}
            <div className="pt-4 lg:pt-0 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 mb-1">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                {stats ? stats.partner_ngos : '2'}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Verified NGO Partners</p>
              <p className="text-[11px] text-gray-500 font-medium">Shelters &amp; relief foundations</p>
            </div>

            {/* Metric 4 */}
            <div className="pt-4 lg:pt-0 text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 text-teal-700 mb-1">
                <Leaf className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                {stats ? stats.co2_saved_kg.toLocaleString() : '1,040'} kg
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-600">CO₂e Emissions Prevented</p>
              <p className="text-[11px] text-teal-700 font-medium">Methane saved from landfills</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#066B4B] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Rapid 6-Step Rescue Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B]">
            How FoodMitra Works
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            From the hotel kitchen banquet table to the community shelter in under 90 minutes. A coordinated technology workflow built for food safety and human dignity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Donor Submits Food Details',
              desc: 'Hotel or caterer enters preparation time, servings, storage temperature, allergen list, and pickup window.',
              icon: Utensils,
              color: 'text-emerald-700 bg-emerald-50',
            },
            {
              step: '02',
              title: 'Safety Check & Verification',
              desc: 'Our platform verifies strict use-by deadlines. Expired or suspicious listings are instantly blocked.',
              icon: FileCheck,
              color: 'text-blue-700 bg-blue-50',
            },
            {
              step: '03',
              title: 'Verified NGO Claims Request',
              desc: 'Nearby shelters receive instant mobile alerts and claim food batches matching their beneficiary headcount.',
              icon: Building2,
              color: 'text-purple-700 bg-purple-50',
            },
            {
              step: '04',
              title: 'Volunteer Pickup Scheduled',
              desc: 'An active volunteer squad member or dedicated NGO van is dispatched with insulated thermal bags.',
              icon: Bike,
              color: 'text-amber-700 bg-amber-50',
            },
            {
              step: '05',
              title: 'Collected in Thermal Containers',
              desc: 'Physical temperature check is logged at handover. Food is transported adhering to strict food safety guidelines.',
              icon: Thermometer,
              color: 'text-teal-700 bg-teal-50',
            },
            {
              step: '06',
              title: 'Dignified Distribution & Audit',
              desc: 'Meals are served warm to beneficiaries. Delivery receipt and impact metrics are permanently logged.',
              icon: Award,
              color: 'text-emerald-800 bg-emerald-100',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-gray-200 group-hover:text-[#B9E769] transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('how-it-works')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#066B4B] hover:text-[#064E3B] underline underline-offset-4"
          >
            Explore the deep technical &amp; safety flow in detail <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. Food Safety & Verification Section (Crucial requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#064E3B] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#B9E769] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#B9E769]" />
                Food Safety Is Non-Negotiable
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Engineered for Safe, Traceable Food Rescue
              </h2>
              <p className="text-emerald-100/90 text-sm leading-relaxed">
                Surplus food redistribution requires uncompromising safety standards. FoodMitra never allows unverified donors, expired preparation timestamps, or unsafe transport containers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                  <h4 className="font-bold text-sm text-[#B9E769] mb-1 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" /> Temperature Protocol
                  </h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Cooked hot food maintained above 63°C; chilled dairy and produce below 4°C with certified thermal packs.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                  <h4 className="font-bold text-sm text-[#B9E769] mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Hard Expiry Gates
                  </h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Database automatically blocks and hides any food listing whose safe consumption limit is under 60 minutes.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                  <h4 className="font-bold text-sm text-[#B9E769] mb-1 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" /> Allergen Disclosure
                  </h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Mandatory itemization of gluten, nuts, dairy, soy and meat items so shelter homes feed guests safely.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                  <h4 className="font-bold text-sm text-[#B9E769] mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Partner Verification
                  </h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Super Admin audits FSSAI/municipal health registrations, kitchen licenses, and NGO trust certifications.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenReportModal}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Have a Quality Concern? Report Safety Incident
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 rounded-2xl p-6 border border-white/15 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#B9E769]" />
                Food Safety Inspection Checklist
              </h3>
              <p className="text-xs text-emerald-200/80">
                Every FoodMitra volunteer and receiving NGO verifies these 4 points before accepting:
              </p>
              <ul className="space-y-3 text-xs text-emerald-100">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B9E769] text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span><strong>Visual &amp; Olfactory Check:</strong> Fresh aroma, natural color, zero discoloration or gas buildup in containers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B9E769] text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span><strong>Packaging Integrity:</strong> Clean, food-grade airtight containers or sealed catering foil trays.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B9E769] text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span><strong>Handover Timestamp:</strong> Collected strictly within the agreed pickup window.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B9E769] text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span><strong>Immediate Serving:</strong> Distributed to beneficiaries within 2 hours of arrival.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Benefits for Donors & NGOs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Donors */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#066B4B] flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#064E3B]">For Commercial Donors</h3>
                <p className="text-xs text-gray-500">Hotels, Banquet Halls, Caterers &amp; Cafes</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#066B4B] shrink-0 mt-0.5" />
                <span><strong>Zero Food Waste Guilt:</strong> Stop discarding fresh, untouched buffet surplus into garbage bins.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#066B4B] shrink-0 mt-0.5" />
                <span><strong>Automated Pickup Coordination:</strong> No endless phone calls; verified NGOs claim and arrive within the scheduled window.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#066B4B] shrink-0 mt-0.5" />
                <span><strong>CSR &amp; ESG Reports:</strong> Download certified quarterly impact statements showing meals rescued and carbon avoided.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#066B4B] shrink-0 mt-0.5" />
                <span><strong>FSSAI &amp; Good Samaritan Protection:</strong> Full compliance with surplus food donation protocols.</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('donate-food')}
              className="w-full py-3 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold rounded-xl transition text-center shadow-xs"
            >
              List Surplus Food Today
            </button>
          </div>

          {/* For NGOs */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#064E3B]">For Verified NGOs</h3>
                <p className="text-xs text-gray-500">Shelter Homes, Trusts &amp; Food Relief Squads</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Real-time Food Availability:</strong> Get immediate map-based listings of hot meals and fresh produce nearby.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>1-Click Claim System:</strong> Reserve food allocations instantly before other shelters claim them.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Volunteer Logistics Dispatch:</strong> Assign trained pickup volunteers with directions and direct donor contacts.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Zero Cost to Charities:</strong> FoodMitra is 100% free for charitable non-profit rescue organizations.</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('available-food')}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition text-center shadow-xs"
            >
              Browse Available Food
            </button>
          </div>
        </div>
      </section>

      {/* 6. Partner Organizations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Trusted By Leading Hospitality &amp; Social Impact Networks
          </span>
          <h3 className="text-2xl font-extrabold text-[#064E3B] mt-1">Our Rescue Ecosystem</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            'Royal Hospitality Hotels',
            'Spice Symphony Caterers',
            'AnnaSeva Welfare Trust',
            'Roti Bank Karnataka',
            'Green Harvest Organics',
            'Robin Hood Army Volunteers'
          ].map((partner, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-center text-center font-bold text-xs text-gray-700 hover:border-[#066B4B] transition"
            >
              {partner}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Impact Stories & Testimonials */}
      <section className="bg-emerald-50/60 py-16 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#066B4B]">
              Real Community Change
            </span>
            <h2 className="text-3xl font-extrabold text-[#064E3B]">
              Voices from the Frontlines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                “As a wedding caterer, cooking extra buffer food is mandatory. FoodMitra gave us a clean, automated way to ensure that 80 to 150 untouched servings reach night shelter homes every weekend.”
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#066B4B] flex items-center justify-center font-bold text-xs">
                  VD
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Chef Vikram Deshmukh</p>
                  <p className="text-[11px] text-gray-500">Executive Chef, The Grand Royal Banquet</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                “Our shelter cares for 95 elders and destitute women. The transparency of FoodMitra’s allergen labels and temperature requirements gives us complete peace of mind when feeding our residents.”
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  SK
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Dr. Sunita Kulkarni</p>
                  <p className="text-[11px] text-gray-500">Trustee, AnnaSeva Foundation</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {'★★★★★'}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                “I ride an electric scooter and pick up food packets between 9:30 PM and 11:00 PM. Seeing children sleep with full bellies instead of empty stomachs is the best feeling in the world.”
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  RS
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Rahul Sharma</p>
                  <p className="text-[11px] text-gray-500">Active Rescue Volunteer (Mumbai)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#066B4B]">
            Transparency &amp; Trust
          </span>
          <h2 className="text-3xl font-extrabold text-[#064E3B]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500">Got questions about hygiene, logistics, or liability? Here are the facts.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-[#066B4B] transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${
                    openFaq === index ? 'rotate-180 text-[#066B4B]' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Contact / Quick Inquiry Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#066B4B]">
                Get in Touch
              </span>
              <h3 className="text-3xl font-extrabold text-[#064E3B]">
                Have Surplus Food or Want to Partner?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Whether you manage a 5-star hotel buffet, organize corporate catering, run an orphanage, or want to volunteer, we are ready to assist.
              </p>
              <div className="space-y-2 text-xs text-gray-700 pt-2 font-medium">
                <p>📍 <strong>Headquarters:</strong> BKC Social Hub, Mumbai</p>
                <p>📞 <strong>Rescue Hotline:</strong> 1800-FOOD-MITRA</p>
                <p>✉️ <strong>Direct Email:</strong> rescue@foodmitra.org</p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Saxena"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@organization.org"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inquiry Purpose</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                  >
                    <option value="Food Donation Inquiry">Food Donation Inquiry (Donor)</option>
                    <option value="NGO Partner Registration">NGO Partner Registration</option>
                    <option value="Volunteer Squad Enrollment">Volunteer Squad Enrollment</option>
                    <option value="Corporate CSR Sponsorship">Corporate CSR Sponsorship</option>
                    <option value="Media or General Inquiry">Media or General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about your organization, anticipated food volumes, or questions..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full py-2.5 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submittingContact ? 'Sending Inquiry...' : 'Submit Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
