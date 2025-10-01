"use client";

import React from "react";
import { motion } from "framer-motion";
import Chip from "./Chip";

interface ProjectCardProps {
  // PUBLIC_INTERFACE
  /** Project acronym for the blue badge. */
  code: string;
  /** Project title string. */
  title: string;
  /** Optional click handler for the project card */
  onClick?: () => void;
  /** Optional loading state */
  loading?: boolean;
}

/** PUBLIC_INTERFACE
 * ProjectCard renders a single project card with badge and title.
 * Enhanced with smooth animations, hover effects, and improved accessibility.
 */
export function ProjectCard({ code, title, onClick, loading = false }: ProjectCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);



  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        border border-[var(--border-subtle)] rounded-lg p-4 bg-[var(--surface-card)] 
        transition-all duration-200 relative overflow-hidden group shadow-sm hover:shadow-md
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2' : ''}
        ${loading ? 'pointer-events-none opacity-60' : ''}
      `}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open project ${title}` : undefined}
    >
      {/* Gradient background overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="flex items-center gap-3 relative z-10">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Chip 
            variant="info" 
            pill={false} 
            className="uppercase tracking-wide font-semibold shadow-sm"
          >
            {code}
          </Chip>
        </motion.div>
        
        <motion.div 
          className="text-[15px] font-medium text-[var(--text-primary)] truncate flex-1"
          initial={{ x: 0 }}
          animate={{ x: isHovered ? 2 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.div>

        {/* Arrow indicator on hover */}
        {onClick && (
          <motion.div
            className="text-[var(--brand-accent)] opacity-0 group-hover:opacity-100"
            initial={{ x: -10, opacity: 0 }}
            animate={{ 
              x: isHovered ? 0 : -10, 
              opacity: isHovered ? 1 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <motion.div
          className="absolute inset-0 bg-white/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border border-[var(--brand-accent)]/30 border-t-[var(--brand-accent)] rounded-full"
          />
        </motion.div>
      )}

      {/* Bottom border highlight */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-primary)] rounded-b-lg"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  );
}

export default ProjectCard;
