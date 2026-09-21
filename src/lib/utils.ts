import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats monetary amounts with the Arabic Riyal symbol exclusively.
 * Strict system rule: NEVER output '$' or 'SAR'. Always output '... ﷼'.
 */
export function formatRiyal(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0.00 ﷼';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
  return `${formatted} ﷼`;
}

/**
 * Format date in standard YYYY-MM-DD format
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toISOString().split('T')[0];
}

/**
 * Generates an automatic invoice number
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomSuffix}`;
}
