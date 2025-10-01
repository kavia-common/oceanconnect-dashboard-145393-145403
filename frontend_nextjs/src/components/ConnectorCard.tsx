"use client";

import React from "react";
import Chip from "./Chip";

type StatusTone = "connected" | "disconnected";

interface ConnectorCardProps {
  // PUBLIC_INTERFACE
  /** Connector display name (e.g., JIRA). */
  name: string;
  /** Status tone controlling primary status chip color. */
  status: StatusTone;
  /** Optional meta chip text (e.g., "10 Projects", "Unknown"). */
  meta?: string;
  /** Description line for the connector. */
  description: string;
  /** Primary CTA configuration for the main action button. */
  cta: { label: string; onClick?: () => void; ariaLabel?: string };
  /** Optional secondary action (e.g., "Use API Token" or "View"). */
  secondaryCta?: { label: string; onClick?: () => void; ariaLabel?: string };
}

/** PUBLIC_INTERFACE
 * ConnectorCard renders an individual connector block with status, meta, description, and actions.
 */
export function ConnectorCard({ name, status, meta, description, cta, secondaryCta }: ConnectorCardProps) {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold">{name}</div>
        <div className="flex items-center gap-2">
          <Chip variant={status === "connected" ? "success" : "warning"}>
            {status === "connected" ? "Connected" : "Disconnected"}
          </Chip>
          {meta ? <Chip variant="neutral">{meta}</Chip> : null}
        </div>
      </div>
      <p className="text-[14px] text-[var(--text-secondary)]">{description}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={cta.ariaLabel || cta.label}
          onClick={cta.onClick}
          className="inline-flex h-8 px-3 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          {cta.label}
        </button>
        {secondaryCta ? (
          <button
            type="button"
            aria-label={secondaryCta.ariaLabel || secondaryCta.label}
            onClick={secondaryCta.onClick}
            className="inline-flex h-8 px-3 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-slate-50 focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            {secondaryCta.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default ConnectorCard;
