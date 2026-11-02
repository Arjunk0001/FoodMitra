import React from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Target,
  Sparkles,
  Users,
  Award,
  Leaf,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#066B4B] text-xs font-bold border border-emerald-200">
          Our Story &amp; Purpose
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#064E3B] tracking-tight">
          “Rescuing Surplus Food, Restoring Dignity.”
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          FoodMitra was founded on a simple, irrefutable truth: In a nation where millions sleep on empty stomachs, discarding untouched commercial feast food into garbage dumps is not just an environmental tragedy—it is a moral crisis.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#066B4B] flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#064E3B]">Our Mission</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            To build India’s most dependable, temperature-controlled technology network connecting high-volume commercial food producers with verified grassroots charities—ensuring that every edible calorie fulfills human nourishment before it spoils.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#064E3B]">Our Vision</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            A zero-waste, zero-hunger future where wedding venues, caterers, hotels, and grocery distributors treat food rescue as a standard, celebrated operating procedure rather than an afterthought.
          </p>
        </div>
      </div>

      {/* Pillars of FoodMitra */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-[#064E3B]">
            Our Four Non-Negotiable Pillars
          </h2>
          <p className="text-xs text-gray-500">The foundational values that guide our engineering, partner vetting, and delivery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#066B4B] flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-base text-gray-900">Uncompromising Food Safety</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              We never compromise on health. Donors must certify preparation timestamps, storage temperatures, and allergen profiles.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-base text-gray-900">Human Dignity First</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Surplus food is not “scrap” or “leftovers.” It is fresh, delicious banquet cuisine served respectfully in clean, covered meal boxes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-base text-gray-900">Radical Traceability</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every pickup and handover is logged in our database with timestamps, volunteer details, and shelter recipient records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="font-bold text-base text-gray-900">Climate &amp; Methane Prevention</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Preventing organic waste from decaying in municipal landfills actively curtails potent greenhouse methane emissions.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership & Values */}
      <div className="bg-emerald-50/70 rounded-3xl p-8 sm:p-12 border border-emerald-100 space-y-6">
        <h3 className="text-2xl font-bold text-[#064E3B] text-center">
          Building Transparent Trust in Every City
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 max-w-3xl mx-auto text-center leading-relaxed">
          FoodMitra operates as a public-benefit technology initiative. We partner with local municipalities, food safety commissioners, and community volunteer circles to foster an ecosystem where generosity meets scientific cold-chain logistics.
        </p>
        <div className="flex justify-center pt-2">
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Inquire About City Expansion &amp; Partnerships
          </button>
        </div>
      </div>
    </div>
  );
};
