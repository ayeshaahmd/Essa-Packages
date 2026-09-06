export const PACKAGING_TYPES = [
  {
    id: 'fancy-carton',
    name: 'Fancy Folding Cartons',
    category: 'Retail & Cosmetics',
    tagline: 'Shelf-ready folding cartons that make every unboxing feel intentional.',
    image: '/images/fancy-carton-photo.png',
    imageAlt: 'Luxury folding carton with embossed pattern',
    basePricePKR: 45, // Base unit price at 1,000 qty
    minQty: 250,
    recommendedQty: 1000,
    defaultDimensions: { length: 14, width: 8, height: 22, unit: 'cm' },
    minDimensions: { length: 5, width: 3, height: 5 },
    maxDimensions: { length: 50, width: 35, height: 60 },
    shape: 'tall',
    tone: 'ivory',
    leadTimeDays: '7 - 9 Days',
    idealFor: 'Cosmetics, Skincare, Perfumes, Pharmaceuticals, Confectionery, Boutique Goods'
  },
  {
    id: 'master-box',
    name: 'Master Shipping & Storage Boxes',
    category: 'Distribution & Logistics',
    tagline: 'Heavy-duty corrugated master cartons built for stackability, transport, and protection.',
    image: '/images/master-boxes-photo.png',
    imageAlt: 'High-strength black corrugated master boxes',
    basePricePKR: 120,
    minQty: 100,
    recommendedQty: 500,
    defaultDimensions: { length: 40, width: 30, height: 30, unit: 'cm' },
    minDimensions: { length: 15, width: 15, height: 10 },
    maxDimensions: { length: 120, width: 90, height: 90 },
    shape: 'cube',
    tone: 'charcoal',
    leadTimeDays: '5 - 7 Days',
    idealFor: 'Bulk Shipping, Warehouse Storage, Export Freight, Distribution Hubs'
  },
  {
    id: 'printed-carton',
    name: 'Full-Color Printed Product Cartons',
    category: 'Retail & Branding',
    tagline: 'Crisp, high-definition printed cartons that bring brand storytelling directly onto the shelf.',
    image: '/images/printed-cartons-photo.png',
    imageAlt: 'Vibrant CMYK printed product packaging carton',
    basePricePKR: 55,
    minQty: 250,
    recommendedQty: 1000,
    defaultDimensions: { length: 18, width: 12, height: 25, unit: 'cm' },
    minDimensions: { length: 6, width: 4, height: 6 },
    maxDimensions: { length: 60, width: 45, height: 60 },
    shape: 'slim',
    tone: 'copper',
    leadTimeDays: '7 - 10 Days',
    idealFor: 'Electronics, FMCG, Packaged Foods, Apparel, Retail Hardware'
  },
  {
    id: 'rigid-gift-box',
    name: 'Custom Luxury Rigid Boxes',
    category: 'Premium Gifting',
    tagline: 'Ultra-sturdy wrapped grayboard boxes engineered for maximum luxury feel and keepsake value.',
    image: '/images/custom-rigid-gift-box-photo.png',
    imageAlt: 'Matte black custom luxury rigid gift box',
    basePricePKR: 195,
    minQty: 100,
    recommendedQty: 500,
    defaultDimensions: { length: 24, width: 18, height: 9, unit: 'cm' },
    minDimensions: { length: 8, width: 8, height: 4 },
    maxDimensions: { length: 60, width: 50, height: 30 },
    shape: 'wide',
    tone: 'charcoal',
    leadTimeDays: '10 - 14 Days',
    idealFor: 'Jewelry, Luxury Hampers, Corporate Gifts, Watches, Premium Devices'
  },
  {
    id: 'corrugated-mailer',
    name: 'E-Commerce Corrugated Mailers',
    category: 'Direct-to-Consumer',
    tagline: 'Roll-end tuck front mailers designed for secure transit and delightful unboxing moments.',
    image: '/images/origin-supply-photo.png',
    imageAlt: 'White and kraft custom mailer boxes',
    basePricePKR: 68,
    minQty: 250,
    recommendedQty: 1000,
    defaultDimensions: { length: 28, width: 20, height: 10, unit: 'cm' },
    minDimensions: { length: 10, width: 10, height: 4 },
    maxDimensions: { length: 60, width: 45, height: 25 },
    shape: 'wide',
    tone: 'kraft',
    leadTimeDays: '6 - 8 Days',
    idealFor: 'E-Commerce Brands, Fashion Apparel, Subscription Kits, Footwear'
  },
  {
    id: 'presentation-box',
    name: 'Embossed Boutique Presentation Boxes',
    category: 'Specialty Retail',
    tagline: 'Artisanal packaging crafted with tactile textured paper and subtle metallic accents.',
    image: '/images/bloom-studio-photo.png',
    imageAlt: 'Textured lilac and cream presentation gift box',
    basePricePKR: 85,
    minQty: 200,
    recommendedQty: 1000,
    defaultDimensions: { length: 20, width: 15, height: 12, unit: 'cm' },
    minDimensions: { length: 6, width: 6, height: 5 },
    maxDimensions: { length: 50, width: 40, height: 40 },
    shape: 'tall',
    tone: 'lilac',
    leadTimeDays: '8 - 11 Days',
    idealFor: 'Floral Studios, Artisanal Bakery, Wellness Products, Event Favors'
  }
];

export const MATERIALS = [
  {
    id: 'ivory-board',
    name: '350 GSM Bleached Ivory Board',
    description: 'Ultra-smooth bright white surface, ideal for sharp CMYK print and vibrant finishes.',
    multiplier: 1.0,
    badge: 'Standard Retail'
  },
  {
    id: 'kraft-liner',
    name: 'Eco-Friendly Natural Kraft (Brown)',
    description: '100% recyclable, rustic organic texture with superior tear resistance.',
    multiplier: 0.92,
    badge: 'Sustainable Choice'
  },
  {
    id: 'corrugated-3ply',
    name: '3-Ply E-Flute Corrugated Board',
    description: 'Lightweight yet impact-absorbing fluted structure for protective shipping boxes.',
    multiplier: 1.15,
    badge: 'Transit Protection'
  },
  {
    id: 'corrugated-5ply',
    name: '5-Ply Heavy-Duty Master Board',
    description: 'Double-wall structural strength engineered for industrial stacking and exports.',
    multiplier: 1.45,
    badge: 'Maximum Strength'
  },
  {
    id: 'rigid-grayboard',
    name: '1200 GSM Rigid Hardboard + Wrapped Artpaper',
    description: 'Non-collapsible solid premium core with hand-wrapped finish for luxury packaging.',
    multiplier: 2.1,
    badge: 'Ultra Luxury'
  }
];

export const FINISHES = [
  {
    id: 'matte-laminate',
    name: 'Soft-Touch Matte Lamination',
    costPerUnit: 4,
    description: 'Silky non-reflective tactile texture that prevents scuffs and repels moisture.',
    badge: 'Most Popular'
  },
  {
    id: 'gloss-laminate',
    name: 'High-Gloss Protective Coating',
    costPerUnit: 3,
    description: 'Vivid reflective shine that amplifies rich colors and graphic contrast.'
  },
  {
    id: 'gold-foil',
    name: 'Hot Stamped Metallic Copper / Gold Foil',
    costPerUnit: 9,
    description: 'Shimmering metallic reflection applied to logos, typography, and borders.',
    badge: 'Luxury Accent'
  },
  {
    id: 'spot-uv',
    name: 'Raised Spot Gloss UV Varnish',
    costPerUnit: 7,
    description: 'High-gloss selective coating highlighting specific graphic elements on matte backgrounds.'
  },
  {
    id: 'embossing',
    name: 'Multi-Level 3D Embossing / Debossing',
    costPerUnit: 6,
    description: 'Sculpted physical relief adding an unmistakable tactile depth to your branding.'
  },
  {
    id: 'none',
    name: 'Raw Uncoated Natural Finish',
    costPerUnit: 0,
    description: 'Clean, minimalist unvarnished natural paperboard feel.'
  }
];

export const INSERTS = [
  {
    id: 'none',
    name: 'No Insert (Standard Hollow Interior)',
    costPerUnit: 0,
    description: 'Standard open cavity for product placement.'
  },
  {
    id: 'card-partition',
    name: 'Custom Die-Cut Cardboard Divider',
    costPerUnit: 8,
    description: 'Folded paperboard compartments to hold jars, bottles, or multi-item sets securely.'
  },
  {
    id: 'eva-foam',
    name: 'High-Density Laser-Cut EVA Foam Cushion',
    costPerUnit: 22,
    description: 'Custom contour-molded velvet-topped foam for shockproof presentation.'
  },
  {
    id: 'satin-cloth',
    name: 'Satin Fabric Drape with Molded Base',
    costPerUnit: 28,
    description: 'Opulent fabric lining providing royal presentation for perfumes and gifts.'
  }
];

export const QUANTITY_TIERS = [
  { qty: 250, discountPct: 0, label: '250 units (Pilot Run)' },
  { qty: 500, discountPct: 8, label: '500 units (Standard Launch)' },
  { qty: 1000, discountPct: 18, label: '1,000 units (Volume - Popular)' },
  { qty: 2500, discountPct: 28, label: '2,500 units (Commercial Scale)' },
  { qty: 5000, discountPct: 38, label: '5,000 units (Enterprise Wholesale)' },
  { qty: 10000, discountPct: 45, label: '10,000+ units (Maximum Savings)' }
];

export const SAMPLE_KITS = [
  {
    id: 'standard-sample-pack',
    name: 'Essa Materials & Finishes Sample Kit',
    pricePKR: 1200,
    description: 'Curated assortment of Folding Board, Kraft, 3-Ply Corrugated swatches, Gold Foil, Spot UV, and Matte Finishes.',
    image: '/images/custom-gift-box-photo.png',
    includes: ['5x Board Grade Swatches', 'All 4 Specialty Finish Samples', 'Paper Caliper Ruler', 'Standard Die-Line Template Catalog']
  },
  {
    id: 'custom-unprinted-dummy',
    name: 'Custom Sized Plain White / Kraft Prototype',
    pricePKR: 2500,
    description: 'A physical plain structural sample tailored to your exact Length × Width × Height dimensions for fit checking.',
    image: '/images/parcel-one-photo.png',
    includes: ['1x Exact Dimension Structural Mockup', 'Accurate Board Thickness', 'Fitting & Weight Test Ready']
  }
];

export function calculatePackagingEstimate({ boxType, length, width, height, unit, material, finish, insert, quantity }) {
  const typeObj = PACKAGING_TYPES.find(t => t.id === boxType) || PACKAGING_TYPES[0];
  const matObj = MATERIALS.find(m => m.id === material) || MATERIALS[0];
  const finObj = FINISHES.find(f => f.id === finish) || FINISHES[0];
  const insObj = INSERTS.find(i => i.id === insert) || INSERTS[0];

  const tier = QUANTITY_TIERS.slice().reverse().find(t => quantity >= t.qty) || QUANTITY_TIERS[0];

  return {
    tier,
    leadTime: typeObj.leadTimeDays,
    typeObj,
    matObj,
    finObj,
    insObj
  };
}
