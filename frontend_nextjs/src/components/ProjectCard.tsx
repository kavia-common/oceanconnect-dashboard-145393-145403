import React from "react";
import Chip from "./Chip";

interface ProjectCardProps {
  // PUBLIC_INTERFACE
  /** Project acronym for the blue badge. */
  code: string;
  /** Project title string. */
  title: string;
}

/** PUBLIC_INTERFACE
 * ProjectCard renders a single project card with badge and title.
 */
export function ProjectCard({ code, title }: ProjectCardProps) {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg p-4 bg-[var(--surface-card)] hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <Chip variant="info" pill={false} className="uppercase tracking-wide">{code}</Chip>
        <div className="text-[15px] font-medium text-[var(--text-primary)]">{title}</div>
      </div>
    </div>
  );
}

export default ProjectCard;
