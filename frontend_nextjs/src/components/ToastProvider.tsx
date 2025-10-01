"use client";

import React from "react";
import { Toaster, toast } from "react-hot-toast";

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showLoading: (message: string) => string;
  dismiss: (toastId: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

// PUBLIC_INTERFACE
/**
 * ToastProvider provides a global toast notification system using react-hot-toast
 * with Ocean Professional theme styling and consistent messaging.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const showSuccess = React.useCallback((message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#FFFFFF',
        color: '#1E293B',
        border: '1px solid #E2E8F0',
        borderLeft: '4px solid #22C55E',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      iconTheme: {
        primary: '#22C55E',
        secondary: '#FFFFFF',
      },
    });
  }, []);

  const showError = React.useCallback((message: string) => {
    toast.error(message, {
      duration: 6000,
      style: {
        background: '#FFFFFF',
        color: '#1E293B',
        border: '1px solid #E2E8F0',
        borderLeft: '4px solid #EF4444',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#FFFFFF',
      },
    });
  }, []);

  const showInfo = React.useCallback((message: string) => {
    toast(message, {
      duration: 4000,
      icon: '💡',
      style: {
        background: '#FFFFFF',
        color: '#1E293B',
        border: '1px solid #E2E8F0',
        borderLeft: '4px solid #1976D2',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    });
  }, []);

  const showLoading = React.useCallback((message: string) => {
    return toast.loading(message, {
      style: {
        background: '#FFFFFF',
        color: '#1E293B',
        border: '1px solid #E2E8F0',
        borderLeft: '4px solid #1976D2',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    });
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    toast.dismiss(toastId);
  }, []);

  const contextValue = React.useMemo(() => ({
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismiss,
  }), [showSuccess, showError, showInfo, showLoading, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {},
        }}
        containerStyle={{
          top: 80, // Below the app bar
        }}
      />
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
/**
 * Hook to access toast notifications throughout the application.
 * Provides methods for success, error, info, loading, and dismiss actions.
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
