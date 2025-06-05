'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { message, type } = toast;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      iconClassName: 'text-green-500 dark:text-green-400'
    },
    error: {
      icon: XCircle,
      className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      iconClassName: 'text-red-500 dark:text-red-400'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      iconClassName: 'text-yellow-500 dark:text-yellow-400'
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      iconClassName: 'text-blue-500 dark:text-blue-400'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`
      max-w-sm w-full border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-right-full
      ${config.className}
    `}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconClassName}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Hook for easy toast usage
export const toast = {
  success: (message, duration) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message, type: 'success', duration } 
      }));
    }
  },
  error: (message, duration) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message, type: 'error', duration } 
      }));
    }
  },
  warning: (message, duration) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message, type: 'warning', duration } 
      }));
    }
  },
  info: (message, duration) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message, type: 'info', duration } 
      }));
    }
  }
};
