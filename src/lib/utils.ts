import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize a string for user-facing search comparisons:
 * - NFKC normalization
 * - trim + collapse whitespace
 * - lowercase
 * - normalize common dash characters to ASCII hyphen-minus
 */
export function normalizeSearch(s?: string | null) {
  if (!s) return ''
  return s
    .toString()
    .normalize('NFKC')
    .trim()
    .replace(/[\u2010-\u2015\u2212\u2012\u2013\u2014\u2011]/g, '-')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}
