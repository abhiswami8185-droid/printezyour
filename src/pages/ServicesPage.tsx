import React, { useState } from 'react';
import {
  Layers,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Printer,
  Package,
  FileSpreadsheet
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesPageProps {
  services: ServiceItem[];
  onNavigate: (view: string, param?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services = [], onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Commercial Offset', 'Digital & Quick Print', 'Packaging & Boxes', 'Large Format & Signage', 'Merchandise & Corporate'];

  const filteredServices = (services || []).filter(srv => {
    if (activeCategory !== 'All' && srv.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const srvName = srv.name || '';
      const srvDesc = srv.description || srv.shortDesc || srv.fullDesc || '';
      const srvFeats = srv.features || [];
      return (
        srvName.toLowerCase().includes(q) ||
        srvDesc.toLowerCase().includes(q) ||
        srvFeats.some(f => (f || '').toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Page Header */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-600/40 text-cyan-300 text-xs px-3.5 py-1.5 rounded-full font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Industrial Equipment · Offset & Digital Presses</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight">
            Commercial Printing & Packaging Services
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            From million-run offset magazines to short-run digital mockups, our facility in Chandigarh
            delivers precision color management, food-grade safe inks, and high-speed finishing.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search all 20 services..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Services Grid (All 20 Services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(srv => {
          const serviceImage = srv.image || srv.imageUrl || '/images/services/visiting-cards.jpg';
          const serviceMaterials = srv.materials || srv.materialsAvailable || [];
          const serviceFeatures = srv.features || [];
          const turnaround = srv.turnaroundTime || srv.typicalTurnaround || '24-48 Hours';
          const description = srv.description || srv.shortDesc || srv.fullDesc || '';

          return (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header with image */}
                <div className="aspect-16/9 bg-slate-100 relative overflow-hidden">
                  <img
                    src={serviceImage}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/images/services/visiting-cards.jpg')) {
                        target.src = '/images/services/visiting-cards.jpg';
                      }
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {srv.category}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {turnaround}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {description}
                  </p>

                  {/* Key Specifications */}
                  {serviceMaterials.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Supported Materials & Inks
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {serviceMaterials.map((m, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {serviceFeatures.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Finishing Options
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {serviceFeatures.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {srv.pricingModel || 'Custom & Bulk Rates'}
                  </span>

                  <button
                    onClick={() => onNavigate('products', srv.slug)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Order / Pricing</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
