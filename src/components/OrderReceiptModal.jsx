import React from 'react';
import { useOrder } from '../context/OrderContext';

export function OrderReceiptModal() {
  const { receiptModalOpen, closeOrderReceipt, activeOrderForReceipt, openOrderTracker } = useOrder();

  if (!receiptModalOpen || !activeOrderForReceipt) return null;

  const order = activeOrderForReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let msg = `*CONFIRMED ESSA PACKAGES ORDER VOUCHER*\n`;
    msg += `Order ID: ${order.id}\n`;
    msg += `Customer: ${order.customer?.name} (${order.customer?.company || ''})\n`;
    msg += `Please check this order in your production queue.`;
    window.open(`https://wa.me/923452801957?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="modal-backdrop receipt-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeOrderReceipt(); }}>
      <div className="receipt-modal-card" role="dialog" aria-modal="true" aria-labelledby="receipt-heading">
        {/* Actions Bar (Screen Only) */}
        <div className="receipt-actions-toolbar no-print">
          <div className="receipt-status-pill">
            <span className="pulse-dot"></span>
            <b>Status: {order.status}</b>
          </div>
          <div className="toolbar-buttons">
            <button className="button button-small button-outline" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
            <button className="button button-small button-copper" onClick={handleWhatsAppShare}>
              💬 Confirm via WhatsApp
            </button>
            <button className="receipt-close-btn" onClick={closeOrderReceipt} aria-label="Close modal">×</button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="receipt-paper">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-brand">
              <img src="/images/essa-packages-logo.png" alt="Essa Packages Logo" className="receipt-logo" />
              <div>
                <h3 className="company-title">ESSA PACKAGES</h3>
                <p className="company-sub">Custom Cartons · Master Boxes · Bespoke Printed Packaging</p>
                <small className="company-addr">
                  Plot No. B-81, Sector 11-E, New Fatima Jinnah Colony, Near Godra, North Karachi.<br />
                  Phone: 0345 2801957 / 0335 2897171 · Email: imran.essapackages@gmail.com
                </small>
              </div>
            </div>

            <div className="receipt-meta-box">
              <span className="voucher-title">PRODUCTION ORDER VOUCHER</span>
              <div className="meta-line">
                <span>Order Ref:</span>
                <b className="ref-number">{order.id}</b>
              </div>
              <div className="meta-line">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="meta-line">
                <span>Est. Delivery:</span>
                <span>{order.estimatedDispatch || '7 - 10 Business Days'}</span>
              </div>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Customer & Delivery Information */}
          <div className="receipt-customer-section">
            <div className="customer-col">
              <span className="section-mini-heading">ORDERED BY:</span>
              <h4 className="customer-name">{order.customer?.name || 'Valued Client'}</h4>
              <p className="customer-company">{order.customer?.company}</p>
              <p className="customer-contact">
                Phone / WhatsApp: <b>{order.customer?.phone}</b><br />
                {order.customer?.email && <>Email: {order.customer?.email}<br /></>}
              </p>
            </div>

            <div className="customer-col">
              <span className="section-mini-heading">DELIVERY DESTINATION:</span>
              <p className="customer-location">
                City: <b>{order.customer?.city}</b><br />
                {order.customer?.address ? order.customer?.address : 'Direct Dispatch / Karachi Factory Pickup'}
              </p>
              <span className="section-mini-heading" style={{ marginTop: '8px' }}>PAYMENT TERMS:</span>
              <p className="payment-terms-line">
                50% Advance with Purchase Order approval · 50% upon Dispatch.
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="receipt-table-wrapper">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Packaging Item & Specifications</th>
                  <th>Dimensions</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <b className="table-item-title">{item.title}</b>
                      <div className="table-item-desc">
                        <span>Board: {item.material}</span><br />
                        <span>Finish: {item.finish}</span>
                        {item.insert && item.insert !== 'No Insert (Standard Hollow Interior)' && (
                          <> · <span>Insert: {item.insert}</span></>
                        )}
                        {item.customNotes && (
                          <div className="item-note-sub">Note: {item.customNotes}</div>
                        )}
                      </div>
                    </td>
                    <td>{item.dimensions}</td>
                    <td><b>{item.quantity?.toLocaleString()}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total & Notes */}
            <div className="receipt-production-terms" style={{ width: '100%' }}>
              <span className="section-mini-heading">PRODUCTION & PROOFING NOTICE:</span>
              <ul>
                <li>Digital 3D die-line proof will be dispatched within 24 hours for print approval.</li>
                <li>Commercial color printing follows calibrated CMYK color reproduction standards.</li>
                <li>Orders are fabricated strictly to the confirmed dimensions and board grades.</li>
              </ul>
            </div>

          {/* Signatures / Authorized stamp */}
          <div className="receipt-signatures">
            <div>
              <div className="sign-line"></div>
              <span>Authorized Factory Signatory · Essa Packages</span>
            </div>
            <div>
              <div className="sign-line"></div>
              <span>Client Confirmation & Acceptance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
