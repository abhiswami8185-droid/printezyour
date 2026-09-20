import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  Award,
  Zap,
  Layers,
  ChevronRight,
  FileCheck,
  Truck,
  MessageSquare,
  HelpCircle,
  MapPin,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { Product, Category, ServiceItem } from '../types';
import { LivePrinterHeroAnimation } from '../components/LivePrinterHeroAnimation';
import { getAssetUrl } from '../utils/assets';

interface HomePageProps {
  products?: Product[];
  categories?: Category[];
  services?: ServiceItem[];
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products = [],
  categories = [],
  services = [],
  onNavigate
}) => {
  // Mini Estimator State
  const [estProduct, setEstProduct] = useState('visiting-cards');
  const [estQty, setEstQty] = useState(500);
  const [showEstimator, setShowEstimator] = useState(false);

  const getEstimatedPrice = () => {
    if (estProduct === 'visiting-cards') return Math.round(estQty * 2.2);
    if (estProduct === 'stickers') return Math.round(estQty * 2.8);
    if (estProduct === 'flyers') return Math.round(estQty * 1.2);
    if (estProduct === 'carry-bags') return Math.round(estQty * 8.5);
    return Math.round(estQty * 3.5);
  };

  const featuredProducts = (products || []).filter(p => p.isFeatured).slice(0, 8);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION (With Live Printer Animation)       */}
      {/* ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-radial from-slate-950 via-[#0a0f18] to-slate-950 text-white pt-10 pb-20 sm:pt-14 sm:pb-28 border-b border-slate-800/80">
        {/* Subtle decorative background gradient glows derived from brand electric cyan/blue */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-blue-600/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Brand Headline, Tagline & Value Prop (50% desktop width) */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 text-cyan-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chandigarh's Official Commercial Press · Tricity Delivery</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] font-display">
                Your Imagination. <br />
                <span className="bg-linear-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  Our Precision Print.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Direct-from-press production for visiting cards, packaging boxes, waterproof stickers,
                heavy-duty flex hoardings, brochures, and corporate merchandise. 12+ years of unmatched precision in Chandigarh.
              </p>

              {/* CTAs with 3D Dimensional Button Styling */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={() => onNavigate('products')}
                  className="btn-3d-cyan text-slate-950 font-black px-6 py-3.5 flex items-center gap-2 tracking-tight text-sm sm:text-base shadow-xl"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => onNavigate('quote')}
                  className="btn-3d-dark text-white font-bold px-5 py-3.5 text-sm sm:text-base border border-slate-700/60"
                >
                  Get a Custom Quote
                </button>

                <a
                  href="https://wa.me/918557049897?text=Hello%20Printezyour%2C%20I%20want%20to%20order%20printing%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d-emerald text-white font-bold px-5 py-3.5 flex items-center gap-2 text-sm sm:text-base shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                  <span>WhatsApp Us</span>
                </a>
              </div>

              {/* Micro Perks */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Digital Artwork Proof
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Same-Day Local Pickup
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> GST Tax Invoicing
                </span>
              </div>

              {/* Quick Estimator Toggle Bar */}
              <div className="pt-3">
                <button
                  onClick={() => setShowEstimator(!showEstimator)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showEstimator ? 'Hide Instant Price Calculator' : '⚡ Calculate Instant Print Price (Live Estimator)'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEstimator ? 'rotate-180' : ''}`} />
                </button>

                {showEstimator && (
                  <div className="mt-3 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-xl backdrop-blur-md max-w-md mx-auto lg:mx-0 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Instant Print Estimator</span>
                      <span className="text-[10px] text-cyan-400 font-mono font-semibold">Live Press Rate</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Select Printing Category</label>
                        <select
                          value={estProduct}
                          onChange={e => setEstProduct(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-hidden focus:border-cyan-500"
                        >
                          <option value="visiting-cards">Premium Visiting Cards (350 GSM Matte)</option>
                          <option value="stickers">Waterproof Vinyl Die-Cut Stickers</option>
                          <option value="flyers">Promotional Gloss Flyers (130 GSM)</option>
                          <option value="carry-bags">Eco-Friendly Kraft Carry Bags</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span className="font-medium">Quantity: {estQty} Units</span>
                          <span className="text-cyan-400 font-bold">₹{getEstimatedPrice().toLocaleString('en-IN')}</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="5000"
                          step="100"
                          value={estQty}
                          onChange={e => setEstQty(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400">+ 18% GST Applicable</span>
                        <button
                          onClick={() => onNavigate('products', estProduct)}
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Order This Spec &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Large Premium Live Animated Commercial Printing Press (50% desktop width) */}
            <div className="lg:col-span-6 relative w-full flex items-center justify-center">
              <LivePrinterHeroAnimation
                onSelectProduct={(slug) => onNavigate('products', slug)}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. TRUST BAR (Section 20) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8 -mt-12 sm:-mt-16 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex items-center gap-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">12+ Years</div>
                <div className="text-xs text-slate-500 font-medium">Industry Master Printers</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">20,000+</div>
                <div className="text-xs text-slate-500 font-medium">Orders Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">4.9 ★ Rating</div>
                <div className="text-xs text-slate-500 font-medium">100+ Google Reviews</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">5,000+</div>
                <div className="text-xs text-slate-500 font-medium">Happy Clients Served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. FEATURED PRODUCTS CATALOG PREVIEW (Section 5, 6, 7) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Top Sellers</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
              Popular Custom Printing Products
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Choose your specifications, upload your artwork or logo, and order with instant pricing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(featuredProducts || []).map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image with Tag */}
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={getAssetUrl((product.images && product.images[0]) || product.image || '/images/products/visiting-cards-matte.jpg')}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = getAssetUrl('/images/products/visiting-cards-matte.jpg');
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {product.category}
                </span>
                <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {product.productionTime}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting at</span>
                    <div className="font-extrabold text-base text-slate-900">
                      ₹{product.basePrice}{' '}
                      <span className="text-[11px] text-slate-500 font-normal">/ {product.minQuantity} pcs</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('product-detail', product.slug)}
                    className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Configure</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. ALL 20 CATEGORIES BROWSER (Section 4) */}
      {/* ---------------------------------------------------- */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">End-to-End Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Explore Our 20 Printing & Branding Categories
            </h2>
            <p className="text-sm text-slate-500">
              Everything your business needs to make an indelible mark — manufactured in-house with commercial precision.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {(categories || []).map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('products', cat.slug)}
                className="bg-white p-4 rounded-xl border border-slate-200/80 text-left hover:border-blue-500 hover:shadow-md transition-all group focus:outline-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {cat.description}
                </p>
              </button>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-900 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <span>Read Full Machine & Material Specifications Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. HOW IT WORKS / THE PRINTING WORKFLOW */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Fast & Hassle-Free</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            How Simple It Is to Print with PrintezYour
          </h2>
          <p className="text-sm text-slate-500">
            From artwork proofing to delivery at your doorstep in Chandigarh Tricity or across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">1. Select Product & Specs</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose your quantity, paper GSM, dimensions, and premium finishes like matte lamination or spot UV.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">2. Upload Artwork / Logo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your design in PDF, CDR, AI, PSD, or image format. Need design help? Our in-house team assists.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">3. Digital Proof on WhatsApp</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We verify bleed margins, color balance, and typography, sharing a final proof on WhatsApp for your approval.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 relative">
            <span className="text-3xl font-black text-blue-100 absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">4. Fast Dispatch & Pickup</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Printed on Heidelberg & Roland commercial presses, carefully packed and dispatched with live tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. LOCAL CHANDIGARH PRESENCE (Section 29) */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full font-semibold">
                <MapPin className="w-3.5 h-3.5" /> Visit Our Chandigarh Facility
              </span>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-display">
                Need urgent prints today? <br />
                Drop by our Hallo Majra office.
              </h2>

              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Whether you need paper samples, touch-and-feel material swatches, or urgent same-day banners,
                our Chandigarh production facility is open Monday to Saturday.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white">
                  Plot No 1794, Gym Deep Complex, Hallo Majra, Near Urban Akhada, Chandigarh – 160002
                </div>
                <div>Hours: Mon–Fri 9:00 AM – 7:00 PM · Sat 10:00 AM – 6:00 PM</div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <a
                  href="tel:+918557049897"
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Call +91 8557049897
                </a>
                <a
                  href="https://maps.google.com/?q=Plot+No+1794+Gym+Deep+Complex+Hallo+Majra+Chandigarh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs backdrop-blur-md transition-colors"
                >
                  Get Driving Directions
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="rounded-xl overflow-hidden aspect-4/3 bg-slate-800 relative">
                <iframe
                  title="PrintezYour Location Chandigarh"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13723.364448575073!2d76.7905183!3d30.7046187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fed15a31a90c1%3A0xe7bc386121e78df!2sHallo%20Majra%2C%20Chandigarh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
