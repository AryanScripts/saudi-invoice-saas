'use client';

import React from 'react';
import { Toaster, toast } from 'sonner';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        theme="light"
        toastOptions={{
          className: 'font-sans text-sm rounded-xl shadow-lg border',
          duration: 4000,
        }}
      />
    </>
  );
}

/**
 * Dispatches a bilingual Success notification
 */
export function toastSuccess(enMessage: string, arMessage: string) {
  toast.success(
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-emerald-950">{enMessage}</span>
      <span className="text-xs text-emerald-800 font-medium text-right" dir="rtl">{arMessage}</span>
    </div>
  );
}

/**
 * Dispatches a bilingual Error notification
 */
export function toastError(enMessage: string, arMessage: string) {
  toast.error(
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-rose-950">{enMessage}</span>
      <span className="text-xs text-rose-800 font-medium text-right" dir="rtl">{arMessage}</span>
    </div>
  );
}

/**
 * Dispatches a bilingual Warning notification
 */
export function toastWarning(enMessage: string, arMessage: string) {
  toast.warning(
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-amber-950">{enMessage}</span>
      <span className="text-xs text-amber-800 font-medium text-right" dir="rtl">{arMessage}</span>
    </div>
  );
}

/**
 * Dispatches a bilingual Info / Processing notification
 */
export function toastInfo(enMessage: string, arMessage: string) {
  toast.info(
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-slate-900">{enMessage}</span>
      <span className="text-xs text-slate-600 font-medium text-right" dir="rtl">{arMessage}</span>
    </div>
  );
}

export { toast };
