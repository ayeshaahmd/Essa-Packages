import React, { createContext, useContext, useState, useEffect } from 'react';
import { PACKAGING_TYPES, MATERIALS, FINISHES, INSERTS, calculatePackagingEstimate } from '../types/packaging';

const OrderContext = createContext(null);

const DEFAULT_CONFIG = {
  boxType: 'fancy-carton',
  length: 14,
  width: 8,
  height: 22,
  unit: 'cm',
  material: 'ivory-board',
  finish: 'matte-laminate',
  insert: 'none',
  quantity: 1000,
  artworkStatus: 'ready',
  customNotes: ''
};

export function OrderProvider({ children }) {
  // Cart state persisted to localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('essa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [activeConfig, setActiveConfig] = useState(DEFAULT_CONFIG);

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('essa_orders');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeOrderForReceipt, setActiveOrderForReceipt] = useState(null);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [trackingSearchId, setTrackingSearchId] = useState('');

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('essa_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem('essa_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  const addToast = (message, type = 'success', duration = 3800) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (item) => {
    const newItem = {
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setCart(prev => [newItem, ...prev]);
    addToast(`Added "${newItem.title}" to your order list.`);
    setCartOpen(true);
  };

  const addSampleKitToCart = (sampleKit) => {
    const item = {
      id: `sample-${Date.now()}`,
      isSample: true,
      title: sampleKit.name,
      image: sampleKit.image,
      dimensions: 'Sample Kit (Standard)',
      material: 'Assorted Swatches (Ivory, Kraft, Corrugated, Finishes)',
      finish: 'Complete Finish Swatch Pack',
      insert: 'Included Template Sheet',
      quantity: 1,
      leadTime: 'Same Day Dispatch'
    };
    addToCart(item);
  };

  const addConfiguredBoxToCart = () => {
    const est = calculatePackagingEstimate(activeConfig);
    const item = {
      id: `custom-box-${Date.now()}`,
      isSample: false,
      title: est.typeObj.name,
      image: est.typeObj.image,
      dimensions: `${activeConfig.length} × ${activeConfig.width} × ${activeConfig.height} ${activeConfig.unit}`,
      material: est.matObj.name,
      finish: est.finObj.name,
      insert: est.insObj.name,
      quantity: activeConfig.quantity,
      leadTime: est.leadTime,
      artworkStatus: activeConfig.artworkStatus,
      customNotes: activeConfig.customNotes
    };
    addToCart(item);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    addToast('Item removed from order.', 'info');
  };

  const updateCartQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQty
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateActiveConfig = (fields) => {
    setActiveConfig(prev => ({ ...prev, ...fields }));
  };

  const loadPresetConfig = (preset) => {
    setActiveConfig(prev => ({
      ...prev,
      ...preset
    }));
    addToast(`Loaded ${preset.boxType ? 'packaging format' : 'configuration'} into Order Builder!`);
    const el = document.getElementById('order-builder');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const placeOrder = ({ customer, paymentMethod = 'Bank Transfer / WhatsApp Verification', notes = '' }) => {
    const orderId = `EP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer,
      items: [...cart],
      paymentMethod,
      notes,
      status: 'Order Received',
      estimatedDispatch: '7 - 10 Business Days'
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setCartOpen(false);
    setActiveOrderForReceipt(newOrder);
    setReceiptModalOpen(true);
    addToast(`Order ${orderId} created successfully!`, 'success');
    return newOrder;
  };

  const openOrderTracker = (orderId = '') => {
    setTrackingSearchId(orderId);
    setTrackerModalOpen(true);
  };

  const closeOrderTracker = () => {
    setTrackerModalOpen(false);
  };

  const openOrderReceipt = (order) => {
    setActiveOrderForReceipt(order);
    setReceiptModalOpen(true);
  };

  const closeOrderReceipt = () => {
    setReceiptModalOpen(false);
  };

  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <OrderContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        cartTotalAmount,
        cartTotalItems,
        activeConfig,
        updateActiveConfig,
        loadPresetConfig,
        addToCart,
        addSampleKitToCart,
        addConfiguredBoxToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        placeOrder,
        toasts,
        addToast,
        removeToast,
        receiptModalOpen,
        activeOrderForReceipt,
        openOrderReceipt,
        closeOrderReceipt,
        trackerModalOpen,
        trackingSearchId,
        openOrderTracker,
        closeOrderTracker
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
