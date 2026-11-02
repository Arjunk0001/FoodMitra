import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC<{ onOpenReportModal?: () => void }> = ({ onOpenReportModal }) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Partnership Inquiry',
    inquiry_type: 'partnership',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      error('Missing details', 'Please fill in name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitContact(formData);
      success('Message Received!', 'Thank you for reaching out to FoodMitra. Our team will contact you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Partnership Inquiry',
        inquiry_type: 'partnership',
        message: '',
      });
    } catch (err: any) {
      error('Failed to Send', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#066B4B] text-xs font-bold border border-emerald-200">
          Support &amp; Community Relations
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#064E3B] tracking-tight">
          We’re Here to Help
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Whether you want to set up scheduled food pickups for your banquet facility, register your shelter home, or discuss corporate CSR alignment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency 24/7 Hotline card */}
          <div className="bg-[#064E3B] text-white p-6 rounded-3xl shadow-lg border border-emerald-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#B9E769]">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Surplus Food Rescue Line
                </span>
                <p className="text-xl font-extrabold text-white">1800-FOOD-MITRA</p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Toll-free emergency helpline available 24 hours a day for immediate banquet buffer food dispatches in covered cities.
            </p>
          </div>

          {/* Operational Offices */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Regional Operations Hubs
            </h3>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#066B4B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 text-sm">Mumbai Central Hub (Headquarters)</strong>
                  <span>401, Social Impact Hub, BKC, Bandra East, Mumbai, Maharashtra 400051</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#066B4B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 text-sm">Bengaluru Tech &amp; Cold-Chain Office</strong>
                  <span>7th Cross, Indiranagar 100ft Road, Bengaluru, Karnataka 560038</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#066B4B] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 text-sm">Delhi NCR Distribution Hub</strong>
                  <span>Connaught Place Outer Circle, New Delhi 110001</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <Mail className="w-4 h-4 text-[#066B4B] shrink-0" />
                <span className="font-semibold text-gray-900">General: support@foodmitra.org</span>
              </div>
            </div>
          </div>

          {/* Incident reporting alert card */}
          <div className="bg-red-50 p-5 rounded-3xl border border-red-200 space-y-2 text-xs text-red-900">
            <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Food Safety &amp; Quality Incidents
            </div>
            <p className="leading-relaxed">
              If you have noticed any temperature violation, broken seal, or quality issue with a delivery:
            </p>
            <button
              onClick={onOpenReportModal}
              className="mt-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-2xs"
            >
              File Safety Audit Ticket
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#064E3B]">Send a Message</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill out this form and our team coordinator will get back to you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rao"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@banquethall.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98000 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Inquiry Purpose *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                >
                  <option value="Commercial Donor Onboarding">Commercial Donor Onboarding</option>
                  <option value="NGO Partner Registration">NGO Partner Registration</option>
                  <option value="Volunteer Squad Application">Volunteer Squad Application</option>
                  <option value="Corporate CSR Sponsorship">Corporate CSR Sponsorship</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message *</label>
              <textarea
                required
                rows={4}
                placeholder="Please describe how we can assist your facility, your location, or any specific questions..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full text-xs rounded-xl border border-gray-300 p-3 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4 text-[#B9E769]" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
