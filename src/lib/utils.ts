import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize a string for user-facing search comparisons:
 * - decompose + remove diacritics (accent-insensitive)
 * - recompose (NFKC)
 * - trim + collapse whitespace
 * - lowercase
 * - normalize common dash characters to ASCII hyphen-minus
 */
export const TABLE_ROW_HEIGHT = 44

export function normalizeSearch(s?: string | null) {
  if (!s) return ''
  return s
    .toString()
    // decompose so accents become separate marks, then strip them
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // recomposed for consistency
    .normalize('NFKC')
    .trim()
    .replace(/[\u2010-\u2015\u2212\u2012\u2013\u2014\u2011]/g, '-')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}
