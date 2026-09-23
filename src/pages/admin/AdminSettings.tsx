import React, { useState } from 'react';
import {
  Save,
  Building,
  Phone,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AdminSettingsProps {
  settings: BusinessSettings | null;
  onSettingsUpdated: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onSettingsUpdated }) => {
  const { role } = useAuth();
  const [formData, setFormData] = useState<BusinessSettings | null>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!formData) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateSettings(formData, role);
      setSavedSuccess(true);
      onSettingsUpdated();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update business settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Business Profile & Tax Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Manage legal registered entities, bank accounts for invoices, delivery charges, and GST rates.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 text-xs">
        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-700" />
            <span>1. Commercial Identity & Contacts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Commercial Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Support</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* GST & Invoicing */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-700" />
            <span>2. Statutory Invoicing & Tax Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={e => setFormData({ ...formData, pan: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Printing GST Rate (%)</label>
              <input
                type="number"
                value={formData.taxRatePercent}
                onChange={e => setFormData({ ...formData, taxRatePercent: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>3. Delivery Fee Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.deliveryFee}
                onChange={e => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold}
                onChange={e => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Security & Administrative Session Policy */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>4. Administrative Security & Session Expiration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Admin Session Inactivity Timeout
              </label>
              <select
                value={formData.adminSessionTimeoutMinutes ?? 30}
                onChange={e => setFormData({ ...formData, adminSessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes (Standard / Default)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hour)</option>
                <option value={90}>90 minutes (1.5 hours)</option>
                <option value={120}>120 minutes (2 hours)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Automatically terminates the administrative console session if no qualifying interaction (mouse movement, clicks, keyboard input, touch, or navigation) occurs within this duration.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Business Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
