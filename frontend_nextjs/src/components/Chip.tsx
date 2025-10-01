"use client";

import React from "react";

type ChipVariant = "success" | "warning" | "neutral" | "info";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  // PUBLIC_INTERFACE
  /** Chip content label. */
  children: React.ReactNode;
  /** Visual variant for color coding. */
  variant?: ChipVariant;
  /** Use pill rounded style (default true). */
  pill?: boolean;
}

/** PUBLIC_INTERFACE
 * Chip renders a small label/badge for statuses and meta information.
 */
export function Chip({ children, variant = "neutral", pill = true, className = "", ...rest }: ChipProps) {
  const base = "inline-flex items-center h-6 px-2 text-[11px] font-semibold";
  const rounded = pill ? "rounded-full" : "rounded-md";
  const color =
    variant === "success"
      ? "bg-[var(--chip-green)] text-[var(--chip-green-text)]"
      : variant === "warning"
      ? "bg-[var(--chip-orange)] text-[var(--chip-orange-text)]"
      : variant === "info"
      ? "bg-[var(--chip-blue)] text-[var(--chip-blue-text)]"
      : "bg-slate-100 text-slate-700 font-medium";

  return (
    <span className={`${base} ${rounded} ${color} ${className}`} {...rest}>
      {children}
    </span>
  );
}

export default Chip;
