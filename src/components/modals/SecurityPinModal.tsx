'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, KeyRound, Lock } from 'lucide-react';
import { toastSuccess, toastError } from '@/components/ToastProvider';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  hasAccess: boolean;
  onSuccess: () => void;
}

export function SecurityPinModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  hasAccess,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  hasAccess: boolean;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) {
      toastError('PIN must be 6 digits', 'يجب أن يتكون الرمز السري من 6 أرقام');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/invoices/delete-with-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(
          data.error || 'Failed to delete invoice',
          data.error_ar || 'فشل حذف الفاتورة'
        );
        return;
      }

      toastSuccess(
        `Invoice ${invoiceNumber} deleted permanently`,
        `تم حذف الفاتورة ${invoiceNumber} نهائياً`
      );
      setPin('');
      onClose();
      onSuccess();
    } catch (err) {
      toastError('Network error occurred', 'حدث خطأ في الاتصال بالشبكة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Lock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-900">
            Delete Invoice with Master PIN | حذف الفاتورة بالرمز السري
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 mt-1">
            ZATCA compliance strictly requires a 6-digit Master Security PIN to delete invoice <span className="font-semibold text-slate-900">{invoiceNumber}</span>.
            <br />
            <span className="text-xs text-slate-400 font-normal" dir="rtl">
              يتطلب الامتثال لهيئة الزكاة والضريبة إدخال رمز الأمان السري المكون من 6 أرقام لحذف هذه الفاتورة.
            </span>
          </DialogDescription>
        </DialogHeader>

        {!hasAccess ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Feature Locked | الميزة مقفلة</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  You need the PIN Deletion Security Package to permanently delete invoices.
                </p>
                <p className="text-xs text-amber-800 mt-0.5 text-right font-medium" dir="rtl">
                  تحتاج إلى شراء باقة أمان حذف الفواتير بالرمز السري للتمكن من حذف الفواتير.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  window.location.href = '/subscription';
                }}
                className="bg-white hover:bg-amber-100 text-amber-900 border-amber-300"
              >
                Upgrade Plan | ترقية الباقة
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                6-Digit Master Security PIN | الرمز السري الرئيسي (6 أرقام)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 transition-all"
                  autoFocus
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-center">
                Default initial PIN is 123456 (can be customized in Settings)
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel | إلغاء
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isLoading}
                disabled={pin.length !== 6 || isLoading}
              >
                Authorize & Delete | تأكيد وحذف
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
