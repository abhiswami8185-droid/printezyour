import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronRight,
  RotateCw,
  ArrowUpRight,
  Pause,
  Play,
  Scissors,
  Printer,
  Box,
  ShoppingBag,
  Tag,
  CreditCard,
  FileText,
  BadgeCheck,
  Check,
  ShieldCheck,
  Cpu,
  Eye
} from 'lucide-react';

export interface ManufacturingStep {
  stepNumber: number;
  name: string;
  shortDesc: string;
  machine: string;
  duration: string;
}

export interface RealPrintProduct {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  specs: string;
  material: string;
  finishing: string;
  turnaround: string;
  productSlug: string;
  badge: string;
  naturalColorName: string;
  processSteps: ManufacturingStep[];
  renderProduct: () => React.ReactNode;
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
  const [activeStepIdx, setActiveStepIdx] = useState(3); // active manufacturing step
  const [activeViewMode, setActiveViewMode] = useState<'product' | 'process'>('product');
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Standard 6-stage commercial manufacturing process
  const standardProcess: ManufacturingStep[] = [
    {
      stepNumber: 1,
      name: 'Pre-Press & CTP',
      shortDesc: 'Digital proofing & laser plate imaging',
      machine: 'Screen PlateRite HD',
      duration: '15 Mins'
    },
    {
      stepNumber: 2,
      name: 'CMYK Precision Press',
      shortDesc: 'Multi-cylinder offset & digital deposition',
      machine: 'Heidelberg Speedmaster',
      duration: '45 Mins'
    },
    {
      stepNumber: 3,
      name: 'Thermal Lamination',
      shortDesc: 'Soft-touch velvet & anti-scuff matte barrier',
      machine: 'Autobond Thermal Coater',
      duration: '30 Mins'
    },
    {
      stepNumber: 4,
      name: 'Die-Cut & Crease',
      shortDesc: 'CNC steel-rule die-cutting & micro-perforation',
      machine: 'Bobst VisionCut 106',
      duration: '20 Mins'
    },
    {
      stepNumber: 5,
      name: 'Foil & Spot UV',
      shortDesc: 'Hot-stamp metallic foil & tactile gloss enhancement',
      machine: 'Heidelberg Cylinder Foil',
      duration: '25 Mins'
    },
    {
      stepNumber: 6,
      name: 'QC & Packaging',
      shortDesc: '100% optical inspection, shrink-wrap & dispatch',
      machine: 'Hugo Beck Flowpack',
      duration: '10 Mins'
    }
  ];

  // 8 Authentic Real-World Printed Products Showcase
  const printProducts: RealPrintProduct[] = [
    // 1. Visiting Cards (Gold Foil & Velvet Matte)
    {
      id: 'visiting-cards',
      name: 'Velvet Matte Visiting Cards',
      subtitle: 'Gold Foil Stamping + Spot UV Gloss',
      category: 'Corporate Stationery',
      specs: '350-450 GSM Royal Art Card · 3.5" × 2" Standard',
      material: '400 GSM Super Velvet Cardstock',
      finishing: 'Thermal Velvet + Metallic Gold Hot Foil',
      turnaround: '24-48 Hours',
      productSlug: 'visiting-cards',
      badge: 'Product 1 of 8',
      naturalColorName: 'Obsidian Velvet & Metallic Gold',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Stacked depth effect with cards underneath */}
          <div className="absolute w-[290px] sm:w-[320px] h-[165px] sm:h-[180px] bg-slate-900/90 rounded-xl border border-slate-700/60 shadow-xl rotate-4 translate-y-3 translate-x-2 pointer-events-none" />
          <div className="absolute w-[290px] sm:w-[320px] h-[165px] sm:h-[180px] bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-lg -rotate-2 -translate-y-1 -translate-x-1 pointer-events-none" />

          {/* Primary Top Business Card */}
          <div className="relative w-[290px] sm:w-[320px] h-[165px] sm:h-[180px] rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300 border border-amber-400/30 flex flex-col justify-between p-5 select-none bg-radial from-[#131b26] via-[#0b1017] to-[#06090d]">
            {/* Paper Texture Noise / Velvet sheen overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-amber-500/10 via-transparent to-amber-200/5 pointer-events-none" />
            
            {/* Real Gold Foil Diagonal Sheen Sweep */}
            <motion.div
              className="absolute -inset-full bg-linear-to-r from-transparent via-amber-200/20 to-transparent rotate-25 pointer-events-none"
              animate={prefersReducedMotion ? {} : { x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            />

            {/* Micro Card Edge Thickness Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-amber-300 via-amber-100 to-amber-400 opacity-80" />

            {/* Card Header: Brand Monogram & Company */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-300 via-yellow-400 to-amber-600 p-[1.5px] shadow-md shadow-amber-900/40">
                  <div className="w-full h-full bg-[#0d131c] rounded-[6px] flex items-center justify-center font-serif font-black text-amber-300 text-xs">
                    P
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-black tracking-widest text-amber-200 font-serif">
                    PRINTEZYOUR
                  </div>
                  <div className="text-[7.5px] text-amber-400/80 font-mono tracking-widest uppercase">
                    Commercial Press · Est. 2012
                  </div>
                </div>
              </div>

              {/* Spot UV tactile badge */}
              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 font-semibold tracking-wider">
                400 GSM VELVET
              </span>
            </div>

            {/* Card Body: Executive Persona */}
            <div className="space-y-0.5 relative z-10 my-auto py-1">
              <div className="text-base sm:text-lg font-black tracking-tight text-white font-serif">
                Vikramaditya Sharma
              </div>
              <div className="text-[10px] text-amber-300 font-semibold tracking-wide flex items-center gap-1.5">
                <span>Managing Director</span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-slate-400">Chandigarh</span>
              </div>
            </div>

            {/* Card Footer: Authentic Spot UV & Gilt Finish */}
            <div className="flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-800/80 pt-2 relative z-10 font-mono">
              <span className="text-amber-300 font-bold">+91 85570 49897</span>
              <span className="text-amber-400/70 tracking-widest uppercase">Metallic Foil Stamped</span>
            </div>
          </div>
        </div>
      )
    },

    // 2. Packaging Boxes (Corrugated E-Commerce Mailer Box)
    {
      id: 'packaging-box',
      name: 'Corrugated E-Commerce Mailer Box',
      subtitle: '3-Ply Micro-Flute with Lock-Bottom Flaps',
      category: 'Boxes & Packaging',
      specs: 'Custom Die-Lines · 3-Ply E-Flute / Kraft Paper',
      material: 'Recyclable Bleached SBS + Kraft Core',
      finishing: 'Self-Locking Flaps + Moisture-Resistant Varnish',
      turnaround: '4-6 Business Days',
      productSlug: 'carry-bags',
      badge: 'Product 2 of 8',
      naturalColorName: 'Natural Cardboard & Matte Black Print',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Isometric 3D Box Representation */}
          <div className="relative w-[300px] sm:w-[330px] h-[175px] sm:h-[190px] rounded-xl bg-linear-to-br from-[#f7f2ea] to-[#e4d7c5] text-slate-900 border border-[#c4b39b] shadow-2xl p-4 flex flex-col justify-between overflow-hidden select-none">
            {/* Cardboard Texture and Fluting Edge */}
            <div className="absolute inset-0 bg-[radial-gradient(#c8b598_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-amber-600/10 to-transparent pointer-events-none" />

            {/* Box Header & Structural Stamp */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-900/10 border border-amber-900/20 text-amber-950">
                  <Box className="w-4 h-4 text-amber-900" />
                </div>
                <div>
                  <div className="text-[12px] font-black text-slate-900 uppercase tracking-wide">
                    E-COMMERCE MAILER BOX
                  </div>
                  <div className="text-[8px] text-amber-900 font-mono font-semibold">
                    DIE-CUT #MB-302 · SELF-LOCKING
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[8px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded shadow-xs">
                  100% RECYCLABLE
                </span>
              </div>
            </div>

            {/* Box Center: Structural Crease Simulation & Brand */}
            <div className="my-auto relative z-10 border border-dashed border-amber-900/30 rounded-lg p-2.5 bg-white/60 backdrop-blur-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                  <span>PRINTEZYOUR PACKAGING LAB</span>
                </div>
                <div className="text-[8px] text-slate-600 mt-0.5">
                  Crush-Tested 3-Ply E-Flute Corrugated Core
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[9px] font-black text-slate-900">10" × 8" × 3.5"</div>
                <div className="text-[7.5px] text-slate-500">Fold &amp; Tuck Lid</div>
              </div>
            </div>

            {/* Box Footer: Shipping Barcode & Dispatch Ready */}
            <div className="flex items-center justify-between relative z-10 border-t border-[#cbbca7] pt-2">
              <div className="flex items-center gap-1">
                {/* Simulated Barcode */}
                <div className="flex gap-[1.5px] items-center h-4 bg-slate-900 px-1 rounded-xs">
                  <div className="w-[1px] h-3 bg-white" />
                  <div className="w-[2px] h-3 bg-white" />
                  <div className="w-[1px] h-3 bg-white" />
                  <div className="w-[3px] h-3 bg-white" />
                  <div className="w-[1px] h-3 bg-white" />
                  <div className="w-[2px] h-3 bg-white" />
                </div>
                <span className="text-[7.5px] font-mono text-slate-600">PZ-EXP-2026</span>
              </div>
              <div className="text-[8px] font-semibold text-amber-950 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Heavy Edge Crush Strength</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 3. Branded Kraft Carry Bags
    {
      id: 'carry-bags',
      name: 'Eco-Friendly Kraft Carry Bag',
      subtitle: 'Twisted Rope Handles & Reinforced Gusset',
      category: 'Carry Bags',
      specs: '140 GSM Natural Virgin Brown Kraft · Block Bottom',
      material: '140 GSM High-Tensile Virgin Kraft Paper',
      finishing: 'Twisted Paper Cord Handles + Turnover Top',
      turnaround: '3-5 Business Days',
      productSlug: 'carry-bags',
      badge: 'Product 3 of 8',
      naturalColorName: 'Natural Earthy Brown Kraft',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Carry Bag Wrapper */}
          <div className="relative w-[270px] sm:w-[290px] h-[180px] sm:h-[195px] flex flex-col items-center">
            {/* Twisted Rope Handles Looping Up */}
            <div className="relative -mb-2 z-20 flex gap-12">
              <div className="w-9 h-7 rounded-t-full border-t-[3px] border-x-[3px] border-amber-900/60 shadow-xs" />
              <div className="w-9 h-7 rounded-t-full border-t-[3px] border-x-[3px] border-amber-900/60 shadow-xs" />
            </div>

            {/* Bag Main Body */}
            <div className="w-full flex-1 rounded-t-sm rounded-b-lg bg-linear-to-b from-[#b88c5d] via-[#a87a4c] to-[#93673c] text-amber-950 border border-amber-900/30 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Natural Kraft Horizontal Laid Ribbing */}
              <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,#000,#000_1px,transparent_1px,transparent_4px)] pointer-events-none" />

              {/* Serrated Top Trim Die-Cut */}
              <div className="flex justify-between items-center relative z-10 border-b border-amber-900/20 pb-1.5">
                <span className="text-[8px] font-mono font-bold tracking-widest text-amber-950 uppercase">
                  REINFORCED TURNOVER TOP
                </span>
                <span className="text-[7.5px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                  UP TO 8 KG
                </span>
              </div>

              {/* Front Screen Printed Brand Stamp */}
              <div className="text-center my-auto py-1 relative z-10">
                <div className="inline-block p-1.5 rounded-full border border-amber-950/40 mb-1">
                  <ShoppingBag className="w-4 h-4 text-amber-950 mx-auto" />
                </div>
                <div className="text-sm font-black tracking-wider text-amber-950 font-serif">
                  PRINTEZYOUR RETAIL
                </div>
                <div className="text-[8px] text-amber-950/80 font-medium tracking-wide">
                  Eco-Conscious Packaging · Biodegradable
                </div>
              </div>

              {/* Bottom Gusset Fold Creases */}
              <div className="flex items-center justify-between text-[7.5px] text-amber-950 font-mono border-t border-amber-900/30 pt-1.5 relative z-10">
                <span>12" × 16" × 4" (LARGE)</span>
                <span className="font-bold">140 GSM VIRGIN KRAFT</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 4. Tri-Fold Corporate Brochure
    {
      id: 'brochures',
      name: 'Tri-Fold Corporate Brochure',
      subtitle: 'Precision Dual-Score Folding & High Gloss Coating',
      category: 'Marketing Materials',
      specs: '170 GSM Art Gloss Paper · A4 Open (Tri-Fold to DL)',
      material: '170 GSM European Double-Coated Art Paper',
      finishing: 'Dual Scoring Crease + High Gloss Varnish',
      turnaround: '24-48 Hours',
      productSlug: 'flyers',
      badge: 'Product 4 of 8',
      naturalColorName: 'Vibrant Multi-Panel CMYK Fidelity',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* 3-Panel 3D Folding Perspective */}
          <div className="relative w-[310px] sm:w-[340px] h-[175px] sm:h-[190px] rounded-xl shadow-2xl overflow-hidden flex border border-slate-300 select-none bg-white">
            {/* Panel 1 (Left Flap angled inward) */}
            <div className="w-1/3 bg-[#0f172a] text-white p-3 border-r-2 border-slate-700/80 flex flex-col justify-between relative">
              <div className="space-y-1">
                <span className="text-[7.5px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  PAGE 01
                </span>
                <div className="text-[11px] font-black leading-tight text-white">
                  PRECISION <br />PRINTING
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-1 w-6 bg-cyan-400 rounded-full" />
                <div className="text-[7px] text-slate-400">Heidelberg 4-Color Speedmaster</div>
              </div>
            </div>

            {/* Panel 2 (Center Panel - Flat Display) */}
            <div className="w-1/3 bg-slate-50 text-slate-900 p-3 border-r border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest block">
                  SERVICES
                </span>
                <div className="text-[10px] font-black text-slate-800 mt-0.5">Commercial Press</div>
                <div className="mt-1 space-y-1">
                  <div className="h-1 bg-slate-300 rounded-sm w-full" />
                  <div className="h-1 bg-cyan-200 rounded-sm w-4/5" />
                  <div className="h-1 bg-slate-200 rounded-sm w-3/4" />
                </div>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 p-1 rounded text-[7px] text-cyan-900 font-bold">
                100% Quality Assurance
              </div>
            </div>

            {/* Panel 3 (Right Panel - Accent Color) */}
            <div className="w-1/3 bg-linear-to-br from-blue-600 via-indigo-700 to-cyan-700 text-white p-3 flex flex-col justify-between">
              <div className="text-right">
                <span className="text-[7.5px] font-mono text-cyan-200 font-bold">DL FORMAT</span>
              </div>
              <div>
                <div className="text-[11px] font-black leading-tight">PrintezYour</div>
                <div className="text-[7px] text-blue-100 mt-0.5">Chandigarh Tricity</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 5. Waterproof Vinyl Die-Cut Stickers
    {
      id: 'stickers',
      name: 'Waterproof Die-Cut Vinyl Stickers',
      subtitle: 'Contour Kiss-Cut + Peeling Tab Demonstration',
      category: 'Stickers & Labels',
      specs: '120 Micron PVC Vinyl · Outdoor Grade UV Resistant',
      material: 'Waterproof White Gloss Vinyl with Silicone Liner',
      finishing: 'Precision Computerized Kiss-Cut Contour',
      turnaround: '2 Business Days',
      productSlug: 'stickers',
      badge: 'Product 5 of 8',
      naturalColorName: 'Multi-Color Vinyl with Yellow Silicone Release Backing',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Sticker Sheet Background */}
          <div className="relative w-[300px] sm:w-[330px] h-[175px] sm:h-[190px] rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-4 flex flex-col justify-between overflow-hidden select-none">
            {/* Sheet Header */}
            <div className="flex justify-between items-center relative z-10 border-b border-slate-800 pb-1.5">
              <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                PRECISION KISS-CUT SHEET
              </span>
              <span className="text-[7.5px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800/60">
                100% WATERPROOF
              </span>
            </div>

            {/* 4 Die-Cut Decals Demonstration */}
            <div className="grid grid-cols-2 gap-2.5 my-auto relative z-10">
              {/* Sticker 1: With Corner Peeled Showing Yellow Liner */}
              <div className="relative bg-emerald-600 rounded-xl p-2.5 text-white shadow-md overflow-hidden">
                {/* Yellow Peel Corner */}
                <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-300 shadow-md rotate-45 translate-x-3 -translate-y-3" />
                <div className="text-[10px] font-black uppercase">ORGANIC COFFEE</div>
                <div className="text-[7.5px] text-emerald-100">Water &amp; Oil Resistant</div>
              </div>

              {/* Sticker 2: Round Circular Die-Cut */}
              <div className="bg-linear-to-r from-amber-500 to-orange-600 rounded-full p-2.5 text-white text-center shadow-md flex flex-col items-center justify-center">
                <div className="text-[9px] font-black">QUALITY SEAL</div>
                <div className="text-[7px] text-amber-100 font-mono">BATCH #2026</div>
              </div>

              {/* Sticker 3: Hexagonal Crest */}
              <div className="bg-slate-950 border border-cyan-500/50 rounded-lg p-2.5 text-center shadow-xs">
                <div className="text-[9px] font-black text-cyan-400">PRINTEZYOUR</div>
                <div className="text-[7px] text-slate-400">Holographic Base</div>
              </div>

              {/* Sticker 4: Bottle Label with Droplet Look */}
              <div className="bg-blue-600 rounded-xl p-2.5 text-white shadow-md">
                <div className="text-[10px] font-black">CHILLED BEVERAGE</div>
                <div className="text-[7px] text-blue-100">Deep-Freeze Grade</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-t border-slate-800 pt-1.5 relative z-10 font-mono">
              <span>Roll &amp; Sheet Formats Available</span>
              <span className="text-cyan-300 font-bold">Scratchproof Vinyl</span>
            </div>
          </div>
        </div>
      )
    },

    // 6. Heavy-Duty Star Flex Banner
    {
      id: 'flex-banner',
      name: 'High-Resolution Star Flex Banner',
      subtitle: 'Brass Eyelets + Welded Hemming for Outdoor Use',
      category: 'Flex & Banner Printing',
      specs: '340 GSM Heavy-Duty Star Flex · 10ft Seamless Width',
      material: '340 GSM Woven Fiber Reinforced PVC Flex',
      finishing: 'High-Frequency Welded Hems + Heavy Brass Eyelets',
      turnaround: 'Same Day to 24 Hours',
      productSlug: 'flex-banners',
      badge: 'Product 6 of 8',
      naturalColorName: 'High-Contrast Solvent Graphics & Brass Eyelets',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Banner Graphic with Grommets */}
          <div className="relative w-[300px] sm:w-[330px] h-[175px] sm:h-[190px] rounded-lg bg-linear-to-r from-red-600 via-rose-700 to-amber-600 text-white p-3.5 shadow-2xl border-2 border-amber-300/40 flex flex-col justify-between overflow-hidden select-none">
            {/* 4 Golden Brass Corner Eyelets / Grommets */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full border-2 border-amber-300 bg-slate-900 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
            <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-amber-300 bg-slate-900 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full border-2 border-amber-300 bg-slate-900 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-amber-300 bg-slate-900 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            {/* Banner Header */}
            <div className="flex items-center justify-between px-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-200">
                OUTDOOR HOARDING PRINT
              </span>
              <span className="text-[7.5px] bg-black/40 text-white px-2 py-0.5 rounded font-mono font-bold">
                UV 3-YEAR RATED
              </span>
            </div>

            {/* Banner Center Headline */}
            <div className="text-center px-2 py-1 my-auto">
              <div className="text-base sm:text-xl font-black uppercase tracking-tight leading-none text-white drop-shadow-md">
                CHANDIGARH GRAND EXPO 2026
              </div>
              <div className="text-[9px] text-amber-100 font-bold mt-1">
                SECTOR 17 EXHIBITION GROUND · ENTRY FREE
              </div>
            </div>

            {/* Banner Footer Registration Marks */}
            <div className="flex items-center justify-between px-3 text-[7px] text-amber-200/90 font-mono border-t border-white/20 pt-1">
              <span>WELDED PERIMETER HEM</span>
              <span>HEAVY-DUTY STAR FLEX</span>
            </div>
          </div>
        </div>
      )
    },

    // 7. Product Hang Tags / Apparel Tags
    {
      id: 'hang-tags',
      name: 'Custom Apparel Hang Tags',
      subtitle: 'Metallic Eyelet + Cotton Twine Cord',
      category: 'Tags / Hanging Tags',
      specs: '400 GSM Duplex Linen Board · Die-Cut Corner Chamfers',
      material: '400 GSM Natural Ivory Textured Linen Board',
      finishing: 'Brass Eyelet + Cotton String Loop + Debossed Logo',
      turnaround: '2-3 Business Days',
      productSlug: 'products',
      badge: 'Product 7 of 8',
      naturalColorName: 'Textured Ivory Card & Matte Black Waxed Cord',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Garment Tag with String */}
          <div className="relative w-[180px] sm:w-[200px] h-[180px] sm:h-[195px] flex flex-col items-center">
            {/* Hanging String Loop */}
            <div className="w-1.5 h-8 border-l-2 border-dashed border-slate-400 -mb-1" />

            {/* Tag Body */}
            <div className="w-full flex-1 rounded-lg bg-[#fdfbf7] text-slate-900 border border-slate-300 shadow-2xl p-3.5 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Brass Eyelet Hole at top */}
              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 bg-amber-100 mx-auto flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              {/* Tag Center Branding */}
              <div className="text-center my-auto py-1">
                <div className="text-xs font-black tracking-widest uppercase font-serif text-slate-900">
                  HERITAGE ATELIER
                </div>
                <div className="text-[7.5px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
                  HANDCRAFTED APPAREL
                </div>
                <div className="mt-2 inline-block px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-bold">
                  SIZE: L (42)
                </div>
              </div>

              {/* Perforated Price Tag Section */}
              <div className="border-t border-dashed border-slate-400 pt-1.5 text-center">
                <div className="text-[7px] text-slate-400 font-mono">MRP (INCL. ALL TAXES)</div>
                <div className="text-[10px] font-mono font-black text-slate-900">₹2,499.00</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // 8. PVC Smart ID Cards & Lanyards
    {
      id: 'id-cards',
      name: 'PVC Staff ID Card with Lanyard',
      subtitle: 'Waterproof Plastic CR-80 + Custom Sublimation Strap',
      category: 'ID Cards',
      specs: 'CR-80 Standard Credit Card Dimensions · 30 Mil PVC',
      material: 'Waterproof Solid Core CR-80 PVC Plastic',
      finishing: 'Photo-Quality Sublimation + Clear Polycarbonate Clip',
      turnaround: '24-48 Hours',
      productSlug: 'products',
      badge: 'Product 8 of 8',
      naturalColorName: 'Glossy White PVC & Royal Blue Satin Ribbon',
      processSteps: standardProcess,
      renderProduct: () => (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          {/* Card with Lanyard */}
          <div className="relative w-[210px] sm:w-[230px] h-[180px] sm:h-[195px] flex flex-col items-center">
            {/* Blue Lanyard Strap Coming In */}
            <div className="w-10 h-6 bg-blue-700 text-[6px] text-blue-100 font-bold flex items-center justify-center tracking-widest uppercase rounded-t-sm shadow-xs">
              PRINTEZ
            </div>
            {/* Metal Bulldog Badge Clip */}
            <div className="w-6 h-3 bg-linear-to-b from-slate-400 to-slate-600 rounded-sm -mb-1 z-20 shadow-sm" />

            {/* CR80 PVC ID Card */}
            <div className="w-full flex-1 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Gloss Reflection Bar */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-linear-to-bl from-blue-500/10 to-transparent pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-blue-700 flex items-center justify-center text-white text-[9px] font-black">
                    P
                  </div>
                  <span className="text-[9px] font-black text-slate-800 tracking-wide">PRINTEZYOUR</span>
                </div>
                <span className="text-[7px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  STAFF ID
                </span>
              </div>

              {/* Photo & Bio */}
              <div className="flex items-center gap-2.5 my-auto py-1">
                <div className="w-10 h-12 bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold">
                  PHOTO
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-900 leading-tight">Neha Verma</div>
                  <div className="text-[7.5px] text-slate-500 font-medium">Head of Quality Control</div>
                  <div className="text-[7px] font-mono text-blue-700">ID: PZ-EMP-0418</div>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[7px] font-mono text-slate-500">
                <span>SECURITY CHIP ENABLED</span>
                <span className="font-bold text-slate-800">VALID 2026</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Auto-Cycle timer across 8 products
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % printProducts.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, prefersReducedMotion, printProducts.length]);

  // Step indicator sub-cycle to demonstrate live factory progression
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    stepTimerRef.current = setInterval(() => {
      setActiveStepIdx(prev => (prev + 1) % standardProcess.length);
    }, 1800);

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isPaused, prefersReducedMotion, standardProcess.length]);

  const currentProduct = printProducts[currentIdx];

  const handleSelectProduct = (idx: number) => {
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

      {/* Main Showcase Enclosure */}
      <div className="relative w-full bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-slate-950/80 overflow-hidden">
        
        {/* ======================================================== */}
        {/* 1. STAGE HEADER: LIVE FACTORY TELEMETRY & CONTROLS      */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white flex items-center gap-2">
                <span>PRINTEZYOUR COMMERCIAL PRESS</span>
                <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.2 rounded-full font-semibold">
                  LIVE WORKSHOP SHOWCASE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Heidelberg Speedmaster &amp; Roland Pro 4K Active
              </div>
            </div>
          </div>

          {/* View Mode Toggle: 3D Product vs Factory Process */}
          <div className="flex items-center gap-1.5">
            <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveViewMode('product')}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeViewMode === 'product'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View 3D Real Product"
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Product</span>
              </button>
              <button
                onClick={() => setActiveViewMode('process')}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeViewMode === 'process'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View 6 Manufacturing Steps"
              >
                <Cpu className="w-3 h-3" />
                <span className="hidden sm:inline">Process</span>
              </button>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title={isPaused ? 'Resume printing loop' : 'Pause printing loop'}
              aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. THE 6-STAGE PRINTING PROCESS TRACKER                  */}
        {/* ======================================================== */}
        <div className="mb-3 bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-2 px-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Printer className="w-3 h-3 text-cyan-400" />
              <span>MANUFACTURING PIPELINE:</span>
            </span>
            <span className="text-cyan-400 font-semibold">
              Stage {activeStepIdx + 1}/6: {standardProcess[activeStepIdx].name}
            </span>
          </div>

          {/* Stepper Dots & Labels */}
          <div className="grid grid-cols-6 gap-1 sm:gap-1.5 text-center">
            {standardProcess.map((step, sIdx) => {
              const isActive = sIdx === activeStepIdx;
              const isPassed = sIdx < activeStepIdx;
              return (
                <button
                  key={step.stepNumber}
                  onClick={() => setActiveStepIdx(sIdx)}
                  className={`p-1 rounded-md text-[8.5px] transition-all flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-xs'
                      : isPassed
                      ? 'bg-slate-800/60 text-slate-300 border border-slate-700/60'
                      : 'bg-slate-950/40 text-slate-500 border border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? 'bg-cyan-400 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-400'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-mono font-bold text-[7.5px]">0{step.stepNumber}</span>
                  </div>
                  <span className="truncate w-full font-medium leading-none hidden sm:block">
                    {step.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN STAGE: REALISTIC 3D PRODUCT OR FACTORY PROCESS   */}
        {/* ======================================================== */}
        <div className="relative w-full h-[260px] sm:h-[285px] rounded-xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-800/90 overflow-hidden flex flex-col justify-between p-2 sm:p-3">
          
          {/* Upper Machine Roller Hood with CMYK Ink Wells */}
          <div className="relative w-full z-20 flex items-center justify-between px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800/90 text-slate-300 text-[9px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                {currentProduct.naturalColorName}
              </span>
            </div>

            {/* CMYK Real Ink Level Gauges */}
            <div className="flex items-center gap-1.5">
              <span className="text-[7.5px] text-slate-400 uppercase font-semibold hidden sm:inline">
                CMYK Inks:
              </span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" title="Cyan 100%" />
                <span className="w-2 h-2 rounded-full bg-pink-500 shadow-xs shadow-pink-500/50" title="Magenta 100%" />
                <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-xs shadow-yellow-400/50" title="Yellow 100%" />
                <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-600" title="Black 100%" />
              </div>
            </div>
          </div>

          {/* Center Stage: The Live Product Emergence or Process Breakdown */}
          <div className="relative flex-1 flex items-center justify-center py-1 z-10">
            {activeViewMode === 'product' ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProduct.id}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : {
                          y: -25,
                          opacity: 0,
                          scale: 0.95,
                          rotateX: 12
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
                          y: 25,
                          opacity: 0,
                          scale: 0.96,
                          rotateX: -8
                        }
                  }
                  transition={{
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="w-full h-full cursor-pointer flex items-center justify-center"
                  onClick={handleActionClick}
                  title={`Click to customize and order ${currentProduct.name}`}
                >
                  {currentProduct.renderProduct()}
                </motion.div>
              </AnimatePresence>
            ) : (
              /* Factory Process Diagnostic View */
              <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-950/90 rounded-xl border border-slate-800 text-white select-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      STAGE 0{standardProcess[activeStepIdx].stepNumber} INSPECTION
                    </span>
                    <div className="text-sm font-black text-white mt-0.5">
                      {standardProcess[activeStepIdx].name}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-semibold">
                    {standardProcess[activeStepIdx].machine}
                  </span>
                </div>

                <div className="space-y-2 my-auto py-2 text-xs">
                  <div className="text-slate-300 font-medium">
                    {standardProcess[activeStepIdx].shortDesc}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[8px]">SUBSTRATE</span>
                      <span className="text-white font-bold">{currentProduct.material}</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[8px]">TOLERANCE</span>
                      <span className="text-cyan-300 font-bold">±0.05 mm Optical</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[9px] font-mono text-slate-400">
                  <span>Cycle Duration: {standardProcess[activeStepIdx].duration}</span>
                  <button
                    onClick={() => setActiveViewMode('product')}
                    className="text-cyan-400 font-bold hover:underline"
                  >
                    View Resulting Product &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lower Machine Delivery Tray */}
          <div className="relative w-full z-20 flex items-center justify-between px-3 py-1 bg-slate-900/90 rounded-lg border border-slate-800/90 text-slate-400 text-[9px] font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-semibold">100% Quality Inspected</span>
            </div>
            <div className="text-cyan-300 font-bold">
              Dispatch: Chandigarh Tricity &amp; Pan-India
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. CURRENT PRODUCT SPECS & DIRECT ORDER CTA BAR         */}
        {/* ======================================================== */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">{currentProduct.name}</span>
              <span className="text-[8.5px] bg-slate-800 text-cyan-300 px-2 py-0.2 rounded font-semibold border border-slate-700">
                {currentProduct.category}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              {currentProduct.specs}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleActionClick}
              className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Customize Specs &amp; Order</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. PRODUCT SELECTOR PILLS (8 REAL PRODUCTS)              */}
        {/* ======================================================== */}
        <div className="mt-3 pt-2 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {printProducts.map((p, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(idx)}
                className={`text-[9.5px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
      <div className="mt-2.5 flex items-center justify-center gap-3 text-[10.5px] text-slate-400 font-medium">
        <span className="flex items-center gap-1 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real Factory Offset &amp; UV Finishes</span>
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>No Generic Templates · 100% Bespoke</span>
        </span>
      </div>
    </div>
  );
};
