import React from 'react';
import { useOrder } from '../context/OrderContext';

export function ToastContainer() {
  const { toasts, removeToast } = useOrder();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-card toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ' : '⚠'}
          </span>
          <p className="toast-message">{toast.message}</p>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
