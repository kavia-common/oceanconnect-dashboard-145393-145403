import React from "react";
import Link from "next/link";

// PUBLIC_INTERFACE
/**
 * Custom 404 page with Ocean Professional theme styling and helpful navigation.
 */
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">404</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Page Not Found
        </h1>

        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back to the dashboard where you can manage your integrations.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            Go to Dashboard
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-slate-50 focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors duration-200"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-[var(--border-subtle)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Need Help?
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            If you believe this is an error, please check the URL or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
