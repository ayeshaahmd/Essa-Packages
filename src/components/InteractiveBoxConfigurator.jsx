import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { PACKAGING_TYPES, MATERIALS, FINISHES, INSERTS, QUANTITY_TIERS, SAMPLE_KITS, calculatePackagingEstimate } from '../types/packaging';

export function InteractiveBoxConfigurator() {
  const { activeConfig, updateActiveConfig, addConfiguredBoxToCart, addSampleKitToCart } = useOrder();
  const [activeTab, setActiveTab] = useState('format'); // 'format' | 'dimensions' | 'materials' | 'finishes' | 'quantity'

  const currentType = PACKAGING_TYPES.find(t => t.id === activeConfig.boxType) || PACKAGING_TYPES[0];
  const estimate = calculatePackagingEstimate(activeConfig);

  // Dynamic 3D Box scaling calculation
  const l = Number(activeConfig.length) || 15;
  const w = Number(activeConfig.width) || 10;
  const h = Number(activeConfig.height) || 20;

  // Normalized isometric dimensions for visual container
  const maxDim = Math.max(l, w, h);
  const visualLength = Math.max(60, Math.min(180, (l / maxDim) * 160));
  const visualWidth = Math.max(50, Math.min(140, (w / maxDim) * 130));
  const visualHeight = Math.max(70, Math.min(220, (h / maxDim) * 200));

  const handleDimensionChange = (key, val) => {
    const num = Math.max(1, parseFloat(val) || 1);
    updateActiveConfig({ [key]: num });
  };

  const handleUnitToggle = (unit) => {
    if (unit === activeConfig.unit) return;
    if (unit === 'inches') {
      updateActiveConfig({
        unit: 'inches',
        length: Math.round((activeConfig.length / 2.54) * 10) / 10,
        width: Math.round((activeConfig.width / 2.54) * 10) / 10,
        height: Math.round((activeConfig.height / 2.54) * 10) / 10
      });
    } else {
      updateActiveConfig({
        unit: 'cm',
        length: Math.round(activeConfig.length * 2.54),
        width: Math.round(activeConfig.width * 2.54),
        height: Math.round(activeConfig.height * 2.54)
      });
    }
  };

  return (
    <section id="order-builder" className="configurator-section">
      <div className="section-shell">
        <div className="configurator-header">
          <div className="section-tag light">
            <span></span>Interactive Packaging & Order Studio
          </div>
          <div className="configurator-title-row">
            <h2>Configure Your Box &<br /><em>Order Directly Online.</em></h2>
            <p>Customize dimensions, board thickness, specialty finishes, and volume discounts with instant transparent manufacturing rates.</p>
          </div>
        </div>

        {/* Studio Navigation Stepper */}
        <div className="config-nav-tabs" role="tablist" aria-label="Configuration Steps">
          {[
            { id: 'format', step: '01', label: 'Box Style' },
            { id: 'dimensions', step: '02', label: 'Size & Scale' },
            { id: 'materials', step: '03', label: 'Board Grade' },
            { id: 'finishes', step: '04', label: 'Finishes & Foil' },
            { id: 'quantity', step: '05', label: 'Volume & Order' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`config-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span>{tab.step}</span>
              <b>{tab.label}</b>
            </button>
          ))}
        </div>

        <div className="configurator-grid">
          {/* LEFT: Dynamic 3D Box Simulator & Real-time Live Preview */}
          <div className="config-preview-panel">
            <div className="preview-canvas-card">
              <div className="preview-badge-row">
                <span className="spec-badge live-pulse">Live 3D Spec</span>
                <span className="spec-badge">{activeConfig.length} × {activeConfig.width} × {activeConfig.height} {activeConfig.unit}</span>
                <span className="spec-badge lead-time">Lead Time: {estimate.leadTime}</span>
              </div>

              {/* Dynamic Isometric Box Simulation */}
              <div className="isometric-box-viewport">
                <div
                  className={`iso-box-stage tone-${currentType.tone}`}
                  style={{
                    '--box-len': `${visualLength}px`,
                    '--box-wid': `${visualWidth}px`,
                    '--box-hgt': `${visualHeight}px`
                  }}
                >
                  <div className="iso-face iso-top">
                    <span className="iso-measure top-len">{activeConfig.length} {activeConfig.unit} (L)</span>
                    <span className="iso-measure top-wid">{activeConfig.width} {activeConfig.unit} (W)</span>
                    <div className="iso-finish-glaze finish-pattern"></div>
                  </div>
                  <div className="iso-face iso-front">
                    <div className="iso-brand-mark">
                      <small>ESSA PACKAGES</small>
                      <b>{currentType.name.split(' ')[0]}</b>
                    </div>
                    <div className="iso-finish-glaze"></div>
                  </div>
                  <div className="iso-face iso-side">
                    <span className="iso-measure side-hgt">{activeConfig.height} {activeConfig.unit} (H)</span>
                    <div className="iso-finish-glaze"></div>
                  </div>
                  <div className="iso-shadow"></div>
                </div>
              </div>

              {/* Real Photography Reference of the Selected Style */}
              <div className="real-photo-preview">
                <div className="photo-preview-thumb">
                  <img src={currentType.image} alt={currentType.imageAlt} />
                </div>
                <div className="photo-preview-info">
                  <small>Selected Format Reference</small>
                  <h4>{currentType.name}</h4>
                  <p>{currentType.tagline}</p>
                </div>
              </div>

              {/* Live Spec Summary Chips */}
              <div className="spec-chips-row">
                <div className="spec-chip">
                  <span>Material</span>
                  <b>{estimate.matObj.badge}</b>
                </div>
                <div className="spec-chip">
                  <span>Finish</span>
                  <b>{estimate.finObj.name.split(' ')[0]} {estimate.finObj.name.split(' ')[1] || ''}</b>
                </div>
                <div className="spec-chip">
                  <span>Interior</span>
                  <b>{estimate.insObj.name.split(' ')[0]}</b>
                </div>
                <div className="spec-chip">
                  <span>MOQ</span>
                  <b>{currentType.minQty} units</b>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Controls & Option Tabs */}
          <div className="config-controls-panel">
            {/* STEP 1: Format / Box Type */}
            {activeTab === 'format' && (
              <div className="control-step-content">
                <div className="step-title-block">
                  <h3>01. Select Packaging Architecture</h3>
                  <p>Choose the structural silhouette engineered for your product category.</p>
                </div>
                <div className="format-selection-grid">
                  {PACKAGING_TYPES.map(type => {
                    const isSelected = activeConfig.boxType === type.id;
                    return (
                      <div
                        key={type.id}
                        className={`format-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          updateActiveConfig({
                            boxType: type.id,
                            length: type.defaultDimensions.length,
                            width: type.defaultDimensions.width,
                            height: type.defaultDimensions.height
                          });
                        }}
                      >
                        <div className="format-card-img">
                          <img src={type.image} alt={type.imageAlt} />
                        </div>
                        <div className="format-card-details">
                          <span className="format-category">{type.category}</span>
                          <h4>{type.name}</h4>
                          <p>{type.tagline}</p>
                          <div className="format-meta">
                            <span className="select-indicator">{isSelected ? '✓ Selected' : 'Choose'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="step-action-row">
                  <button className="button button-copper" onClick={() => setActiveTab('dimensions')}>
                    Next: Set Dimensions ↗
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Dimensions */}
            {activeTab === 'dimensions' && (
              <div className="control-step-content">
                <div className="step-title-block">
                  <div className="title-with-toggle">
                    <div>
                      <h3>02. Enter Exact Dimensions</h3>
                      <p>Adjust length, width, and depth in your preferred measurement standard.</p>
                    </div>
                    <div className="unit-switch-pill" role="group" aria-label="Measurement Units">
                      <button
                        className={activeConfig.unit === 'cm' ? 'active' : ''}
                        onClick={() => handleUnitToggle('cm')}
                      >
                        Centimeters (cm)
                      </button>
                      <button
                        className={activeConfig.unit === 'inches' ? 'active' : ''}
                        onClick={() => handleUnitToggle('inches')}
                      >
                        Inches (in)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="dimension-sliders-grid">
                  {/* Length */}
                  <div className="dimension-input-card">
                    <div className="dim-head">
                      <label htmlFor="dim-length">Length (Front Width)</label>
                      <span className="dim-val">{activeConfig.length} {activeConfig.unit}</span>
                    </div>
                    <input
                      id="dim-length"
                      type="range"
                      min={activeConfig.unit === 'inches' ? 2 : 5}
                      max={activeConfig.unit === 'inches' ? 36 : 90}
                      step={activeConfig.unit === 'inches' ? 0.5 : 1}
                      value={activeConfig.length}
                      onChange={e => handleDimensionChange('length', e.target.value)}
                    />
                    <div className="dim-quick-inputs">
                      <input
                        type="number"
                        min="1"
                        value={activeConfig.length}
                        onChange={e => handleDimensionChange('length', e.target.value)}
                      />
                      <small>{activeConfig.unit}</small>
                    </div>
                  </div>

                  {/* Width / Depth */}
                  <div className="dimension-input-card">
                    <div className="dim-head">
                      <label htmlFor="dim-width">Width (Side Depth)</label>
                      <span className="dim-val">{activeConfig.width} {activeConfig.unit}</span>
                    </div>
                    <input
                      id="dim-width"
                      type="range"
                      min={activeConfig.unit === 'inches' ? 2 : 4}
                      max={activeConfig.unit === 'inches' ? 30 : 75}
                      step={activeConfig.unit === 'inches' ? 0.5 : 1}
                      value={activeConfig.width}
                      onChange={e => handleDimensionChange('width', e.target.value)}
                    />
                    <div className="dim-quick-inputs">
                      <input
                        type="number"
                        min="1"
                        value={activeConfig.width}
                        onChange={e => handleDimensionChange('width', e.target.value)}
                      />
                      <small>{activeConfig.unit}</small>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="dimension-input-card">
                    <div className="dim-head">
                      <label htmlFor="dim-height">Height (Vertical Depth)</label>
                      <span className="dim-val">{activeConfig.height} {activeConfig.unit}</span>
                    </div>
                    <input
                      id="dim-height"
                      type="range"
                      min={activeConfig.unit === 'inches' ? 2 : 5}
                      max={activeConfig.unit === 'inches' ? 36 : 90}
                      step={activeConfig.unit === 'inches' ? 0.5 : 1}
                      value={activeConfig.height}
                      onChange={e => handleDimensionChange('height', e.target.value)}
                    />
                    <div className="dim-quick-inputs">
                      <input
                        type="number"
                        min="1"
                        value={activeConfig.height}
                        onChange={e => handleDimensionChange('height', e.target.value)}
                      />
                      <small>{activeConfig.unit}</small>
                    </div>
                  </div>
                </div>

                <div className="dimension-presets-callout">
                  <span>Popular Standard Presets:</span>
                  <div className="preset-buttons">
                    <button onClick={() => updateActiveConfig({ length: 10, width: 6, height: 16, unit: 'cm' })}>Perfume / Cosmetic (10×6×16 cm)</button>
                    <button onClick={() => updateActiveConfig({ length: 28, width: 18, height: 8, unit: 'cm' })}>Apparel / Gift (28×18×8 cm)</button>
                    <button onClick={() => updateActiveConfig({ length: 38, width: 28, height: 28, unit: 'cm' })}>Master Carton (38×28×28 cm)</button>
                  </div>
                </div>

                <div className="step-action-row">
                  <button className="back-button" onClick={() => setActiveTab('format')}>← Back</button>
                  <button className="button button-copper" onClick={() => setActiveTab('materials')}>
                    Next: Choose Material ↗
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Materials & Paperboard */}
            {activeTab === 'materials' && (
              <div className="control-step-content">
                <div className="step-title-block">
                  <h3>03. Select Board Grade & Thickness</h3>
                  <p>From virgin bleached food-grade boards to double-wall export corrugated sheets.</p>
                </div>

                <div className="options-stack">
                  {MATERIALS.map(mat => {
                    const isSelected = activeConfig.material === mat.id;
                    return (
                      <div
                        key={mat.id}
                        className={`option-row-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => updateActiveConfig({ material: mat.id })}
                      >
                        <div className="option-radio">
                          <span className={isSelected ? 'checked' : ''}></span>
                        </div>
                        <div className="option-info">
                          <div className="option-headline">
                            <h4>{mat.name}</h4>
                            <span className="badge-pill">{mat.badge}</span>
                          </div>
                          <p>{mat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="step-action-row">
                  <button className="back-button" onClick={() => setActiveTab('dimensions')}>← Back</button>
                  <button className="button button-copper" onClick={() => setActiveTab('finishes')}>
                    Next: Finishes & Inserts ↗
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Finishes & Inserts */}
            {activeTab === 'finishes' && (
              <div className="control-step-content">
                <div className="step-title-block">
                  <h3>04. Specialty Finishes & Interior Fit</h3>
                  <p>Elevate tactile appeal with metallic hot-stamping, UV varnishing, and custom protective inserts.</p>
                </div>

                <div className="sub-options-section">
                  <h4 className="sub-section-title">Surface Treatment & Coatings</h4>
                  <div className="finishes-grid">
                    {FINISHES.map(fin => {
                      const isSelected = activeConfig.finish === fin.id;
                      return (
                        <div
                          key={fin.id}
                          className={`finish-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => updateActiveConfig({ finish: fin.id })}
                        >
                          <div className="finish-top">
                            <b>{fin.name}</b>
                            {fin.badge && <span className="badge-micro">{fin.badge}</span>}
                          </div>
                          <p>{fin.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="sub-options-section" style={{ marginTop: '24px' }}>
                  <h4 className="sub-section-title">Custom Interior Inserts & Cavities</h4>
                  <div className="options-stack compact">
                    {INSERTS.map(ins => {
                      const isSelected = activeConfig.insert === ins.id;
                      return (
                        <div
                          key={ins.id}
                          className={`option-row-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => updateActiveConfig({ insert: ins.id })}
                        >
                          <div className="option-radio">
                            <span className={isSelected ? 'checked' : ''}></span>
                          </div>
                          <div className="option-info">
                            <div className="option-headline">
                              <h4>{ins.name}</h4>
                            </div>
                            <p>{ins.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="step-action-row">
                  <button className="back-button" onClick={() => setActiveTab('materials')}>← Back</button>
                  <button className="button button-copper" onClick={() => setActiveTab('quantity')}>
                    Next: Volume & Order ↗
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Volume Tiers & Direct Add to Order */}
            {activeTab === 'quantity' && (
              <div className="control-step-content">
                <div className="step-title-block">
                  <h3>05. Select Production Volume</h3>
                  <p>Take advantage of commercial scale savings with tiered bulk manufacturing rates.</p>
                </div>

                <div className="volume-tier-grid">
                  {QUANTITY_TIERS.map(tier => {
                    const isSelected = activeConfig.quantity === tier.qty;
                    const tierEstimate = calculatePackagingEstimate({
                      ...activeConfig,
                      quantity: tier.qty
                    });
                    return (
                      <div
                        key={tier.qty}
                        className={`tier-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => updateActiveConfig({ quantity: tier.qty })}
                      >
                        <div className="tier-qty-number">{tier.qty.toLocaleString()}</div>
                        <span className="tier-label">Units</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Quantity Input */}
                <div className="custom-qty-wrapper">
                  <label htmlFor="custom-qty-field">Or Enter Custom Exact Quantity:</label>
                  <div className="custom-qty-input-group">
                    <input
                      id="custom-qty-field"
                      type="number"
                      min={currentType.minQty}
                      step="50"
                      value={activeConfig.quantity}
                      onChange={e => {
                        const val = Math.max(currentType.minQty, parseInt(e.target.value) || currentType.minQty);
                        updateActiveConfig({ quantity: val });
                      }}
                    />
                    <span>Units (MOQ: {currentType.minQty})</span>
                  </div>
                </div>

                {/* Artwork & Project Notes */}
                <div className="artwork-status-block">
                  <label>Artwork & Design Status:</label>
                  <div className="artwork-radio-group">
                    {[
                      { id: 'ready', label: 'I have ready-to-print AI / PDF artwork' },
                      { id: 'need-dieline', label: 'I need your blank dieline template to place design' },
                      { id: 'need-design', label: 'I need full packaging graphic design assistance' }
                    ].map(opt => (
                      <label key={opt.id} className="radio-label">
                        <input
                          type="radio"
                          name="artworkStatus"
                          checked={activeConfig.artworkStatus === opt.id}
                          onChange={() => updateActiveConfig({ artworkStatus: opt.id })}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="notes-field-block">
                  <label htmlFor="config-notes">Special Production or Packaging Instructions (Optional):</label>
                  <textarea
                    id="config-notes"
                    rows="2"
                    placeholder="e.g. Window cutout, specific pantone shade, delivery address in Karachi or countrywide dispatch..."
                    value={activeConfig.customNotes}
                    onChange={e => updateActiveConfig({ customNotes: e.target.value })}
                  />
                </div>

                <div className="step-action-row">
                  <button className="back-button" onClick={() => setActiveTab('finishes')}>← Back</button>
                </div>
              </div>
            )}

            {/* Sticky Order CTA Box */}
            <div className="config-checkout-bar" style={{ justifyContent: 'flex-end' }}>
              <div className="cta-button-group">
                <button
                  className="button button-copper"
                  onClick={addConfiguredBoxToCart}
                >
                  Add Custom Run to Order ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
