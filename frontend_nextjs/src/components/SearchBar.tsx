"use client";

import React from "react";

interface SearchBarProps {
  // PUBLIC_INTERFACE
  /** Current input value. */
  value: string;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Submit handler called with the current value. */
  onSubmit: (value: string) => void;
  /** Button label (default "Search"). */
  buttonLabel?: string;
  /** Whether the search is disabled */
  disabled?: boolean;
}

/** PUBLIC_INTERFACE
 * SearchBar renders an input and button with proper focus and semantics.
 * Enhanced with disabled state support and improved accessibility.
 */
export function SearchBar({ 
  value, 
  placeholder = "Search...", 
  onSubmit, 
  buttonLabel = "Search",
  disabled = false 
}: SearchBarProps) {
  const [q, setQ] = React.useState(value);

  React.useEffect(() => {
    setQ(value);
  }, [value]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disabled) {
      onSubmit(q);
    }
  }

  return (
    <form 
      className="flex items-center gap-3" 
      onSubmit={handleSubmit} 
      role="search" 
      aria-label="Project search"
    >
      <label htmlFor="search-input" className="visually-hidden">
        Search projects
      </label>
      <input
        id="search-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          h-10 w-[220px] md:w-[280px] rounded-md border px-3 text-sm placeholder:text-slate-400 
          focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent
          transition-colors duration-200
          ${disabled 
            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' 
            : 'border-[var(--border-subtle)] bg-white'
          }
        `}
        aria-label={placeholder || "Search input"}
      />
      <button
        type="submit"
        disabled={disabled}
        className={`
          h-10 px-4 rounded-md text-white focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2
          transition-colors duration-200
          ${disabled
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-[var(--brand-accent)] hover:bg-[var(--brand-primary-hover)]'
          }
        `}
        aria-label={`${buttonLabel} projects`}
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export default SearchBar;
