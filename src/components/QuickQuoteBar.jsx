import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';

export function QuickQuoteBar({ onOpenQuote }) {
  const { cart, setCartOpen } = useOrder();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 450);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside className="quick-action-dock" aria-label="Quick Action Floating Bar">
      <div className="dock-inner">
        <div className="dock-left">
          <span className="dock-pulse"></span>
          <div className="dock-text">
            <b>Ready to start your project?</b>
            <small>Direct manufacturing & custom specs</small>
          </div>
        </div>

        <div className="dock-actions">
          <button className="button button-small button-copper" onClick={onOpenQuote}>
            Request Quote ↗
          </button>

          <button
            className="dock-cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={`View Cart with ${cart.length} items`}
          >
            <span>🛒 Order</span>
            {cart.length > 0 && <span className="dock-cart-badge">{cart.length}</span>}
          </button>

          <a
            href="https://wa.me/923452801957?text=Hello%20Imran,%20I%20would%20like%20to%20discuss%20a%20custom%20packaging%20project."
            target="_blank"
            rel="noreferrer"
            className="dock-wa-btn"
            title="Chat directly on WhatsApp"
          >
            <span>💬</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
