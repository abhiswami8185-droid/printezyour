import React from 'react';
import {
  Award,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Users,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import aboutPlantPhoto from '../assets/images/about_plant_photo_1790256281618.jpg';

interface AboutPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Chandigarh's Official Printing House
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
          Crafting Lasting Impressions for 12+ Years
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Founded in Chandigarh, PrintezYour has grown from a specialized offset workshop into a premier
          commercial printing, luxury packaging, and brand merchandising ecosystem.
        </p>
      </div>

      {/* Story & Press Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Precision Machinery Meets Master Craftsmanship
          </h2>
          <p>
            At PrintezYour, printing is more than putting ink onto substrate. It is an exact science of color calibration,
            paper grain alignment, bleed tolerance, and moisture resistance.
          </p>
          <p>
            Our Hallo Majra facility hosts heavy-duty Heidelberg 4-color offset presses, high-resolution Roland large-format eco-solvent machines,
            and specialized digital print-on-demand engines. Whether you require 100 urgent visiting cards with gold foil stamping
            or 50,000 custom-engineered corrugated boxes for FMCG shipping, we deliver the same uncompromising excellence.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-bold text-blue-700 text-lg">20,000+</div>
              <div className="text-[11px] text-slate-500">Jobs Executed</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-bold text-blue-700 text-lg">5,000+</div>
              <div className="text-[11px] text-slate-500">Businesses Served</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 aspect-4/3 relative">
          <img
            src={aboutPlantPhoto || getAssetUrl('/images/about-plant.jpg')}
            alt="Commercial color calibration & finishing plant machinery"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = getAssetUrl('/images/about-plant.jpg');
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
            <span className="text-white text-xs font-semibold">
              Commercial Color Calibration & Finishing Plant · Hallo Majra, Chandigarh
            </span>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 font-display">Why Businesses Choose PrintezYour</h3>
          <p className="text-xs text-slate-500">Uncompromising principles guiding our press operators every day.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Zero-Compromise Paper & Ink</h4>
            <p>
              We source paper mills directly (ITC, Century, BILT) and utilize certified food-grade and eco-solvent inks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Guaranteed Turnarounds</h4>
            <p>
              Committed delivery slots with same-day emergency options for events, exhibitions, and corporate launches.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Local Chandigarh Roots</h4>
            <p>
              Walk in any time for tangible touch-and-feel swatch booklets, box die mockups, and personal consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
