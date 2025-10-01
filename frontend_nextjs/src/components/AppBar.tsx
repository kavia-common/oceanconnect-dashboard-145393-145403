"use client";

import React from "react";

type AppBarAction = {
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
};

interface AppBarProps {
  // PUBLIC_INTERFACE
  /** App bar title text. */
  title: string;
  /** Right aligned action buttons. */
  actions?: AppBarAction[];
}

/** PUBLIC_INTERFACE
 * AppBar renders the fixed header with title and right-side actions using the Ocean Professional theme.
 */
export function AppBar({ title, actions = [] }: AppBarProps) {
  return (
    <header
      className="sticky top-0 z-40 w-full bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-sm"
      role="banner"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14 px-4 md:px-6">
        <h1 className="text-[18px] md:text-[20px] font-semibold" aria-label={title}>
          {title}
        </h1>
        <div className="flex items-center gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              aria-label={action.ariaLabel || action.label}
              onClick={action.onClick}
              className="h-8 px-3 rounded-md border border-[#90CAF9] text-white/90 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default AppBar;
