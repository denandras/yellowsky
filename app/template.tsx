import type { ReactNode } from "react";

/**
 * Systematic page transition: this template remounts on every navigation,
 * replaying a subtle opacity-only fade (see .page-enter in globals.css).
 * Opacity only — a transform here would become the containing block for
 * position:fixed descendants (fixed heroes/headers) while it animates.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}