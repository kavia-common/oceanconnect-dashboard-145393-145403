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
}

/** PUBLIC_INTERFACE
 * SearchBar renders an input and button with proper focus and semantics.
 */
export function SearchBar({ value, placeholder = "Search...", onSubmit, buttonLabel = "Search" }: SearchBarProps) {
  const [q, setQ] = React.useState(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(q);
  }

  return (
    <form className="flex items-center gap-3" onSubmit={handleSubmit} role="search" aria-label="Project search">
      <label htmlFor="search-input" className="visually-hidden">
        Search projects
      </label>
      <input
        id="search-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-10 w-[220px] md:w-[280px] rounded-md border border-[var(--border-subtle)] px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent"
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="h-10 px-4 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export default SearchBar;
