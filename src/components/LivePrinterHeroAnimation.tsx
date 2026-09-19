import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronRight,
  Eye,
  RotateCw,
  Maximize2,
  ArrowUpRight,
  Pause,
  Play
} from 'lucide-react';

export interface PrintedProductItem {
  id: string;
  name: string;
  category: string;
  specs: string;
  productSlug: string;
  tagline: string;
  badge: string;
  cardContent: React.ReactNode;
}

interface LivePrinterHeroAnimationProps {
  onSelectProduct?: (slug: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const LivePrinterHeroAnimation: React.FC<LivePrinterHeroAnimationProps> = ({
  onSelectProduct,
  onNavigate
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Define the 7 Real-World Printed Products
  const products: PrintedProductItem[] = [
    // 1. Business Card
    {
      id: 'business-cards',
      name: 'Executive Visiting Card',
      category: 'Corporate Stationery',
      specs: '350 GSM Velvet Matte · Spot UV & Cyan Foil',
      productSlug: 'visiting-cards',
      tagline: 'Precision micro-embossed finish',
      badge: 'Scene 1 / 7',
      cardContent: (
        <div className="w-full h-full bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 rounded-xl border border-slate-700/80 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
          {/* Cyan Foil Metallic Accent Line */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-transparent" />

          {/* Card Header */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-black text-cyan-400 text-xs">
                  P
                </div>
              </div>
              <div>
                <div className="text-[13px] font-black tracking-wider text-white">PRINTEZYOUR</div>
                <div className="text-[8px] text-cyan-400 font-semibold tracking-widest uppercase">Executive Series</div>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
              350 GSM
            </span>
          </div>

          {/* Card Body */}
          <div className="space-y-1 relative z-10 my-auto py-2">
            <div className="text-base font-bold text-white tracking-tight">Abhishek Sharma</div>
            <div className="text-[10px] text-cyan-300 font-medium">Chief Brand Strategist</div>
            <div className="text-[9px] text-slate-400">Sector 17, City Centre · Chandigarh</div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between text-[8.5px] text-slate-400 border-t border-slate-800/80 pt-2 relative z-10">
            <span className="font-mono text-cyan-400">+91 85570 49897</span>
            <span className="text-slate-500 tracking-wider uppercase font-semibold">UV Foil Stamped</span>
          </div>
        </div>
      )
    },

    // 2. Corporate Tri-Fold Brochure
    {
      id: 'brochures',
      name: 'Tri-Fold Corporate Brochure',
      category: 'Marketing Materials',
      specs: '170 GSM Art Gloss · Dual Crease Score',
      productSlug: 'flyers',
      tagline: 'Vibrant CMYK photographic fidelity',
      badge: 'Scene 2 / 7',
      cardContent: (
        <div className="w-full h-full bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex select-none">
          {/* Panel 1 */}
          <div className="w-1/3 bg-slate-900 text-white p-3 border-r border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest block">Brochure</span>
              <div className="text-[12px] font-black leading-tight mt-1 text-white">
                Next-Gen <br />Print Craft
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-1 w-8 bg-cyan-400 rounded-full" />
              <div className="text-[7.5px] text-slate-400">Heidelberg Speedmaster Production</div>
            </div>
          </div>
          {/* Panel 2 */}
          <div className="w-1/3 bg-slate-50 p-3 border-r border-slate-200 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-slate-800">Precision Finishes</div>
              <div className="space-y-1">
                <div className="h-1.5 bg-cyan-100 rounded-sm w-full" />
                <div className="h-1.5 bg-slate-200 rounded-sm w-5/6" />
                <div className="h-1.5 bg-slate-200 rounded-sm w-3/4" />
              </div>
            </div>
            <div className="bg-cyan-50 p-1.5 rounded text-[8px] text-cyan-900 font-semibold border border-cyan-200/60">
              100% Recyclable
            </div>
          </div>
          {/* Panel 3 */}
          <div className="w-1/3 bg-linear-to-b from-blue-600 to-cyan-600 text-white p-3 flex flex-col justify-between">
            <div className="text-right">
              <span className="text-[8px] font-mono text-cyan-200 font-semibold">PANTONE 2925</span>
            </div>
            <div>
              <div className="text-[11px] font-black">Printezyour</div>
              <div className="text-[7.5px] text-blue-100">Your imagination, our print</div>
            </div>
          </div>
        </div>
      )
    },

    // 3. Large Format Hoarding / Flex Banner
    {
      id: 'hoardings',
      name: 'Large Format Hoarding Banner',
      category: 'Signage & Outdoor',
      specs: 'Outdoor Heavy-Duty Flex · UV Weatherproof',
      productSlug: 'flex-banners',
      tagline: 'High-visibility outdoor architectural impact',
      badge: 'Scene 3 / 7',
      cardContent: (
        <div className="w-full h-full bg-linear-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-4 rounded-xl border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
          {/* Brass Eyelets in Corners */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-600/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-950" />
          </div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-600/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-950" />
          </div>
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-600/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-950" />
          </div>
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-600/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-950" />
          </div>

          <div className="flex items-center justify-between px-3 pt-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
              TRICITY GRAND OPENING
            </span>
            <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
              300 DPI · UV RESISTANT
            </span>
          </div>

          <div className="text-center px-2 py-1">
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-none">
              IMAGINE <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">IT.</span> WE PRINT <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">IT.</span>
            </div>
            <div className="text-[9px] text-slate-300 font-medium mt-1">
              Heavy-Duty Weather-Proof Solvent Prints · Seamless 10ft Width
            </div>
          </div>

          {/* Registration Marks bar */}
          <div className="flex items-center justify-between px-3 pb-1 text-[7px] text-slate-500 font-mono">
            <span>CMYK [0/100/100/0]</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700 inline-block" />
            </div>
            <span>BATCH #CH-9812</span>
          </div>
        </div>
      )
    },

    // 4. Printed Packaging Box
    {
      id: 'packaging',
      name: 'Custom Branded Packaging Box',
      category: 'Product Packaging',
      specs: '350 GSM Duplex Board · Die-Cut Creased & Laminated',
      productSlug: 'carry-bags',
      tagline: 'Structural strength with luxury shelf appeal',
      badge: 'Scene 4 / 7',
      cardContent: (
        <div className="w-full h-full bg-slate-900 text-white rounded-xl border border-slate-700/80 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle 3D Box Die-Cut Creases overlay */}
          <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 m-2 rounded-lg pointer-events-none" />
          <div className="absolute top-0 right-0 bg-linear-to-bl from-cyan-500/25 via-transparent to-transparent w-24 h-24" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[8px] uppercase tracking-widest text-cyan-400 font-mono">DIE-CUT #B-402</span>
              <div className="text-sm font-black text-white mt-0.5">Luxe Packaging Carton</div>
            </div>
            <span className="text-[8px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
              Matte Soft-Touch
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between relative z-10">
            <div>
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Fold & Lock Bottom Tray
              </div>
              <div className="text-[8px] text-slate-400 mt-0.5">Certified E-Commerce Crush Resistance</div>
            </div>
            <div className="text-right font-mono text-[9px] text-cyan-300 font-bold">
              ₹14.50<span className="text-[7px] text-slate-400 font-normal">/unit</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] text-slate-400 relative z-10 pt-1 border-t border-slate-800/80">
            <span>Eco Kraft & White Duplex</span>
            <span className="text-cyan-400 font-semibold">Spot Gloss Foil Available</span>
          </div>
        </div>
      )
    },

    // 5. Architectural / Art Poster
    {
      id: 'posters',
      name: 'Architectural & Art Poster',
      category: 'Fine Art & Display',
      specs: '250 GSM Satin Photo Finish · 12-Color Archival',
      productSlug: 'posters',
      tagline: 'Gallery grade true color reproduction',
      badge: 'Scene 5 / 7',
      cardContent: (
        <div className="w-full h-full bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl p-4 flex flex-col justify-between select-none relative overflow-hidden">
          {/* Poster Artwork Preview */}
          <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 via-blue-600/5 to-slate-100/50 pointer-events-none" />

          <div className="flex justify-between items-center relative z-10">
            <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">CHANDIGARH EXHIBIT</span>
            <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              ARCHIVAL EDITION
            </span>
          </div>

          <div className="relative z-10 py-1">
            <div className="text-lg font-black tracking-tight text-slate-900 leading-tight">
              MODERN URBANISM <br />
              <span className="text-blue-600 font-extrabold text-sm">&amp; PRINT AESTHETICS</span>
            </div>
            <div className="text-[8.5px] text-slate-500 mt-1 max-w-[85%]">
              High-pigment archival reproduction on 250 GSM acid-free satin substrate.
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 relative z-10 text-[8px] text-slate-600 font-mono">
            <span>DIM: 24" × 36" (A1)</span>
            <span className="font-semibold text-slate-900">PRINTEZYOUR ART PRESS</span>
          </div>
        </div>
      )
    },

    // 6. Waterproof Product Stickers / Label Sheet
    {
      id: 'stickers',
      name: 'Die-Cut Product Label Sheet',
      category: 'Labels & Packaging',
      specs: '120 Micron Vinyl · Waterproof & Scratch Resistant',
      productSlug: 'stickers',
      tagline: 'Kiss-cut precision contour peeling',
      badge: 'Scene 6 / 7',
      cardContent: (
        <div className="w-full h-full bg-slate-950 text-white rounded-xl border border-slate-800 shadow-2xl p-3.5 flex flex-col justify-between select-none relative overflow-hidden">
          {/* Holographic background sheen */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-linear-to-bl from-cyan-400/20 via-pink-400/15 to-transparent rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-between items-center relative z-10">
            <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-wider">KISS-CUT VINYL SHEET</span>
            <span className="text-[8px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-800/60">
              100% WATERPROOF
            </span>
          </div>

          {/* Simulated 4 peelable sticker badges */}
          <div className="grid grid-cols-2 gap-2 my-auto relative z-10">
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-2 text-center shadow-xs">
              <div className="text-[10px] font-black text-cyan-400">ORGANIC</div>
              <div className="text-[7.5px] text-slate-400">Jar Label</div>
            </div>
            <div className="bg-blue-600/90 border border-blue-400/60 rounded-full p-2 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="text-[9px] font-black text-white">FRESH</div>
              <div className="text-[7px] text-blue-100">Certified</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 text-center shadow-xs">
              <div className="text-[10px] font-black text-amber-400">BATCH 09</div>
              <div className="text-[7.5px] text-slate-400">Tamper-Evident</div>
            </div>
            <div className="bg-slate-900/90 border border-pink-500/40 rounded-lg p-2 text-center shadow-xs">
              <div className="text-[10px] font-black text-pink-400">HANDMADE</div>
              <div className="text-[7.5px] text-slate-400">Luxe Foil</div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[7.5px] text-slate-400 relative z-10 pt-1 border-t border-slate-800">
            <span>Roll & Sheet Dispenser Formats</span>
            <span className="text-cyan-300 font-mono">From ₹1.80/pc</span>
          </div>
        </div>
      )
    },

    // 7. Premium Gold-Foil Invitation
    {
      id: 'invitations',
      name: 'Luxury Foil Invitation Card',
      category: 'Events & Corporate',
      specs: '400 GSM Cotton Board · Metallic Gold Foil & Edge Gilt',
      productSlug: 'visiting-cards',
      tagline: 'Heirloom elegance for milestone celebrations',
      badge: 'Scene 7 / 7',
      cardContent: (
        <div className="w-full h-full bg-linear-to-b from-[#141923] to-[#0c1017] text-white rounded-xl border border-amber-400/40 shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Gold Foil Glow */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-20 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute inset-2 border border-amber-300/30 rounded-lg pointer-events-none" />

          <div className="text-center relative z-10 pt-1">
            <span className="text-[8px] font-serif tracking-[0.25em] text-amber-300/80 uppercase">
              CORDIALLY INVITED
            </span>
            <div className="text-base font-serif font-bold text-amber-200 mt-1 tracking-wide">
              The Annual Gala Dinner
            </div>
          </div>

          <div className="text-center relative z-10 my-auto py-1">
            <div className="text-[9px] text-slate-300 font-serif italic">
              Celebrating 12 Years of Innovation
            </div>
            <div className="text-[8px] font-mono text-amber-300/90 mt-1 tracking-widest uppercase">
              SATURDAY · 7:00 PM · CHANDIGARH
            </div>
          </div>

          <div className="flex items-center justify-between text-[7.5px] text-slate-400 relative z-10 border-t border-slate-800/80 pt-2 px-1">
            <span className="text-amber-300/70 font-serif">Deep Deboss Finish</span>
            <span className="font-mono text-cyan-300">Printezyour Luxury</span>
          </div>
        </div>
      )
    }
  ];

  // Auto-Cycle timer
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % products.length);
    }, 4800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, prefersReducedMotion, products.length]);

  const currentProduct = products[currentIdx];

  const handleSelect = (idx: number) => {
    setCurrentIdx(idx);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleActionClick = () => {
    if (onSelectProduct) {
      onSelectProduct(currentProduct.productSlug);
    } else if (onNavigate) {
      onNavigate('products', currentProduct.productSlug);
    }
  };

  return (
    <div
      id="live-printer-hero-scene"
      className="relative w-full max-w-xl mx-auto lg:max-w-none flex flex-col items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Soft Glows (Cyan & Deep Blue Brand Ambiance) */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-12 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Stage Enclosure */}
      <div className="relative w-full bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-slate-950/80 overflow-hidden">
        {/* Stage Header: Machine Status & Live Telemetry */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white flex items-center gap-2">
                <span>PRINTEZYOUR COMMERCIAL PRESS</span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.2 rounded-full">
                  LIVE PRINTING
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Heidelberg Speedmaster &amp; Roland Pro 4K
              </div>
            </div>
          </div>

          {/* Pause / Play / Step Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title={isPaused ? 'Resume printing loop' : 'Pause printing loop'}
              aria-label={isPaused ? 'Resume live animation' : 'Pause live animation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleSelect((currentIdx + 1) % products.length)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Next Printed Product"
              aria-label="Next Printed Product"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3D COMMERCIAL PRINTER MACHINE VISUALIZATION             */}
        {/* ======================================================== */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-800/70 overflow-hidden flex flex-col justify-between p-3 sm:p-4">
          {/* Top of Machine: Paper Feeder & Mechanical Hood */}
          <div className="relative w-full z-20">
            {/* Upper Enclosure Hood */}
            <div className="w-full bg-linear-to-b from-slate-800 via-slate-850 to-slate-900 h-10 rounded-t-lg border-t border-x border-slate-700/80 flex items-center justify-between px-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  FEED TRAY · READY
                </span>
              </div>
              {/* Spinning Cylinders indicator */}
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-slate-400 font-mono">INK DENSITY</span>
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-600" />
                </div>
              </div>
            </div>

            {/* Inspection Glass Window with Moving Roller & Laser Carriage */}
            <div className="w-full h-7 bg-slate-950/90 border-x border-b border-slate-800 relative overflow-hidden flex items-center justify-center">
              {/* Laser Printhead Carriage Sweeping Across */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute top-0 bottom-0 w-16 bg-linear-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none"
                  animate={{ x: ['-120%', '500%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: 'easeInOut'
                  }}
                >
                  <div className="w-full h-full border-r-2 border-cyan-300 shadow-sm shadow-cyan-400" />
                </motion.div>
              )}
              {/* Internal Rolling Cylinder */}
              <div className="w-4/5 h-2 bg-linear-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full opacity-60 flex items-center justify-between px-2">
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              </div>
            </div>

            {/* Output Slot Ejection Bevel */}
            <div className="w-full h-2.5 bg-linear-to-b from-slate-950 to-slate-900 border-x border-b border-slate-700/60 shadow-inner relative flex items-center justify-center">
              <div className="w-3/4 h-0.5 bg-cyan-400/50 shadow-xs shadow-cyan-300 rounded-full" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE PRINTED PRODUCT EMERGING LIVE (Center Animated Area) */}
          {/* ======================================================== */}
          <div className="relative flex-1 flex items-center justify-center py-2 z-10 perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        y: -40,
                        opacity: 0,
                        scale: 0.92,
                        rotateX: 18
                      }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotateX: 0
                      }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        y: 35,
                        opacity: 0,
                        scale: 0.95,
                        rotateX: -10
                      }
                }
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="w-full max-w-[340px] sm:max-w-[380px] h-[190px] sm:h-[215px] cursor-pointer relative"
                onClick={handleActionClick}
                title={`Click to customize ${currentProduct.name}`}
              >
                {/* 3D Floating Shadow */}
                <div className="absolute -bottom-4 left-4 right-4 h-6 bg-cyan-950/40 rounded-full blur-xl pointer-events-none" />

                {/* The Real Product Canvas */}
                <div className="w-full h-full transition-transform hover:scale-[1.02]">
                  {currentProduct.cardContent}
                </div>

                {/* Floating "Live Printed" Stamp Pill */}
                <div className="absolute -bottom-2.5 right-3 bg-slate-900/95 text-cyan-300 text-[9px] font-bold font-mono px-2.5 py-1 rounded-full border border-cyan-500/50 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{currentProduct.badge}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Machine Tray & Stainless Catch Plate */}
          <div className="relative w-full z-20">
            <div className="w-full bg-linear-to-t from-slate-900 via-slate-850 to-slate-800 h-9 rounded-b-lg border-b border-x border-slate-700/80 px-4 flex items-center justify-between text-slate-300 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono text-slate-300 font-semibold">
                  DELIVERY TRAY · ALIGNED
                </span>
              </div>
              <div className="text-[9px] font-mono text-cyan-400 font-bold">
                PRECISION: ±0.05 MM
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CURRENT PRODUCT SPECS & DIRECT ORDER CTA BAR            */}
        {/* ======================================================== */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{currentProduct.name}</span>
              <span className="text-[9px] bg-slate-800 text-cyan-300 px-2 py-0.2 rounded font-medium border border-slate-700">
                {currentProduct.category}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{currentProduct.specs}</div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleActionClick}
              className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-cyan-900/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Customize Specs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRODUCT SELECTOR PILLS (Scene 1 to 7)                   */}
        {/* ======================================================== */}
        <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {products.map((p, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(idx)}
                className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                <span>{p.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust Subtext Beneath Animation */}
      <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          Heidelberg Speedmaster &amp; Roland Tech
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          "Imagine it → We Print it"
        </span>
      </div>
    </div>
  );
};
