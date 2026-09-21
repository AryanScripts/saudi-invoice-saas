import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saudi Invoice SaaS | الفاتورة السعودية - ZATCA E-Invoicing',
  description: 'Production-ready ZATCA Phase 1 & 2 compliant e-invoicing SaaS platform for Saudi businesses with full TLV QR support and ﷼ currency standard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
