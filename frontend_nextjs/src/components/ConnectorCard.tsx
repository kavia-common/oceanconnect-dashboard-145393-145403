"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chip from "./Chip";

type StatusTone = "connected" | "disconnected" | "connecting";

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
  cta: { label: string; onClick?: () => void; ariaLabel?: string; loading?: boolean };
  /** Optional secondary action (e.g., "Use API Token" or "View"). */
  secondaryCta?: { label: string; onClick?: () => void; ariaLabel?: string; loading?: boolean };
  /** Whether the card is in a loading state */
  loading?: boolean;
}

/** PUBLIC_INTERFACE
 * ConnectorCard renders an individual connector block with status, meta, description, and actions.
 * Enhanced with smooth animations, loading states, and improved accessibility.
 */
export function ConnectorCard({ 
  name, 
  status, 
  meta, 
  description, 
  cta, 
  secondaryCta, 
  loading = false 
}: ConnectorCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const statusColor = React.useMemo(() => {
    switch (status) {
      case "connected":
        return "success";
      case "connecting":
        return "warning";
      case "disconnected":
      default:
        return "warning";
    }
  }, [status]);

  const statusLabel = React.useMemo(() => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
      default:
        return "Disconnected";
    }
  }, [status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="border border-[var(--border-subtle)] rounded-lg p-4 space-y-3 bg-white cursor-default focus-within:ring-2 focus-within:ring-[var(--focus-ring)] focus-within:ring-offset-2 shadow-sm hover:shadow-md"
      role="group"
      aria-labelledby={`connector-${name.toLowerCase()}-title`}
    >
      <div className="flex items-center justify-between">
        <div 
          id={`connector-${name.toLowerCase()}-title`}
          className="text-[15px] font-semibold"
        >
          {name}
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Chip variant={statusColor}>
                {statusLabel}
              </Chip>
            </motion.div>
          </AnimatePresence>
          {meta && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Chip variant="neutral">{meta}</Chip>
            </motion.div>
          )}
        </div>
      </div>
      
      <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
      
      <div className="flex items-center gap-2 pt-1">
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          aria-label={cta.ariaLabel || cta.label}
          onClick={cta.onClick}
          disabled={cta.loading || loading}
          className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <AnimatePresence mode="wait">
            {(cta.loading || loading) ? (
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
                  className="w-3 h-3 border border-white/30 border-t-white rounded-full"
                />
                <span>Loading...</span>
              </motion.div>
            ) : (
              <motion.span
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {cta.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        {secondaryCta && (
          <motion.button
            type="button"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            aria-label={secondaryCta.ariaLabel || secondaryCta.label}
            onClick={secondaryCta.onClick}
            disabled={secondaryCta.loading || loading}
            className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-slate-50 focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <AnimatePresence mode="wait">
              {(secondaryCta.loading || loading) ? (
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
                    className="w-3 h-3 border border-slate-400/30 border-t-slate-400 rounded-full"
                  />
                  <span>Loading...</span>
                </motion.div>
              ) : (
                <motion.span
                  key="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {secondaryCta.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--brand-accent)] rounded-b-lg"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  );
}

export default ConnectorCard;
