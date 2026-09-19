import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Camera,
  Clock,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Grid,
  List,
  Filter
} from 'lucide-react';
import { ServiceItem } from '../../types';

interface AdminServicesTabProps {
  services: ServiceItem[];
  canManage: boolean;
  onEditPhoto: (service: ServiceItem) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminServicesTab: React.FC<AdminServicesTabProps> = ({
  services = [],
  canManage,
  onEditPhoto
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const safeServices = Array.isArray(services) ? services : [];

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    safeServices.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [safeServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return safeServices.filter(s => {
      if (selectedCategory !== 'All' && s.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCat = (s.category || '').toLowerCase().includes(q);
        const matchDesc = (s.description || '').toLowerCase().includes(q);
        return matchName || matchCat || matchDesc;
      }
      return true;
    });
  }, [safeServices, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Telemetry Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Capabilities
          </span>
          <div className="text-2xl font-black text-slate-900 font-display">
            {safeServices.length}
          </div>
          <span className="text-[11px] text-slate-500">Commercial print services</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Active Categories
          </span>
          <div className="text-2xl font-black text-blue-700 font-display">
            {categories.length}
          </div>
          <span className="text-[11px] text-slate-500">Offset, Large Format, etc.</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Custom Quote Ready
          </span>
          <div className="text-2xl font-black text-emerald-700 font-display">
            100%
          </div>
          <span className="text-[11px] text-slate-500">Supports tailored specs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Storefront Status
          </span>
          <div className="text-2xl font-black text-purple-700 font-display">
            Live
          </div>
          <span className="text-[11px] text-slate-500">Publicly discoverable</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services by capability name, process, or category..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Categories ({safeServices.length})</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategory !== 'All' || searchQuery.trim()) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Active filters:</span>
            {selectedCategory !== 'All' && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-blue-900 font-bold">
                  &times;
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Search: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 font-bold">
                  &times;
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-bold underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Services List / Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No services matched your search criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the active category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const imgUrl = service.image || service.imageUrl || '/images/services/visiting-cards.jpg';
            const turnaround = service.turnaroundTime || (service as any).typicalTurnaround || '24-48 Hours';

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Banner with Direct Edit Action */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={e => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/images/services/visiting-cards.jpg')) {
                          target.src = '/images/services/visiting-cards.jpg';
                        }
                      }}
                    />

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {service.category}
                    </span>

                    {/* Turnaround badge */}
                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {turnaround}
                    </span>

                    {/* Photo Edit Overlay Button */}
                    <button
                      type="button"
                      onClick={() => onEditPhoto(service)}
                      disabled={!canManage}
                      className="absolute bottom-3 right-3 bg-slate-900/85 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      title="Update service photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Edit Photo</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features Tags */}
                    {service.features && service.features.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Capabilities & Specs
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              {feat}
                            </span>
                          ))}
                          {service.features.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                              +{service.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                    /{service.slug}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`#/services`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                      title="View on Storefront"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onEditPhoto(service)}
                      disabled={!canManage}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3.5">Service & Photo</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Turnaround</th>
                  <th className="p-3.5">Key Capabilities</th>
                  <th className="p-3.5 text-right">Photo Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map(service => {
                  const imgUrl = service.image || service.imageUrl || '/images/services/visiting-cards.jpg';
                  const turnaround = service.turnaroundTime || (service as any).typicalTurnaround || '24-48 Hours';

                  return (
                    <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Photo + Name */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => canManage && onEditPhoto(service)}
                            className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 shadow-2xs relative group cursor-pointer"
                            title="Click to edit photo"
                          >
                            <img
                              src={imgUrl}
                              alt={service.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              onError={e => {
                                const target = e.currentTarget;
                                if (!target.src.includes('/images/services/visiting-cards.jpg')) {
                                  target.src = '/images/services/visiting-cards.jpg';
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Camera className="w-4 h-4" />
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {service.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              /{service.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {service.category}
                        </span>
                      </td>

                      {/* Turnaround */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-cyan-600" />
                          {turnaround}
                        </span>
                      </td>

                      {/* Key Capabilities */}
                      <td className="p-3.5">
                        <div className="text-[11px] text-slate-600 max-w-sm line-clamp-1">
                          {service.features ? service.features.join(' • ') : service.description}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onEditPhoto(service)}
                          disabled={!canManage}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Edit Photo</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
