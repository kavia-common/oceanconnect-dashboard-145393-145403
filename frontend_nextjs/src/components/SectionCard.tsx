import React from "react";

interface SectionCardProps {
  // PUBLIC_INTERFACE
  /** Title for the section. */
  title: string;
  /** Optional right-aligned header slot (e.g., SearchBar). */
  actionsSlot?: React.ReactNode;
  /** Section content. */
  children: React.ReactNode;
}

/** PUBLIC_INTERFACE
 * SectionCard is a generic white card container with title and optional actions slot.
 */
export function SectionCard({ title, actionsSlot, children }: SectionCardProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {actionsSlot}
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
