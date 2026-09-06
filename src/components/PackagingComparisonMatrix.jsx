import React from 'react';
import { useOrder } from '../context/OrderContext';
import { PACKAGING_TYPES } from '../types/packaging';

export function PackagingComparisonMatrix() {
  const { loadPresetConfig } = useOrder();

  const comparisonData = [
    {
      id: 'fancy-carton',
      name: 'Fancy Folding Cartons',
      boardGrade: '300 – 400 GSM Bleached Ivory Board',
      function: 'Shelf retail, cosmetics, pharmaceutical, lightweight gifts',
      moq: '250 units',
      leadTime: '7 – 9 Days',
      printOptions: 'High-Res CMYK + Pantones + Foil + Spot UV',
      durability: 'Moderate (Shelf-ready)',
      sampleAvailability: 'Yes (Digital & Physical)',
      boxTypeKey: 'fancy-carton'
    },
    {
      id: 'master-box',
      name: 'Master Corrugated Boxes',
      boardGrade: '3-Ply / 5-Ply Heavy Kraft (B/C/BC Flute)',
      function: 'Warehouse storage, pallet shipping, heavy bulk logistics',
      moq: '100 units',
      leadTime: '5 – 7 Days',
      printOptions: 'Single/Dual Color Flexo or CMYK Litho-Laminated',
      durability: 'Heavy Duty (Stack & Impact Safe)',
      sampleAvailability: 'Yes (Plain structural dummy)',
      boxTypeKey: 'master-box'
    },
    {
      id: 'printed-carton',
      name: 'Printed Product Cartons',
      boardGrade: '350 GSM Duplex / SBS Artboard',
      function: 'FMCG, consumer goods, hardware, retail electronics',
      moq: '250 units',
      leadTime: '7 – 10 Days',
      printOptions: 'Full bleed 6-Color Offset + Gloss/Matte Lamination',
      durability: 'Medium (Retail standard)',
      sampleAvailability: 'Yes (Unprinted or Digitally Proved)',
      boxTypeKey: 'printed-carton'
    },
    {
      id: 'rigid-gift-box',
      name: 'Luxury Rigid Boxes',
      boardGrade: '1000 – 1600 GSM Grayboard + Specialty Wrap Paper',
      function: 'High-end jewelry, prestige hampers, presentation sets',
      moq: '100 units',
      leadTime: '10 – 14 Days',
      printOptions: 'Foil Stamping, Debossing, Embossed Linen Textures',
      durability: 'Maximum (Keepsake Rigid Core)',
      sampleAvailability: 'Yes (Handmade prototype)',
      boxTypeKey: 'rigid-gift-box'
    }
  ];

  return (
    <section className="comparison-section section-shell">
      <div className="comparison-header">
        <div className="section-tag"><span></span>Technical Specification Matrix</div>
        <h2>Compare Formats for<br /><em>Your Product Requirements.</em></h2>
        <p>Unsure which packaging specification fits your weight, budget, and presentation goals? Review our comparison breakdown below.</p>
      </div>

      <div className="table-responsive-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Packaging Architecture</th>
              <th>Board Grade & Caliper</th>
              <th>Primary Application</th>
              <th>Minimum Run</th>
              <th>Lead Time</th>
              <th>Protection Grade</th>
              <th>Configure & Order</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row) => (
              <tr key={row.id}>
                <td>
                  <b className="comp-name">{row.name}</b>
                </td>
                <td>{row.boardGrade}</td>
                <td>{row.function}</td>
                <td><span className="moq-pill">{row.moq}</span></td>
                <td>{row.leadTime}</td>
                <td><span className="durability-badge">{row.durability}</span></td>
                <td>
                  <button
                    className="button button-small button-copper"
                    onClick={() => loadPresetConfig({ boxType: row.boxTypeKey })}
                  >
                    Build & Order ↗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
