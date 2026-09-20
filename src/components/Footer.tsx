import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Category } from '../types';
import { getAssetUrl } from '../utils/assets';

interface FooterProps {
  categories?: Category[];
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ categories = [], onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center shrink-0 text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">12+ Years Experience</h4>
              <p className="text-xs text-slate-400">Master printers in Chandigarh</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-pink-900/40 border border-pink-700/40 flex items-center justify-center shrink-0 text-pink-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">20,000+ Completed Orders</h4>
              <p className="text-xs text-slate-400">4.9★ from 5,000+ happy clients</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-900/40 border border-amber-700/40 flex items-center justify-center shrink-0 text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Fast Tricity & Pan-India Dispatch</h4>
              <p className="text-xs text-slate-400">Same-day pickup available</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">100% Quality Assurance</h4>
              <p className="text-xs text-slate-400">Digital artwork proof before print</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-slate-800 text-xs leading-relaxed">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="bg-white rounded-xl px-3.5 py-2 inline-flex items-center shadow-lg border border-slate-800 max-w-[240px] text-left group cursor-pointer transition-transform hover:scale-[1.02] focus:outline-hidden"
              title="PrintezYour - Go to Home"
            >
              <img
                src={getAssetUrl('/logo.png')}
                alt="Printezyour - Your imagination, our print"
                className="h-9 sm:h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl('/logo.svg');
                }}
              />
            </button>
            <p className="text-slate-400 pr-4 text-xs">
              Printezyour is Chandigarh’s leading professional printing, designing, and branding hub.
              From high-precision visiting cards and packaging boxes to large-format flex banners and corporate stationery,
              we bring brands to life with cutting-edge technology and unmatched craft.
            </p>
            <div className="pt-2 text-slate-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Plot No 1794, Gym Deep Complex, Hallo Majra, Near Urban Akhada, Chandigarh – 160002, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="tel:+918557049897" className="hover:text-white transition-colors">
                  +91 8557049897
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="mailto:printezyour@gmail.com" className="hover:text-white transition-colors">
                  printezyour@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Mon–Fri 9:00 AM–7:00 PM · Sat 10:00 AM–6:00 PM (Sun Closed)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Printing Services */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">
              Popular Services
            </h5>
            <ul className="space-y-2 text-slate-400">
              {(categories || []).slice(0, 7).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('products', cat.slug)}
                    className="hover:text-cyan-300 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  View All 20 Services &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Packaging & Corporate */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">
              Packaging & Branding
            </h5>
            <ul className="space-y-2 text-slate-400">
              {(categories || []).slice(7, 14).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('products', cat.slug)}
                    className="hover:text-cyan-300 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Customer Policies & Transparency */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">
              Customer Policies
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('policy', 'print-quality')} className="hover:text-cyan-300 transition-colors">
                  Printing Quality Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'design-approval')} className="hover:text-cyan-300 transition-colors">
                  Design Approval & Proofing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'delivery')} className="hover:text-cyan-300 transition-colors">
                  Delivery & Pickup Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'payment')} className="hover:text-cyan-300 transition-colors">
                  Payment & Advance Terms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'refund')} className="hover:text-cyan-300 transition-colors">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'privacy')} className="hover:text-cyan-300 transition-colors">
                  Privacy Policy & Confidentiality
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'terms')} className="hover:text-cyan-300 transition-colors">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-slate-300">PrintezYour</strong> — Print | Design | Brand. All Rights Reserved.
            <span className="ml-2 text-slate-600">GSTIN: 04AABCP8557N1Z9</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://maps.google.com/?q=Plot+No+1794+Hallo+Majra+Chandigarh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Locate on Google Maps
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
