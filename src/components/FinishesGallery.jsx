import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';

const FINISH_DETAILS = [
  {
    id: 'gold-foil',
    title: 'Hot Stamped Foil (Gold / Copper)',
    subtitle: 'Shimmering metallic depth that reflects ambient light.',
    tag: 'Luxury & Cosmetic Packaging',
    image: '/images/bloom-studio-photo.png',
    finishKey: 'gold-foil',
    features: [
      'Precision brass die application under heat and pressure',
      'Available in reflective Rich Gold, Rose Gold, Warm Copper, and Silver',
      'Crisp legibility on intricate logos, calligraphy, and borders'
    ],
    description: 'Hot stamping bonds genuine metallic foil to paperboard fibers, providing a brilliant, mirror-like specular reflection that cannot be achieved with conventional metallic inks.'
  },
  {
    id: 'spot-uv',
    title: 'Raised Spot Gloss UV Varnish',
    subtitle: 'High-contrast gloss highlights on silky matte backgrounds.',
    tag: 'Electronics & Retail Cartons',
    image: '/images/custom-rigid-gift-box-photo.png',
    finishKey: 'spot-uv',
    features: [
      'Polymer resin cured instantly with high-intensity ultraviolet light',
      'Provides subtle, tactile 3D raised topography you can feel with your fingertips',
      'Accentuates brand patterns, watermarks, and typography without overpowering'
    ],
    description: 'Spot UV delivers stunning architectural contrast by juxtaposing a deep, velvety matte surface with crystal-clear high-gloss coated elements.'
  },
  {
    id: 'matte-laminate',
    title: 'Soft-Touch Velvet Matte Lamination',
    subtitle: 'Fingerprint-resistant, non-glare luxurious tactile surface.',
    tag: 'Boutique Skincare & Perfumes',
    image: '/images/fancy-carton-photo.png',
    finishKey: 'matte-laminate',
    features: [
      'Thermal BOPP film with specialized micro-textured velvety coating',
      'Shields against scuffs, transit abrasions, and finger grease',
      'Creates a calm, modern, and unmistakably premium unboxing touch'
    ],
    description: 'Engineered for luxury packaging where the first physical touch matters. Soft-touch matte coating gives cartons a suede-like warmth and elegance.'
  },
  {
    id: 'embossing',
    title: 'Precision 3D Embossing & Debossing',
    subtitle: 'Physical relief sculpted directly into the paperboard.',
    tag: 'Artisanal & Gourmet Goods',
    image: '/images/printed-cartons-photo.png',
    finishKey: 'embossing',
    features: [
      'Custom matched male and female magnesium dies',
      'Multi-level sculptured contouring for dramatic shadow and depth',
      'Can be applied blind (no ink) or registered over printed artwork'
    ],
    description: 'Transform flat packaging into an engaging, multi-sensory sculpture that invites customers to run their fingers over your brand mark.'
  }
];

export function FinishesGallery() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { updateActiveConfig } = useOrder();
  const current = FINISH_DETAILS[selectedIdx];

  const handleApplyFinish = (finishKey) => {
    updateActiveConfig({ finish: finishKey });
    const el = document.getElementById('order-builder');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="finishes-section">
      <div className="section-shell">
        <div className="finishes-header">
          <div className="section-tag light"><span></span>Tactile & Finishing Masterclass</div>
          <h2>Finishes Crafted to<br /><em>Captivate the Senses.</em></h2>
          <p>Packaging is the only marketing channel your customer holds in their hands. Explore our master finishing capabilities.</p>
        </div>

        <div className="finishes-explorer-grid">
          {/* Navigation selector */}
          <div className="finishes-nav-col">
            {FINISH_DETAILS.map((f, idx) => (
              <button
                key={f.id}
                className={`finish-nav-btn ${selectedIdx === idx ? 'active' : ''}`}
                onClick={() => setSelectedIdx(idx)}
              >
                <span>0{idx + 1}</span>
                <div>
                  <b>{f.title}</b>
                  <small>{f.tag}</small>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Preview Card */}
          <div className="finish-display-card">
            <div className="finish-display-img-wrap">
              <img src={current.image} alt={current.title} />
              <div className="finish-overlay-badge">{current.tag}</div>
            </div>

            <div className="finish-display-content">
              <h3>{current.title}</h3>
              <p className="finish-lead">{current.subtitle}</p>
              <p className="finish-desc-text">{current.description}</p>

              <div className="finish-features-list">
                {current.features.map((feat, i) => (
                  <div key={i} className="feat-item">
                    <span className="feat-check">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="finish-cta-row">
                <button
                  className="button button-copper"
                  onClick={() => handleApplyFinish(current.finishKey)}
                >
                  Configure Box with {current.title.split(' ')[0]} ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
