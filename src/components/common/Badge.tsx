import React from 'react';
import { DonationStatus } from '../../types';
import { CheckCircle, Clock, Truck, PackageCheck, AlertCircle, ShieldCheck } from 'lucide-react';

export const StatusBadge: React.FC<{ status: DonationStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const configs: Record<DonationStatus, { label: string; bg: string; text: string; icon: any }> = {
    available: { label: 'Available for Pickup', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle },
    claimed: { label: 'Claimed by NGO', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Clock },
    on_the_way: { label: 'Volunteer on the Way', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: Truck },
    picked_up: { label: 'Picked Up & En Route', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', icon: Truck },
    delivered: { label: 'Successfully Distributed', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-900', icon: PackageCheck },
    expired: { label: 'Expired (Unsafe)', bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: AlertCircle },
    cancelled: { label: 'Cancelled', bg: 'bg-gray-100 border-gray-300', text: 'text-gray-700', icon: AlertCircle },
  };

  const current = configs[status] || configs.available;
  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
};

export const DietaryBadge: React.FC<{ dietary: string }> = ({ dietary }) => {
  const isVeg = dietary?.toLowerCase() === 'vegetarian' || dietary?.toLowerCase() === 'vegan';
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-gray-200 shadow-2xs">
      <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-red-600 ring-2 ring-red-200'}`} />
      <span className="text-gray-700 font-medium">{dietary}</span>
    </span>
  );
};

export const VerifiedBadge: React.FC<{ text?: string }> = ({ text = 'Verified Partner' }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-[#066B4B] border border-emerald-200" title="Identity & Food Safety Registration Verified by FoodMitra">
      <ShieldCheck className="w-3.5 h-3.5 text-[#066B4B]" />
      <span>{text}</span>
    </span>
  );
};

export const UrgencyBadge: React.FC<{ hoursRemaining: number }> = ({ hoursRemaining }) => {
  if (hoursRemaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        <AlertCircle className="w-3 h-3" />
        Expired
      </span>
    );
  }

  if (hoursRemaining <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
        <Clock className="w-3 h-3 text-amber-700" />
        Urgent: {hoursRemaining}h left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      <Clock className="w-3 h-3 text-gray-500" />
      {hoursRemaining}h use-by window
    </span>
  );
};
