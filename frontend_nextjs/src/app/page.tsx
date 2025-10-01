"use client";

import React from "react";
import ClientOnly from "../components/ClientOnly";

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Use basic dashboard to avoid SSR issues
const BasicDashboard = React.lazy(() => import("../components/BasicDashboard"));

export default function Home() {
  return (
    <ClientOnly
      fallback={
        <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <React.Suspense
        fallback={
          <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </main>
        }
      >
        <BasicDashboard />
      </React.Suspense>
    </ClientOnly>
  );
}
