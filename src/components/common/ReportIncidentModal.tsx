import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId?: number | null;
  donationTitle?: string;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  donationId,
  donationTitle,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'quality_issue',
    severity: 'medium',
    title: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Authentication Required', 'Please log in to submit a food safety or service complaint.');
      return;
    }

    if (!formData.title || !formData.description) {
      error('Missing Information', 'Please provide a title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.reportIncident({
        donation_id: donationId || null,
        type: formData.type,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
      });

      success('Report Filed', 'Food safety incident submitted. Our compliance team will audit this immediately.');
      onClose();
      setFormData({ type: 'quality_issue', severity: 'medium', title: '', description: '' });
    } catch (err: any) {
      error('Submission Failed', err.message || 'Could not log report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Report Food Safety or Quality Incident</h3>
              <p className="text-xs text-red-700">Strict zero-tolerance food safety auditing protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-red-100/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {donationTitle && (
            <div className="p-3 bg-gray-50 rounded-lg text-xs border border-gray-200">
              <span className="font-medium text-gray-600">Referenced Donation:</span>{' '}
              <span className="font-semibold text-gray-900">
                #{donationId} — {donationTitle}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Incident Category</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
            >
              <option value="quality_issue">Food Quality / Off-Odor / Appearance Concern</option>
              <option value="temperature_violation">Temperature Abuse (Not kept hot/cold)</option>
              <option value="packaging_damage">Damaged, Unsealed, or Contaminated Packaging</option>
              <option value="allergen_mismatch">Undeclared Allergens or Inaccurate Description</option>
              <option value="late_pickup">Volunteer or NGO Delayed Pickup &gt; 90 mins</option>
              <option value="donor_refusal">Donor Refused or Location Inaccessible</option>
              <option value="other">Other Operational Disruption</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Severity Level</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'hover:border-blue-400' },
                { id: 'medium', label: 'Medium', color: 'hover:border-amber-400' },
                { id: 'high', label: 'High', color: 'hover:border-orange-500' },
                { id: 'critical', label: 'Critical', color: 'hover:border-red-600' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setFormData({ ...formData, severity: lvl.id as any })}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition text-center capitalize ${
                    formData.severity === lvl.id
                      ? 'border-red-600 bg-red-50 text-red-800 ring-2 ring-red-200'
                      : 'border-gray-200 text-gray-600 ' + lvl.color
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Incident Title</label>
            <input
              type="text"
              required
              placeholder="Brief summary (e.g. Soup arrived lukewarm at 40°C)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Observations</label>
            <textarea
              required
              rows={3}
              placeholder="Describe what occurred, container condition, exact time noticed, temperature check, and immediate corrective steps taken..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
            />
          </div>

          <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800 border border-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              FoodMitra prioritizes health above all. When in doubt, do <strong>not</strong> consume or distribute compromised food.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'File Report with Audit Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
