"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Type of skeleton to render */
  type?: "card" | "connector" | "project";
  /** Custom className for the skeleton */
  className?: string;
}

// Shimmer animation component
const ShimmerEffect = () => (
  <motion.div
    initial={{ x: "-100%" }}
    animate={{ x: "100%" }}
    transition={{
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
  />
);

// Skeleton element with shimmer
const SkeletonElement = ({ className }: { className: string }) => (
  <div className={`${className} relative overflow-hidden`}>
    <ShimmerEffect />
  </div>
);

// PUBLIC_INTERFACE
/**
 * SkeletonLoader provides loading placeholders with smooth animations
 * to improve perceived performance during data fetching.
 */
export function SkeletonLoader({ count = 3, type = "card", className = "" }: SkeletonLoaderProps) {
  const SkeletonCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-lg border border-[var(--border-subtle)] p-4 overflow-hidden ${className}`}
    >
      {type === "connector" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <SkeletonElement className="h-4 bg-slate-200 rounded w-16" />
            <div className="flex gap-2">
              <SkeletonElement className="h-6 bg-slate-200 rounded-full w-20" />
              <SkeletonElement className="h-6 bg-slate-200 rounded-full w-16" />
            </div>
          </div>
          <SkeletonElement className="h-3 bg-slate-200 rounded w-full mb-2" />
          <SkeletonElement className="h-3 bg-slate-200 rounded w-3/4 mb-3" />
          <SkeletonElement className="h-8 bg-slate-200 rounded w-20" />
        </>
      )}

      {type === "project" && (
        <div className="flex items-center gap-3">
          <SkeletonElement className="h-6 bg-slate-200 rounded w-12" />
          <SkeletonElement className="h-4 bg-slate-200 rounded flex-1" />
        </div>
      )}

      {type === "card" && (
        <>
          <SkeletonElement className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
          <SkeletonElement className="h-3 bg-slate-200 rounded w-full mb-2" />
          <SkeletonElement className="h-3 bg-slate-200 rounded w-2/3" />
        </>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
