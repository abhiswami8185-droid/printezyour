import { Category, ServiceItem, Product, BusinessSettings } from '../types';

/**
 * Clean, public-only fallback data for the PrintezYour storefront.
 * This file contains ONLY public catalog items (categories, services, products, and contact details).
 * It contains ZERO user credentials, ZERO passwords, ZERO customer orders, and ZERO internal database secrets.
 * This is used exclusively as a graceful fallback when the backend API is unreachable (e.g. static GitHub Pages hosting).
 */

export const fallbackCategories: Category[] = [
  { id: 'cat-1', name: 'Visiting Cards', slug: 'visiting-cards', description: 'Premium business cards with matte, gloss, velvet, and spot UV finishes', displayOrder: 1, active: true },
  { id: 'cat-2', name: 'Stickers & Labels', slug: 'stickers-labels', description: 'Custom die-cut stickers, waterproof vinyl labels, barcode & product tags', displayOrder: 2, active: true },
  { id: 'cat-3', name: 'Flex & Banner Printing', slug: 'flex-banner', description: 'High-resolution outdoor star flex, frontlit & backlit banners for events & hoardings', displayOrder: 3, active: true },
  { id: 'cat-4', name: 'Carry Bags', slug: 'carry-bags', description: 'Eco-friendly paper bags, D-cut non-woven, and branded retail shopping bags', displayOrder: 4, active: true },
  { id: 'cat-5', name: 'Butter Paper Printing', slug: 'butter-paper', description: 'Food-grade oil-resistant custom printed butter paper for bakeries & restaurants', displayOrder: 5, active: true },
  { id: 'cat-6', name: 'Customized Printing', slug: 'customized-printing', description: 'Mugs, t-shirts, keychains, custom gifts, and bespoke personalized merchandise', displayOrder: 6, active: true },
  { id: 'cat-7', name: 'Sunboard Printing', slug: 'sunboard-printing', description: 'Direct UV print & vinyl mounted rigid foam sunboards for displays and exhibitions', displayOrder: 7, active: true },
  { id: 'cat-8', name: 'Pen Printing', slug: 'pen-printing', description: 'Corporate metal & plastic pens engraved or screen-printed with brand logos', displayOrder: 8, active: true },
  { id: 'cat-9', name: 'Boxes & Packaging', slug: 'boxes-packaging', description: 'Rigid gift boxes, mono cartons, corrugated shipping boxes with custom branding', displayOrder: 9, active: true },
  { id: 'cat-10', name: 'Pamphlets / Flyers', slug: 'pamphlets-flyers', description: 'High-volume promotional leaflets, trifold brochures, and newspaper inserts', displayOrder: 10, active: true },
  { id: 'cat-11', name: 'E-commerce Packaging', slug: 'ecommerce-packaging', description: 'Security courier bags, branded shipping mailers, and custom packaging tapes', displayOrder: 11, active: true },
  { id: 'cat-12', name: 'Tags / Hanging Tags', slug: 'hanging-tags', description: 'Apparel hang tags, barcode price tags, metallic string tags with eyelets', displayOrder: 12, active: true },
  { id: 'cat-13', name: 'Letterheads', slug: 'letterheads', description: 'Executive bond paper letterheads for official corporate correspondence', displayOrder: 13, active: true },
  { id: 'cat-14', name: 'Envelopes', slug: 'envelopes', description: 'Custom printed window & non-window business envelopes in all standard sizes', displayOrder: 14, active: true },
  { id: 'cat-15', name: 'ID Cards', slug: 'id-cards', description: 'Durable PVC RFID/barcode smart ID cards, printed lanyards, and card holders', displayOrder: 15, active: true },
  { id: 'cat-16', name: 'Legal Documents', slug: 'legal-documents', description: 'Non-tearable bond sheets, stamp paper binding, legal briefs, and dossier folders', displayOrder: 16, active: true },
  { id: 'cat-17', name: 'Corporate Printing', slug: 'corporate-printing', description: 'Annual reports, presentation folders, certificates, executive desk diaries', displayOrder: 17, active: true },
  { id: 'cat-18', name: 'Customized Branding', slug: 'customized-branding', description: 'Complete brand collateral setups: uniforms, signages, stationery sets', displayOrder: 18, active: true },
  { id: 'cat-19', name: 'Promotional Printing', slug: 'promotional-printing', description: 'Tent cards, danglers, roll-up standees, canopies, and promotional flags', displayOrder: 19, active: true },
  { id: 'cat-20', name: 'Specialty Finishing', slug: 'specialty-finishing', description: 'Foil stamping, thermal embossing, spot gloss, rounded die-cutting', displayOrder: 20, active: true }
];

export const fallbackServices: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Visiting Cards & Business Cards',
    slug: 'visiting-cards',
    category: 'Visiting Cards',
    shortDesc: 'Single & double sided premium business cards on 350 GSM to 450 GSM cardstock.',
    fullDesc: 'First impressions make or break business deals. Our visiting card service delivers precision-cut cards with vibrant offset and digital printing. Choose from velvet matte, high gloss, spot UV, golden/silver foil embossing, and metallic finishes.',
    features: ['350-450 GSM Art Board', 'Matte / Gloss / Soft Touch Velvet', 'Spot UV & Gold Foil Stamping', 'Standard & Square formats', 'Rounded Corner Die-cuts'],
    materialsAvailable: ['350 GSM Imported Art Card', '400 GSM Super Velvet Card', 'Non-Tearable Synthetic Sheet', 'Metallic & Kraft Textured Board'],
    typicalTurnaround: '24-48 Hours',
    imageUrl: '/images/services/visiting-cards.jpg',
    active: true,
    displayOrder: 1
  },
  {
    id: 'srv-2',
    name: 'Stickers, Decals & Product Labels',
    slug: 'stickers-labels',
    category: 'Stickers & Labels',
    shortDesc: 'Waterproof vinyl, chrome foil, and paper stickers custom die-cut to any shape.',
    fullDesc: 'Elevate your product packaging with industrial-grade labels and stickers. We produce water-resistant, smudge-proof, and oil-proof stickers ideal for jars, bottles, food containers, cosmetics, and electronics.',
    features: ['Custom Kiss-Cut & Die-Cut Shapes', 'Waterproof Outdoor Vinyl', 'Transparent / Clear Foil Base', 'Gold / Silver Chrome Metallic', 'Roll & Sheet Formats'],
    materialsAvailable: ['Self-Adhesive Paper', 'White Gloss PVC Vinyl', 'Matte Transparent Vinyl', 'Holographic Anti-Counterfeit Sheet'],
    typicalTurnaround: '2-3 Business Days',
    imageUrl: '/images/services/stickers-labels.jpg',
    active: true,
    displayOrder: 2
  },
  {
    id: 'srv-3',
    name: 'Flex & Banner Printing',
    slug: 'flex-banner',
    category: 'Flex & Banner Printing',
    shortDesc: 'Large-format solvent & eco-solvent banners for outdoor billboards, events, and shop fronts.',
    fullDesc: 'Weather-resistant large-format printing engineered for high durability in Indian conditions. From standard frontlit flex to heavy-duty star flex, backlit banners for lightboxes, and blackout media for double-sided display.',
    features: ['Star Flex & Normal Flex options', 'Eyelets, hems & pole pockets included', 'Vivid UV-resistant inks (up to 3 years outdoor)', 'Seamless widths up to 10 feet wide', 'Fast same-day turnaround available'],
    materialsAvailable: ['280 GSM Standard Flex', '340 GSM Star Flex (Heavy Duty)', 'Backlit Glow-Sign Media', 'Blackout Vinyl Banner'],
    typicalTurnaround: 'Same Day to 24 Hours',
    imageUrl: '/images/services/flex-banner.jpg',
    active: true,
    displayOrder: 3
  },
  {
    id: 'srv-4',
    name: 'Branded Carry Bags & Packaging Bags',
    slug: 'carry-bags',
    category: 'Carry Bags',
    shortDesc: 'Custom printed paper bags, Kraft carry bags, and cloth bags with durable handles.',
    fullDesc: 'Reinforce your retail identity with branded carry bags. Manufactured from virgin craft paper, recycled duplex board, and non-woven fabric. Available with rope handles, ribbon handles, or punched handles.',
    features: ['Eco-friendly recyclable papers', 'Reinforced base and turnover tops', 'Multi-color flexographic or screen print', 'Custom sizing tailored to your boxes', 'Durable weight capacity up to 10kg'],
    materialsAvailable: ['Brown & White Kraft Paper', 'Bleached Duplex Cardboard', 'Laminated Art Paper', 'Cotton Canvas Fabric'],
    typicalTurnaround: '4-6 Business Days',
    imageUrl: '/images/services/carry-bags.jpg',
    active: true,
    displayOrder: 4
  },
  {
    id: 'srv-5',
    name: 'Butter Paper & Food Wrap Printing',
    slug: 'butter-paper',
    category: 'Butter Paper Printing',
    shortDesc: '100% food-grade, greaseproof printed butter paper for bakeries, burger joints, and cafes.',
    fullDesc: 'Certified food-grade wrapper sheets printed with vegetable-based non-toxic inks. Perfect for lining burger baskets, wrapping pastries, sandwiches, and pastry boxes.',
    features: ['US-FDA approved food-grade inks', 'Greaseproof & heat resistant', 'Custom sheet cut or continuous roll', 'Single color & full color branding', 'Moisture resistant'],
    materialsAvailable: ['38 GSM Virgin Greaseproof Paper', '42 GSM Translucent Butter Paper'],
    typicalTurnaround: '3-4 Business Days',
    imageUrl: '/images/services/butter-paper.jpg',
    active: true,
    displayOrder: 5
  },
  {
    id: 'srv-6',
    name: 'Sunboard & Foam Board Printing',
    slug: 'sunboard-printing',
    category: 'Sunboard Printing',
    shortDesc: 'Direct flatbed UV printing and vinyl mounted 3mm & 5mm rigid sunboards.',
    fullDesc: 'Rigid, lightweight, and warp-resistant boards widely used for indoor menu boards, exhibition booths, promotional displays, directional signages, and retail wall branding.',
    features: ['High-density rigid PVC foam', 'Direct UV ink cure or vinyl wrap', 'Precision edge trimming', 'Matte or gloss lamination surface', 'Double-sided tape ready for wall mounting'],
    materialsAvailable: ['3mm Rigid Sunboard', '5mm Heavy Duty Sunboard', 'Clear Acrylic sheet'],
    typicalTurnaround: '24-48 Hours',
    imageUrl: '/images/services/sunboard-printing.jpg',
    active: true,
    displayOrder: 6
  },
  {
    id: 'srv-7',
    name: 'Boxes, Cartons & Custom Packaging',
    slug: 'boxes-packaging',
    category: 'Boxes & Packaging',
    shortDesc: 'Mono cartons, corrugated mailer boxes, and luxury gift boxes with custom die-cutting.',
    fullDesc: 'Complete packaging solutions for D2C brands, pharmaceutical, cosmetics, electronics, and sweets. We engineer functional die-lines, structural mockups, and high-impact finishes that protect your goods and impress customers.',
    features: ['Custom structural die-line design', 'Corrugated E-flute / B-flute / 3-ply', 'Gold foiling & spot UV gloss', 'Self-locking tuck top boxes', 'Eco-friendly water-based coatings'],
    materialsAvailable: ['300-450 GSM Cyber Premium Board', '3-Ply Corrugated Micro-Flute', 'Greyboard with pasted art sheet', 'Food-grade Virgin SBS Board'],
    typicalTurnaround: '5-8 Business Days',
    imageUrl: '/images/services/boxes-packaging.jpg',
    active: true,
    displayOrder: 7
  },
  {
    id: 'srv-8',
    name: 'Pamphlets, Flyers & Brochures',
    slug: 'pamphlets-flyers',
    category: 'Pamphlets / Flyers',
    shortDesc: 'Crisp, vibrant flyers and bi-fold/tri-fold brochures on premium gloss and matte papers.',
    fullDesc: 'Distribute your marketing message across Chandigarh and North India with crisp flyer printing. Perfect for real estate launches, coaching academies, restaurant menus, retail discounts, and hospital promotions.',
    features: ['Available in A4, A5, A6 & DL formats', '100 GSM, 130 GSM, 170 GSM papers', 'Bi-fold, tri-fold & gate-fold folding', 'Crisp micro-type text reproduction', 'Bulk discounts for 5000+ quantities'],
    materialsAvailable: ['100 GSM Maplitho Paper', '130 GSM Art Paper Gloss', '170 GSM Matte Coated Paper', '300 GSM Heavy Flyer Card'],
    typicalTurnaround: '24-48 Hours',
    imageUrl: '/images/services/pamphlets-flyers.jpg',
    active: true,
    displayOrder: 8
  },
  {
    id: 'srv-9',
    name: 'Custom Promotional Pen Printing',
    slug: 'pen-printing',
    category: 'Pen Printing',
    shortDesc: 'Laser engraved metal pens and pad-printed corporate plastic pens with brand logos.',
    fullDesc: 'A timeless, high-retention corporate gift. We print or laser-engrave your business name, phone number, and logo on metal and stylish plastic ballpoint pens.',
    features: ['Precision laser engraving or color pad print', 'Smooth German-technology ball ink', 'Gift boxes and velvet pouches available', 'Executive metallic matte finishes', 'Low minimums starting at 50 units'],
    materialsAvailable: ['Anodized Matte Metal', 'Soft Touch Rubberized Barrel', 'Eco-friendly Bamboo Pen', 'High-Gloss Plastic'],
    typicalTurnaround: '2-4 Business Days',
    imageUrl: '/images/services/pen-printing.jpg',
    active: true,
    displayOrder: 9
  },
  {
    id: 'srv-10',
    name: 'Custom Apparel & Merchandise',
    slug: 'customized-printing',
    category: 'Customized Printing',
    shortDesc: 'Custom printed ceramic mugs, polo t-shirts, keychains, and employee welcome kits.',
    fullDesc: 'Build company culture and customer loyalty with customized merchandise. Sublimation printing, DTF (direct-to-film) garment printing, and screen printing with sharp color reproduction.',
    features: ['Dishwasher-safe ceramic mug sublimation', 'Breathable cotton and poly-dryfit fabrics', 'Vivid colors with high wash fastness', 'Personalized names & employee IDs', 'Gift combo packaging'],
    materialsAvailable: ['Ceramic White & Magic Mug', '100% Combed Cotton 220 GSM', 'Acrylic & Leatherette Keyrings'],
    typicalTurnaround: '2-4 Business Days',
    imageUrl: '/images/services/custom-apparel.jpg',
    active: true,
    displayOrder: 10
  }
];

export const fallbackProducts: Product[] = [
  {
    id: 'prod-vc-01',
    name: 'Premium Matte Laminated Visiting Cards',
    slug: 'premium-matte-visiting-cards',
    category: 'Visiting Cards',
    categoryId: 'cat-1',
    shortDescription: 'Classic velvety matte finish on 350 GSM imported art board. Scratch resistant and elegant.',
    description: 'Our most popular business card in Chandigarh. High-definition offset printing with a smooth matte lamination on both sides gives a prestigious, glare-free aesthetic. Ideal for founders, corporate executives, doctors, and lawyers.',
    images: [
      '/images/products/visiting-cards-matte.jpg',
      '/images/products/visiting-cards-velvet.jpg'
    ],
    basePrice: 450,
    priceType: 'quantity_tiered',
    minQuantity: 100,
    quantityTiers: [
      { minQty: 100, unitPrice: 4.5 },
      { minQty: 250, unitPrice: 3.6 },
      { minQty: 500, unitPrice: 2.5 },
      { minQty: 1000, unitPrice: 1.8 },
      { minQty: 2000, unitPrice: 1.4 }
    ],
    options: [
      {
        id: 'opt-print-side',
        name: 'Printing Sides',
        type: 'radio',
        values: [
          { id: 'side-single', name: 'Front Side Only', priceModifier: 0, isDefault: true },
          { id: 'side-double', name: 'Front & Back Printing', priceModifier: 150 }
        ]
      },
      {
        id: 'opt-corners',
        name: 'Corner Style',
        type: 'radio',
        values: [
          { id: 'corner-standard', name: 'Standard Square Cut', priceModifier: 0, isDefault: true },
          { id: 'corner-round', name: 'Rounded Corners (Die Cut)', priceModifier: 100 }
        ]
      },
      {
        id: 'opt-finish',
        name: 'Premium Finishing',
        type: 'select',
        values: [
          { id: 'fin-matte', name: 'Thermal Matte Lamination', priceModifier: 0, isDefault: true },
          { id: 'fin-gloss', name: 'High Gloss Lamination', priceModifier: 0 },
          { id: 'fin-spot-uv', name: 'Selective Spot UV Gloss (Requires 500+ qty)', priceModifier: 400 },
          { id: 'fin-gold-foil', name: 'Golden Foil Stamping (Logo/Text)', priceModifier: 600 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '24-48 Hours',
    deliveryInfo: 'Fast dispatch across Chandigarh Tricity (Same day delivery available) and Pan-India courier.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-vc-02',
    name: 'Velvet Soft-Touch Business Cards',
    slug: 'velvet-soft-touch-cards',
    category: 'Visiting Cards',
    categoryId: 'cat-1',
    shortDescription: 'Ultra-luxurious peach-fuzz velvet lamination on heavy 400 GSM cardstock.',
    description: 'Designed for brands where sensory touch matters. The smooth suede texture creates an undeniable impression of luxury and prestige. Resistant to moisture and fingerprint smudges.',
    images: [
      '/images/products/visiting-cards-velvet.jpg',
      '/images/products/visiting-cards-matte.jpg'
    ],
    basePrice: 850,
    priceType: 'quantity_tiered',
    minQuantity: 200,
    quantityTiers: [
      { minQty: 200, unitPrice: 4.25 },
      { minQty: 500, unitPrice: 3.4 },
      { minQty: 1000, unitPrice: 2.8 }
    ],
    options: [
      {
        id: 'opt-sides',
        name: 'Sides',
        type: 'radio',
        values: [
          { id: 'vs-double', name: 'Both Sides Printed', priceModifier: 0, isDefault: true }
        ]
      },
      {
        id: 'opt-foil',
        name: 'Foil Enhancement',
        type: 'select',
        values: [
          { id: 'foil-none', name: 'Standard Velvet (No Foil)', priceModifier: 0, isDefault: true },
          { id: 'foil-gold', name: 'Metallic Gold Foil', priceModifier: 550 },
          { id: 'foil-silver', name: 'Chrome Silver Foil', priceModifier: 550 },
          { id: 'foil-rosegold', name: 'Rose Gold Foil', priceModifier: 650 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '3-4 Business Days',
    deliveryInfo: 'Packed in sturdy transparent acrylic card boxes.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-stk-01',
    name: 'Custom Die-Cut Vinyl Stickers',
    slug: 'custom-die-cut-vinyl-stickers',
    category: 'Stickers & Labels',
    categoryId: 'cat-2',
    shortDescription: 'Waterproof, tear-proof, UV-resistant vinyl stickers cut precisely to your artwork outline.',
    description: 'Showcase your brand on laptops, bottles, cars, packaging boxes, and mobile covers. Printed on premium German white vinyl with a protective matte or glossy finish.',
    images: [
      '/images/products/die-cut-stickers.jpg'
    ],
    basePrice: 500,
    priceType: 'quantity_tiered',
    minQuantity: 100,
    quantityTiers: [
      { minQty: 100, unitPrice: 5.0 },
      { minQty: 250, unitPrice: 3.8 },
      { minQty: 500, unitPrice: 2.9 },
      { minQty: 1000, unitPrice: 2.1 }
    ],
    options: [
      {
        id: 'opt-size',
        name: 'Sticker Size',
        type: 'select',
        values: [
          { id: 'sz-2in', name: '2 x 2 Inches (Compact)', priceModifier: 0, isDefault: true },
          { id: 'sz-3in', name: '3 x 3 Inches (Standard)', priceModifier: 150 },
          { id: 'sz-4in', name: '4 x 4 Inches (Large)', priceModifier: 320 }
        ]
      },
      {
        id: 'opt-vinyl-finish',
        name: 'Finish Type',
        type: 'radio',
        values: [
          { id: 'vf-matte', name: 'Matte Vinyl', priceModifier: 0, isDefault: true },
          { id: 'vf-gloss', name: 'Gloss Waterproof Vinyl', priceModifier: 50 },
          { id: 'vf-clear', name: 'Clear Transparent Vinyl', priceModifier: 100 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '2 Business Days',
    deliveryInfo: 'Delivered in individual die-cut pieces or easy-peel kiss-cut sheets.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-flx-01',
    name: 'High-Resolution Star Flex Banner',
    slug: 'high-resolution-star-flex-banner',
    category: 'Flex & Banner Printing',
    categoryId: 'cat-3',
    shortDescription: 'Heavy-duty 340 GSM Star flex with vibrant outdoor solvent printing, hemmed with brass eyelets.',
    description: 'Perfect for shop signboards, festival hoardings, commercial billboards, trade fair backdrops, and construction fencing. The high-density fiber weave guarantees durability through rain, wind, and harsh summer sun.',
    images: [
      '/images/products/star-flex-banner.jpg'
    ],
    basePrice: 300,
    priceType: 'quantity_tiered',
    minQuantity: 20,
    quantityTiers: [
      { minQty: 20, unitPrice: 15.0 },
      { minQty: 100, unitPrice: 12.0 },
      { minQty: 500, unitPrice: 9.5 }
    ],
    options: [
      {
        id: 'opt-flex-quality',
        name: 'Flex Media Grade',
        type: 'radio',
        values: [
          { id: 'fq-normal', name: 'Standard Frontlit Flex (280 GSM)', priceModifier: 0 },
          { id: 'fq-star', name: 'Premium Star Flex (340 GSM Heavy)', priceModifier: 50, isDefault: true },
          { id: 'fq-backlit', name: 'Glow-sign Backlit Flex', priceModifier: 120 }
        ]
      },
      {
        id: 'opt-finishing',
        name: 'Border & Eyelets',
        type: 'select',
        values: [
          { id: 'eyelets-all', name: 'Welded Hemming + Brass Eyelets every 2ft', priceModifier: 0, isDefault: true },
          { id: 'pockets-top', name: 'Pole Pockets Top & Bottom', priceModifier: 80 },
          { id: 'raw-cut', name: 'Clean Cut Flush (No Eyelets)', priceModifier: 0 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: 'Same Day to 24 Hours',
    deliveryInfo: 'Rolled and safely packed in protective tubing.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-bag-01',
    name: 'Eco-Friendly Kraft Paper Carry Bags',
    slug: 'eco-friendly-kraft-paper-bags',
    category: 'Carry Bags',
    categoryId: 'cat-4',
    shortDescription: 'Custom printed brown or white Kraft shopping bags with twisted paper or cotton rope handles.',
    description: 'Replace plastic carry bags with 100% biodegradable and recyclable custom branded paper bags. High tensile strength, block-bottom design stands upright automatically.',
    images: [
      '/images/products/kraft-paper-bags.jpg'
    ],
    basePrice: 1200,
    priceType: 'quantity_tiered',
    minQuantity: 100,
    quantityTiers: [
      { minQty: 100, unitPrice: 12.0 },
      { minQty: 500, unitPrice: 9.5 },
      { minQty: 1000, unitPrice: 7.8 },
      { minQty: 5000, unitPrice: 5.9 }
    ],
    options: [
      {
        id: 'opt-bag-size',
        name: 'Bag Dimension',
        type: 'select',
        values: [
          { id: 'bs-small', name: 'Small: 8 x 10 x 3 Inches', priceModifier: 0, isDefault: true },
          { id: 'bs-med', name: 'Medium: 10 x 14 x 4 Inches', priceModifier: 300 },
          { id: 'bs-large', name: 'Large: 14 x 18 x 5 Inches', priceModifier: 650 }
        ]
      },
      {
        id: 'opt-bag-color',
        name: 'Base Paper Type',
        type: 'radio',
        values: [
          { id: 'bc-brown', name: 'Natural Brown Kraft (140 GSM)', priceModifier: 0, isDefault: true },
          { id: 'bc-white', name: 'Bleached White Kraft (150 GSM)', priceModifier: 150 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '4-5 Business Days',
    deliveryInfo: 'Bundled in cartons of 100 or 250 units.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-bp-01',
    name: 'Custom Printed Butter Paper Sheets',
    slug: 'custom-printed-butter-paper',
    category: 'Butter Paper Printing',
    categoryId: 'cat-5',
    shortDescription: 'US-FDA compliant greaseproof printed butter paper for food service and retail wrap.',
    description: 'Keep your food fresh and your brand top of mind. Oil-resistant wrapping sheets with custom logo pattern repeating across the sheet. Safe for direct food contact.',
    images: [
      '/images/products/butter-paper-sheets.jpg'
    ],
    basePrice: 2200,
    priceType: 'quantity_tiered',
    minQuantity: 1000,
    quantityTiers: [
      { minQty: 1000, unitPrice: 2.2 },
      { minQty: 2500, unitPrice: 1.8 },
      { minQty: 5000, unitPrice: 1.4 },
      { minQty: 10000, unitPrice: 1.1 }
    ],
    options: [
      {
        id: 'opt-bp-size',
        name: 'Sheet Size',
        type: 'select',
        values: [
          { id: 'bps-10x10', name: '10 x 10 Inches (Standard Burger)', priceModifier: 0, isDefault: true },
          { id: 'bps-12x12', name: '12 x 12 Inches (Medium Wrap)', priceModifier: 400 },
          { id: 'bps-14x14', name: '14 x 14 Inches (Large Roll/Basket)', priceModifier: 800 }
        ]
      },
      {
        id: 'opt-bp-colors',
        name: 'Print Colors',
        type: 'radio',
        values: [
          { id: 'bpc-single', name: 'Single Color (Red, Brown, Black or Blue)', priceModifier: 0, isDefault: true },
          { id: 'bpc-double', name: 'Two Color Print', priceModifier: 600 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '3-4 Business Days',
    deliveryInfo: 'Packed in dust-proof shrink wrap bundles of 500 sheets.',
    isFeatured: true,
    isActive: true,
    gstRate: 12
  },
  {
    id: 'prod-sb-01',
    name: 'Direct UV Printed Sunboard Displays',
    slug: 'direct-uv-sunboard-displays',
    category: 'Sunboard Printing',
    categoryId: 'cat-7',
    shortDescription: 'High density 5mm rigid foam PVC sunboard printed with true-to-life UV cure inks.',
    description: 'Fade-proof rigid advertising boards for indoor and outdoor retail signage, clinic directories, menu boards, and showroom product highlights.',
    images: [
      '/images/products/sunboard-displays.jpg'
    ],
    basePrice: 450,
    priceType: 'quantity_tiered',
    minQuantity: 1,
    quantityTiers: [
      { minQty: 1, unitPrice: 450 },
      { minQty: 5, unitPrice: 380 },
      { minQty: 20, unitPrice: 320 }
    ],
    options: [
      {
        id: 'opt-sb-thick',
        name: 'Board Thickness',
        type: 'radio',
        values: [
          { id: 'sbt-3mm', name: '3mm Standard Sunboard', priceModifier: 0 },
          { id: 'sbt-5mm', name: '5mm Heavy Rigid Sunboard', priceModifier: 120, isDefault: true }
        ]
      },
      {
        id: 'opt-sb-size',
        name: 'Board Dimensions',
        type: 'select',
        values: [
          { id: 'sbs-a3', name: 'A3 Size (12 x 18 Inches)', priceModifier: 0, isDefault: true },
          { id: 'sbs-2x3', name: '2 x 3 Feet (24 x 36 Inches)', priceModifier: 450 },
          { id: 'sbs-3x4', name: '3 x 4 Feet (Exhibition Wall)', priceModifier: 950 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '24-48 Hours',
    deliveryInfo: 'Corner protection caps fitted to avoid transit bruising.',
    isFeatured: false,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-box-01',
    name: 'Custom Corrugated E-commerce Mailer Boxes',
    slug: 'custom-corrugated-mailer-boxes',
    category: 'Boxes & Packaging',
    categoryId: 'cat-9',
    shortDescription: 'Heavy-duty 3-ply corrugated mailer boxes printed with high-impact brand designs.',
    description: 'Give customers an unforgettable unboxing experience. Self-locking dust flaps keep contents secure without needing messy packing tape on the outer body.',
    images: [
      '/images/products/corrugated-mailer-boxes.jpg'
    ],
    basePrice: 2500,
    priceType: 'quantity_tiered',
    minQuantity: 100,
    quantityTiers: [
      { minQty: 100, unitPrice: 25.0 },
      { minQty: 250, unitPrice: 21.0 },
      { minQty: 500, unitPrice: 17.5 },
      { minQty: 1000, unitPrice: 14.0 }
    ],
    options: [
      {
        id: 'opt-box-dim',
        name: 'Box Size (L x W x H)',
        type: 'select',
        values: [
          { id: 'bxd-sml', name: 'Small: 7 x 5 x 2.5 Inches', priceModifier: 0, isDefault: true },
          { id: 'bxd-med', name: 'Medium: 9.5 x 6.5 x 3 Inches', priceModifier: 500 },
          { id: 'bxd-lrg', name: 'Large: 12 x 9 x 4 Inches', priceModifier: 1100 }
        ]
      },
      {
        id: 'opt-box-print',
        name: 'Printing Area',
        type: 'radio',
        values: [
          { id: 'bxp-outer', name: 'Outer Surface Only', priceModifier: 0, isDefault: true },
          { id: 'bxp-both', name: 'Inside & Outside Full Color', priceModifier: 800 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '5-7 Business Days',
    deliveryInfo: 'Shipped flat-packed to save warehouse and freight space.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-fly-01',
    name: 'Promotional Gloss Flyers / Pamphlets',
    slug: 'promotional-gloss-flyers',
    category: 'Pamphlets / Flyers',
    categoryId: 'cat-10',
    shortDescription: 'High-speed offset printing on 130 GSM European art paper with brilliant color reproduction.',
    description: 'Mass market campaigns demand cost-effectiveness and punchy colors. Ideal for real estate developments, restaurants, schools, gyms, and retail store openings.',
    images: [
      '/images/products/promotional-gloss-flyers.jpg'
    ],
    basePrice: 850,
    priceType: 'quantity_tiered',
    minQuantity: 500,
    quantityTiers: [
      { minQty: 500, unitPrice: 1.7 },
      { minQty: 1000, unitPrice: 1.25 },
      { minQty: 2500, unitPrice: 0.95 },
      { minQty: 5000, unitPrice: 0.72 }
    ],
    options: [
      {
        id: 'opt-fly-size',
        name: 'Flyer Size',
        type: 'select',
        values: [
          { id: 'fs-a5', name: 'A5 Size (5.8 x 8.3 Inches)', priceModifier: 0, isDefault: true },
          { id: 'fs-a4', name: 'A4 Size (8.3 x 11.7 Inches)', priceModifier: 600 }
        ]
      },
      {
        id: 'opt-fly-sides',
        name: 'Sides',
        type: 'radio',
        values: [
          { id: 'fls-single', name: 'Single Side Print', priceModifier: 0, isDefault: true },
          { id: 'fls-double', name: 'Double Sided Full Color', priceModifier: 350 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '24-48 Hours',
    deliveryInfo: 'Bundled in packs of 250 with moisture barrier wrapping.',
    isFeatured: true,
    isActive: true,
    gstRate: 12
  },
  {
    id: 'prod-pen-01',
    name: 'Executive Metal Ball Pen with Laser Engraving',
    slug: 'executive-metal-ball-pen',
    category: 'Pen Printing',
    categoryId: 'cat-8',
    shortDescription: 'Sleek matte black metallic pen with silver or gold laser etching of your brand logo.',
    description: 'An evergreen corporate souvenir. Smooth German ink refill, solid aluminum alloy construction with chrome accents. Long-lasting, high-perceived value gift.',
    images: [
      '/images/products/executive-metal-pens.jpg'
    ],
    basePrice: 950,
    priceType: 'quantity_tiered',
    minQuantity: 25,
    quantityTiers: [
      { minQty: 25, unitPrice: 38.0 },
      { minQty: 50, unitPrice: 32.0 },
      { minQty: 100, unitPrice: 26.0 },
      { minQty: 250, unitPrice: 22.0 }
    ],
    options: [
      {
        id: 'opt-pen-color',
        name: 'Barrel Color',
        type: 'radio',
        values: [
          { id: 'pen-blk', name: 'Matte Jet Black', priceModifier: 0, isDefault: true },
          { id: 'pen-blu', name: 'Deep Royal Blue', priceModifier: 0 },
          { id: 'pen-slv', name: 'Brushed Silver', priceModifier: 0 }
        ]
      },
      {
        id: 'opt-pen-box',
        name: 'Gift Packaging',
        type: 'select',
        values: [
          { id: 'pb-bulk', name: 'Protective Sleeve (Bulk)', priceModifier: 0, isDefault: true },
          { id: 'pb-velvet', name: 'Velvet Soft Pouch', priceModifier: 150 },
          { id: 'pb-box', name: 'Hard Shell Luxury Gift Box', priceModifier: 400 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '2-3 Business Days',
    deliveryInfo: 'Individually checked for smooth ink flow prior to dispatch.',
    isFeatured: false,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-id-01',
    name: 'PVC Staff ID Cards with Lanyards',
    slug: 'pvc-id-cards-lanyards',
    category: 'ID Cards',
    categoryId: 'cat-15',
    shortDescription: 'CR80 standard credit card thickness waterproof PVC with custom printed satin lanyards.',
    description: 'Complete employee and student identification solution. High-resolution dye-sublimation print ensures facial photos and barcodes are crisp and scan cleanly.',
    images: [
      '/images/products/pvc-id-cards.jpg'
    ],
    basePrice: 550,
    priceType: 'quantity_tiered',
    minQuantity: 10,
    quantityTiers: [
      { minQty: 10, unitPrice: 55.0 },
      { minQty: 25, unitPrice: 45.0 },
      { minQty: 50, unitPrice: 38.0 },
      { minQty: 100, unitPrice: 30.0 }
    ],
    options: [
      {
        id: 'opt-lanyard',
        name: 'Lanyard Option',
        type: 'select',
        values: [
          { id: 'ly-none', name: 'Card Only (No Lanyard)', priceModifier: 0 },
          { id: 'ly-plain', name: 'Plain 16mm Satin Lanyard + Hook', priceModifier: 120 },
          { id: 'ly-print', name: 'Sublimation Printed Lanyard with Logo', priceModifier: 250, isDefault: true }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '24-48 Hours',
    deliveryInfo: 'Includes rigid transparent card holder.',
    isFeatured: false,
    isActive: true,
    gstRate: 18
  },
  {
    id: 'prod-mug-01',
    name: 'Custom Branded Ceramic Coffee Mugs',
    slug: 'custom-branded-ceramic-coffee-mugs',
    category: 'Customized Printing',
    categoryId: 'cat-6',
    shortDescription: '11oz Grade-A bright white ceramic mug with wraparound photo-quality sublimation print.',
    description: 'A morning desk staple that keeps your brand visible daily. Microwave safe and dishwasher friendly, with vibrant colors that do not peel or fade over time.',
    images: [
      '/images/products/ceramic-coffee-mugs.jpg'
    ],
    basePrice: 450,
    priceType: 'quantity_tiered',
    minQuantity: 5,
    quantityTiers: [
      { minQty: 5, unitPrice: 90.0 },
      { minQty: 20, unitPrice: 78.0 },
      { minQty: 50, unitPrice: 65.0 },
      { minQty: 100, unitPrice: 55.0 }
    ],
    options: [
      {
        id: 'opt-mug-type',
        name: 'Mug Variety',
        type: 'radio',
        values: [
          { id: 'mug-white', name: 'Classic Pure White Ceramic (11oz)', priceModifier: 0, isDefault: true },
          { id: 'mug-inner', name: 'Inner Dual-Color Mug (Blue/Red/Black)', priceModifier: 80 },
          { id: 'mug-magic', name: 'Heat-Activated Magic Reveal Mug', priceModifier: 200 }
        ]
      }
    ],
    requiresArtwork: true,
    productionTime: '2 Business Days',
    deliveryInfo: 'Individually packed in thick foam molded thermocol boxes.',
    isFeatured: true,
    isActive: true,
    gstRate: 18
  }
];

export const fallbackSettings: BusinessSettings = {
  brandName: 'PrintezYour',
  tagline: 'Print | Design | Brand',
  phone: '+91 8557049897',
  whatsapp: '+91 8557049897',
  email: 'printezyour@gmail.com',
  address: 'Plot No 1794, Gym Deep Complex, Hallo Majra, Near Urban Akhada',
  city: 'Chandigarh',
  state: 'Chandigarh',
  pincode: '160002',
  workingHoursWeekday: 'Mon–Fri: 9:00 AM – 7:00 PM',
  workingHoursSaturday: 'Sat: 10:00 AM – 6:00 PM',
  workingHoursSunday: 'Sunday Closed',
  gstin: '04AABCP8557N1Z9',
  defaultGstPercent: 18,
  deliveryChargeStandard: 99,
  freeDeliveryThreshold: 2000,
  upiId: '8557049897@okbizaxis',
  enableWhatsAppNotifications: true,
  whatsappApiKey: ''
};
