import React from 'react';
import { HeartHandshake, PhoneCall, Mail, MapPin, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string) => void; onOpenReportModal?: () => void }> = ({
  onNavigate,
  onOpenReportModal,
}) => {
  return (
    <footer className="bg-[#064E3B] text-white pt-16 pb-12 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-800/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
                <HeartHandshake className="w-6 h-6 text-[#B9E769]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Food<span className="text-[#B9E769]">Mitra</span>
              </span>
            </div>
            <p className="text-emerald-100/90 text-sm leading-relaxed max-w-sm">
              “Rescuing Surplus Food, Restoring Dignity.”
            </p>
            <p className="text-emerald-200/70 text-xs leading-relaxed max-w-sm">
              A technology-enabled food rescue platform connecting restaurants, hotels, banquet halls and caterers with verified NGOs and volunteer fleets to prevent food waste and nourish communities.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5 bg-emerald-900/60 py-1 px-2.5 rounded-lg border border-emerald-700/50">
                <ShieldCheck className="w-4 h-4 text-[#B9E769]" /> HACCP Temperature Protocol
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-900/60 py-1 px-2.5 rounded-lg border border-emerald-700/50">
                <ShieldCheck className="w-4 h-4 text-[#B9E769]" /> 100% Traceable Chain
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#B9E769]">Platform</h4>
            <ul className="space-y-2 text-sm text-emerald-100/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('available-food')} className="hover:text-white transition">
                  Live Available Food
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('donate-food')} className="hover:text-white transition">
                  Donate Surplus Food
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition">
                  Our Mission &amp; Impact
                </button>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#B9E769]">Join Network</h4>
            <ul className="space-y-2 text-sm text-emerald-100/80">
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition">
                  Restaurant &amp; Hotel Donors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition">
                  NGO &amp; Shelter Partners
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition">
                  Volunteer Delivery Squad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition">
                  Corporate CSR Partnerships
                </button>
              </li>
              <li>
                <button onClick={onOpenReportModal} className="text-amber-300 hover:text-amber-200 transition font-medium">
                  Report Quality Incident
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & 24/7 Hotline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#B9E769]">Direct Contact</h4>
            <div className="space-y-2.5 text-xs text-emerald-100/80">
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-[#B9E769] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white text-sm">1800-FOOD-MITRA</span>
                  <span className="text-[11px] text-emerald-300">Toll-free 24/7 Surplus Food Rescue</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B9E769] shrink-0" />
                <span>support@foodmitra.org</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B9E769] shrink-0 mt-0.5" />
                <span>BKC Social Hub, Bandra East, Mumbai, Maharashtra 400051</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal and Food Safety Compliance Note */}
        <div className="pt-8 text-xs text-emerald-200/60 space-y-2">
          <p className="leading-relaxed">
            <strong>Food Safety Transparency:</strong> FoodMitra facilitates the rapid logistical match between food donors and registered non-profit organizations. All donor partners verify adherence to safe food hygiene practices, safe storage standards, and immediate consumption deadlines. Software does not replace physical inspection; NGOs verify food temperature and sensory quality before community distribution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-emerald-800/40 gap-3">
            <p>© {new Date().getFullYear()} FoodMitra Foundation. All rights reserved.</p>
            <p className="flex items-center gap-1 text-emerald-300">
              Built with care for a zero-hunger, zero-waste world <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
