"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "../lib/api";
import { useToast } from "./ToastProvider";

type ConnectorKind = "jira" | "confluence";

interface TokenModalProps {
  // PUBLIC_INTERFACE
  /** Whether the modal is visible. */
  open: boolean;
  /** Which connector this modal is for. */
  connector: ConnectorKind;
  /** Close callback. */
  onClose: () => void;
  /** Called on successful submission to let parent refresh status. */
  onSuccess?: () => void;
}

/** PUBLIC_INTERFACE
 * TokenModal lets the user input an API Token/Personal Access Token for Jira or Confluence.
 * Enhanced with smooth animations, better form validation, accessibility, and toast notifications.
 */
export default function TokenModal({ open, connector, onClose, onSuccess }: TokenModalProps) {
  const [baseUrl, setBaseUrl] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const { showSuccess, showError, showLoading, dismiss } = useToast();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const firstInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setBaseUrl("");
      setEmail("");
      setToken("");
      setSubmitting(false);
      setErrors({});
      
      // Focus the first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const title = connector === "jira" ? "Connect Jira via API Token" : "Connect Confluence via API Token";
  const placeholder = connector === "jira" ? "Enter Jira API token / PAT" : "Enter Confluence API token / PAT";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!baseUrl.trim()) {
      newErrors.baseUrl = "Base URL is required";
    } else if (!baseUrl.match(/^https?:\/\/.+\..+/)) {
      newErrors.baseUrl = "Please enter a valid URL";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!token.trim()) {
      newErrors.token = "API token is required";
    } else if (token.length < 10) {
      newErrors.token = "API token seems too short";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      showError("Please correct the errors in the form");
      return;
    }

    setSubmitting(true);
    const loadingToast = showLoading(`Connecting to ${connector}...`);
    
    try {
      const path = connector === "jira" ? "/auth/jira/api-token" : "/auth/confluence/api-token";
      
      await apiPost(path, { 
        session_id: crypto.randomUUID(),
        base_url: baseUrl.trim(),
        email: email.trim(),
        api_token: token.trim(),
        token: token.trim() // for backward compatibility
      });
      
      dismiss(loadingToast);
      showSuccess(`${connector === "jira" ? "Jira" : "Confluence"} connected successfully!`);
      
      if (onSuccess) onSuccess();
      
      // Close after brief delay for UX
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      dismiss(loadingToast);
      const message = typeof err === "object" && err !== null && "message" in err
        ? (err as { message: string }).message
        : "Failed to save token";
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // Removed variants to fix TypeScript issues

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="token-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-xl border border-[var(--border-subtle)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <h3 id="token-modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              <motion.button
                type="button"
                aria-label="Close modal"
                className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Base URL */}
              <div className="space-y-2">
                <label htmlFor="base-url-input" className="block text-sm font-medium text-[var(--text-primary)]">
                  Atlassian Site URL *
                </label>
                <input
                  ref={firstInputRef}
                  id="base-url-input"
                  type="url"
                  required
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value);
                    if (errors.baseUrl) {
                      setErrors(prev => ({ ...prev, baseUrl: "" }));
                    }
                  }}
                  placeholder="https://your-domain.atlassian.net"
                  className={`
                    w-full h-10 rounded-md border px-3 text-sm placeholder:text-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent
                    transition-colors duration-200
                    ${errors.baseUrl ? 'border-red-300 bg-red-50' : 'border-[var(--border-subtle)]'}
                  `}
                  disabled={submitting}
                />
                <AnimatePresence>
                  {errors.baseUrl && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-red-600"
                    >
                      {errors.baseUrl}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email-input" className="block text-sm font-medium text-[var(--text-primary)]">
                  Email Address *
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="your-email@example.com"
                  className={`
                    w-full h-10 rounded-md border px-3 text-sm placeholder:text-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent
                    transition-colors duration-200
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-[var(--border-subtle)]'}
                  `}
                  disabled={submitting}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-red-600"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* API Token */}
              <div className="space-y-2">
                <label htmlFor="api-token-input" className="block text-sm font-medium text-[var(--text-primary)]">
                  API Token / Personal Access Token *
                </label>
                <input
                  id="api-token-input"
                  type="password"
                  required
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (errors.token) {
                      setErrors(prev => ({ ...prev, token: "" }));
                    }
                  }}
                  placeholder={placeholder}
                  className={`
                    w-full h-10 rounded-md border px-3 text-sm placeholder:text-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent
                    transition-colors duration-200
                    ${errors.token ? 'border-red-300 bg-red-50' : 'border-[var(--border-subtle)]'}
                  `}
                  disabled={submitting}
                />
                <AnimatePresence>
                  {errors.token && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs text-red-600"
                    >
                      {errors.token}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-slate-500">
                  Your credentials are sent securely to the backend and are not stored in any database.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="h-10 px-4 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-slate-50 focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {submitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border border-white/30 border-t-white rounded-full"
                        />
                        <span>Connecting...</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Connect
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
