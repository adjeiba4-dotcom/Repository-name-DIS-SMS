import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely.
 * Prefer this helper for new components; existing UI kit may still use clsx directly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
