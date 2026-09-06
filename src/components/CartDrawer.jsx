import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { SAMPLE_KITS } from '../types/packaging';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartTotalAmount,
    cartTotalItems,
    removeFromCart,
    updateCartQuantity,
    addSampleKitToCart,
    placeOrder
  } = useOrder();

  const [customer, setCustomer] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: 'Karachi',
    address: ''
  });

  const [checkoutStep, setCheckoutStep] = useState('review'); // 'review' | 'checkout'
  const [orderMethod, setOrderMethod] = useState('whatsapp'); // 'whatsapp' | 'voucher'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && cartOpen) {
        setCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  const hasSampleKit = cart.some(item => item.isSample);

  const handleCustomerChange = (e) => {
    setCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      alert('Please provide your name and phone / WhatsApp number to process the order.');
      return;
    }

    setIsSubmitting(true);

    const newOrder = placeOrder({
      customer,
      paymentMethod: orderMethod === 'whatsapp' ? 'WhatsApp Direct Confirmation' : 'Official Proforma Voucher',
      notes: ''
    });

    if (orderMethod === 'whatsapp') {
      // Build nicely formatted WhatsApp text
      let text = `*NEW PACKAGING ORDER — ESSA PACKAGES*\n`;
      text += `*Order ID:* ${newOrder.id}\n`;
      text += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
      text += `*CUSTOMER DETAILS:*\n`;
      text += `• Name: ${customer.name}\n`;
      text += `• Company: ${customer.company || 'N/A'}\n`;
      text += `• Phone: ${customer.phone}\n`;
      text += `• City: ${customer.city}\n`;
      if (customer.address) text += `• Address: ${customer.address}\n`;
      text += `\n*ORDER ITEMS:* \n`;

      newOrder.items.forEach((item, index) => {
        text += `\n*#${index + 1} — ${item.title}*\n`;
        text += `• Quantity: ${item.quantity.toLocaleString()} units\n`;
        text += `• Dimensions: ${item.dimensions}\n`;
        text += `• Material: ${item.material}\n`;
        text += `• Finish: ${item.finish}\n`;
        if (item.insert && item.insert !== 'No Insert') text += `• Insert: ${item.insert}\n`;
        if (item.artworkStatus) text += `• Artwork: ${item.artworkStatus}\n`;
        if (item.customNotes) text += `• Notes: ${item.customNotes}\n`;
      });

      text += `\nPlease confirm my order production timeline and share invoice / banking details.`;

      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/923452801957?text=${encoded}`, '_blank');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="cart-drawer-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
      <aside className="cart-drawer-sheet" aria-label="Packaging Order Review">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <span className="cart-badge-count">{cart.length}</span>
            <div>
              <h3>Your Packaging Order</h3>
              <small>{cartTotalItems.toLocaleString()} total units configured</small>
            </div>
          </div>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-icon-box">📦</div>
            <h4>Your order is currently empty</h4>
            <p>Use our interactive 3D box customizer to build custom cartons, or order a tactile material sample kit.</p>
            <div className="empty-state-actions">
              <button
                className="button button-copper"
                onClick={() => {
                  setCartOpen(false);
                  const el = document.getElementById('order-builder');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Open 3D Box Customizer ↗
              </button>
              <button
                className="button button-sample"
                onClick={() => addSampleKitToCart(SAMPLE_KITS[0])}
              >
                Add Material Sample Kit
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-drawer-body">
            {checkoutStep === 'review' ? (
              <>
                {/* Cart Items List */}
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <article className="cart-item-card" key={item.id}>
                      <div className="cart-item-thumb">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="cart-item-content">
                        <div className="cart-item-head">
                          <h4>{item.title}</h4>
                          <button
                            className="cart-item-delete"
                            onClick={() => removeFromCart(item.id)}
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>

                        <div className="cart-item-specs">
                          <span className="spec-tag">{item.dimensions}</span>
                          <span className="spec-tag">{item.material}</span>
                          <span className="spec-tag">{item.finish}</span>
                          {item.insert && item.insert !== 'No Insert (Standard Hollow Interior)' && (
                            <span className="spec-tag">{item.insert}</span>
                          )}
                        </div>

                        {item.customNotes && (
                          <p className="cart-item-notes">Note: {item.customNotes}</p>
                        )}

                        <div className="cart-item-footer">
                          <div className="qty-stepper">
                            <button
                              onClick={() => {
                                const step = item.isSample ? 1 : 250;
                                updateCartQuantity(item.id, item.quantity - step);
                              }}
                            >
                              −
                            </button>
                            <span>{item.quantity.toLocaleString()}</span>
                            <button
                              onClick={() => {
                                const step = item.isSample ? 1 : 250;
                                updateCartQuantity(item.id, item.quantity + step);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Upsell Sample Kit if not present */}
                {!hasSampleKit && (
                  <div className="cart-sample-upsell">
                    <div className="upsell-icon">✨</div>
                    <div className="upsell-text">
                      <b>Need to verify paper feel first?</b>
                      <p>Add our physical Sample Kit with all board grades and foil swatches.</p>
                    </div>
                    <button
                      className="upsell-add-btn"
                      onClick={() => addSampleKitToCart(SAMPLE_KITS[0])}
                    >
                      + Add Sample Kit
                    </button>
                  </div>
                )}

                {/* Value Guarantee Notice */}
                <div className="cart-guarantee-strip">
                  <div>✓ <b>Free Die-Line Digital Proof</b> Included</div>
                  <div>✓ <b>100% Quality Inspection</b> Prior to Dispatch</div>
                </div>

                {/* Order Summary & Next Button */}
                <div className="cart-drawer-summary">
                  <div className="summary-line">
                    <span>Configured Items ({cart.length})</span>
                  </div>
                  <div className="summary-line">
                    <span>Plate & Die Setup</span>
                    <span className="free-tag">FREE</span>
                  </div>
                  <div className="summary-line">
                    <span>Pre-Production Digital 3D Mockup</span>
                    <span className="free-tag">FREE</span>
                  </div>

                  <button
                    className="button button-copper btn-checkout-next"
                    onClick={() => setCheckoutStep('checkout')}
                  >
                    Proceed to Customer & Shipping Details ↗
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Customer Details & Order Dispatch Method */
              <form className="cart-checkout-form" onSubmit={handleCheckoutSubmit}>
                <div className="checkout-step-header">
                  <button
                    type="button"
                    className="back-link-btn"
                    onClick={() => setCheckoutStep('review')}
                  >
                    ← Back to Order Review
                  </button>
                  <h4>Customer & Delivery Details</h4>
                  <p>Where should we dispatch your packaging and send digital die-line proofs?</p>
                </div>

                <div className="checkout-fields-grid">
                  <label>
                    <span>Full Name *</span>
                    <input
                      required
                      name="name"
                      placeholder="e.g. Imran / Sarah Khan"
                      value={customer.name}
                      onChange={handleCustomerChange}
                    />
                  </label>

                  <label>
                    <span>Company / Brand Name *</span>
                    <input
                      required
                      name="company"
                      placeholder="e.g. Bloom Organics Ltd."
                      value={customer.company}
                      onChange={handleCustomerChange}
                    />
                  </label>

                  <label>
                    <span>Phone / WhatsApp Number *</span>
                    <input
                      required
                      type="tel"
                      name="phone"
                      placeholder="e.g. 0345 2801957"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                    />
                  </label>

                  <label>
                    <span>Email Address (for invoice & proofs)</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="orders@yourbrand.com"
                      value={customer.email}
                      onChange={handleCustomerChange}
                    />
                  </label>

                  <label>
                    <span>Destination City *</span>
                    <select
                      name="city"
                      value={customer.city}
                      onChange={handleCustomerChange}
                    >
                      <option value="Karachi">Karachi (Direct Factory Delivery / Pickup)</option>
                      <option value="Lahore">Lahore (Courier / Cargo Transit)</option>
                      <option value="Islamabad / Rawalpindi">Islamabad / Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Multan">Multan</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Other City (Pakistan)">Other City (Pakistan)</option>
                      <option value="International Export">International Export</option>
                    </select>
                  </label>

                  <label className="full-width">
                    <span>Factory / Office Delivery Address (Optional)</span>
                    <input
                      name="address"
                      placeholder="Street address, Sector, Industrial Area"
                      value={customer.address}
                      onChange={handleCustomerChange}
                    />
                  </label>
                </div>

                {/* Dispatch Method Selection */}
                <div className="dispatch-method-selector">
                  <label className="section-sub-label">Select Order Confirmation Channel:</label>
                  
                  <div
                    className={`method-option-card ${orderMethod === 'whatsapp' ? 'selected' : ''}`}
                    onClick={() => setOrderMethod('whatsapp')}
                  >
                    <div className="method-radio">
                      <span className={orderMethod === 'whatsapp' ? 'checked' : ''}></span>
                    </div>
                    <div className="method-text">
                      <div className="method-title-row">
                        <b>Direct WhatsApp Instant Dispatch</b>
                        <span className="badge-fast">Fastest · Recommended</span>
                      </div>
                      <p>Immediately sends order specs to Imran Ahmed (0345 2801957) with complete details for swift confirmation.</p>
                    </div>
                  </div>

                  <div
                    className={`method-option-card ${orderMethod === 'voucher' ? 'selected' : ''}`}
                    onClick={() => setOrderMethod('voucher')}
                  >
                    <div className="method-radio">
                      <span className={orderMethod === 'voucher' ? 'checked' : ''}></span>
                    </div>
                    <div className="method-text">
                      <b>Generate Official Invoice / Voucher</b>
                      <p>Generates a formal printable packaging order voucher with Order Reference ID and bank transfer instructions.</p>
                    </div>
                  </div>
                </div>

                <div className="checkout-action-footer">
                  <button
                    type="submit"
                    className="button button-copper btn-place-order"
                    disabled={isSubmitting}
                  >
                    {orderMethod === 'whatsapp' ? 'Dispatch Order on WhatsApp ↗' : 'Generate Official Order Voucher ↗'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
