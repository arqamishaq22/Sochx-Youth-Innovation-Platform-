import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Universal Non-blocking Floating Toast Notification System
 * Listens to 'sochx:toast' custom DOM events across the entire application.
 */
const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { type = 'info', message = '' } = e.detail || {};
      if (!message) return;

      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, type, message };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Limit to max 4 concurrent toasts

      // Auto dismiss after 5.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5500);
    };

    window.addEventListener('sochx:toast', handleToast);
    return () => {
      window.removeEventListener('sochx:toast', handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '440px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            role="alert"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: isError ? '#fef2f2' : isSuccess ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${isError ? '#fecaca' : isSuccess ? '#bbf7d0' : '#e2e8f0'}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              animation: 'sochxToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px', color: isError ? '#dc2626' : isSuccess ? '#16a34a' : '#6b21a8' }}>
              {isError ? <AlertTriangle size={20} /> : isSuccess ? <CheckCircle size={20} /> : <Info size={20} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isError ? '#991b1b' : isSuccess ? '#166534' : '#1e1b4b', marginBottom: '2px' }}>
                {isError ? 'System Notice: Server Offline' : isSuccess ? 'Success' : 'Notice'}
              </div>
              <div style={{ fontSize: '12px', lineHeight: 1.5, color: isError ? '#b91c1c' : isSuccess ? '#15803d' : '#475569' }}>
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              title="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
