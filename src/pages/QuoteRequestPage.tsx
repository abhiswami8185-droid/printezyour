import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface QuoteRequestPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const QuoteRequestPage: React.FC<QuoteRequestPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    whatsapp: '',
    company: '',
    serviceCategory: 'Corrugated Packaging Boxes',
    productRequirement: '',
    quantity: 500,
    sizeSpecs: '',
    materialPreference: 'Virgin Kraft Paper 180 GSM / 3-Ply',
    urgentTimeline: 'Standard (3-5 Days)'
  });

  const [artworkFile, setArtworkFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await api.uploadArtwork(file);
      setArtworkFile({
        name: uploaded.name,
        url: uploaded.url
      });
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const quote = await api.submitQuote({
        ...formData,
        artworkUrl: artworkFile?.url || undefined
      });
      setSubmittedQuote(quote);
    } catch (err: any) {
      setError(err.message || 'Could not submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const getWaQuoteLink = (q: any) => {
    const text = `*CUSTOM QUOTE INQUIRY — ${q.id}*
Customer: ${q.customerName} (${q.phone})
Category: ${q.serviceCategory}
Quantity: ${q.quantity}
Specs: ${q.sizeSpecs || 'Custom'}
Material: ${q.materialPreference}
Requirement: ${q.productRequirement}
Please review and share official estimate.`;

    return `https://wa.me/918557049897?text=${encodeURIComponent(text)}`;
  };

  if (submittedQuote) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Quote Request Received
          </span>
          <h1 className="text-3xl font-black text-slate-900 font-display">
            Thank You, {submittedQuote.customerName}!
          </h1>
          <p className="text-sm text-slate-600">
            Your quotation reference number is{' '}
            <strong className="text-slate-900 text-base">{submittedQuote.id}</strong>.
            Our print estimations team will evaluate your specifications and reply within 2 to 4 business hours.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-2 text-xs text-slate-700">
          <div className="font-bold text-slate-900 pb-2 border-b">Summary of Your Request</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Category: <strong>{submittedQuote.serviceCategory}</strong></div>
            <div>Quantity: <strong>{submittedQuote.quantity} units</strong></div>
            <div>Timeline: <strong>{submittedQuote.urgentTimeline}</strong></div>
            <div>Contact: <strong>{submittedQuote.phone}</strong></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={getWaQuoteLink(submittedQuote)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Fast-Track on WhatsApp</span>
          </a>

          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-xs transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Enterprise & Custom Estimations
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
          Request a Custom Printing Quote
        </h1>
        <p className="text-sm text-slate-600">
          Have a non-standard size, custom die-cut box, bulk corporate gift, or multi-location delivery?
          Share your details below for a tailored commercial estimate.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b pb-2">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Apex Health Labs"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. info@company.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Job Specifications */}
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b pb-2">
              2. Job Specifications & Dimensions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Product Type *</label>
                <select
                  value={formData.serviceCategory}
                  onChange={e => setFormData({ ...formData, serviceCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Corrugated Packaging Boxes">Corrugated Packaging Boxes (3/5/7 Ply)</option>
                  <option value="Rigid Gift Boxes">Rigid Luxury Gift Boxes & Sweet Boxes</option>
                  <option value="Custom Paper Carry Bags">Custom Paper Carry Bags</option>
                  <option value="Waterproof Product Labels">Roll & Sheet Waterproof Labels</option>
                  <option value="Visiting Cards & Luxury Finishes">Visiting Cards (Spot UV, Foil Stamped)</option>
                  <option value="Catalogs & Brochures">Corporate Catalogs & Booklets</option>
                  <option value="Outdoor Flex & Backlit Signs">Outdoor Flex & Star Backlit Signages</option>
                  <option value="Corporate Diaries & Calendars">Corporate Stationery & Gifts</option>
                  <option value="Other Custom Work">Other Custom Work</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exact Dimensions / Size Specs</label>
                <input
                  type="text"
                  value={formData.sizeSpecs}
                  onChange={e => setFormData({ ...formData, sizeSpecs: e.target.value })}
                  placeholder="e.g. 10 x 8 x 4 inches or A4 size folded"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material / Paper Preference</label>
                <input
                  type="text"
                  value={formData.materialPreference}
                  onChange={e => setFormData({ ...formData, materialPreference: e.target.value })}
                  placeholder="e.g. 350 GSM Art Card with Velvet Touch"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Detailed Requirements & Notes *</label>
              <textarea
                required
                rows={3}
                value={formData.productRequirement}
                onChange={e => setFormData({ ...formData, productRequirement: e.target.value })}
                placeholder="Describe your project, finishing (lamination, UV, gold foil), packing requirements, delivery location, etc."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 3: File Upload */}
          <div className="space-y-2 pt-2">
            <label className="block font-semibold text-xs text-slate-700">
              Attach Reference Sample / Mockup (Optional)
            </label>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between text-xs">
              <input
                type="file"
                id="quote-file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="quote-file"
                className="cursor-pointer font-bold text-blue-700 hover:underline flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{artworkFile ? artworkFile.name : 'Select file (PDF, AI, CDR, ZIP, PNG, JPG)'}</span>
              </label>
              {artworkFile && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free quote · No obligation · GST invoicing guaranteed</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>{submitting ? 'Submitting Quote...' : 'Submit Quote Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
