'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatRiyal } from '@/lib/utils';
import {
  ArrowLeft,
  Building,
  CreditCard,
  Copy,
  CheckCircle2,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toastSuccess, toastError } from '@/components/ToastProvider';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'phase_2_default';
  const amountParam = searchParams.get('amount') || '560';
  const amount = parseFloat(amountParam) || 560;

  const [receiptReference, setReceiptReference] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planTitles: Record<string, { en: string; ar: string }> = {
    phase_1: { en: 'Phase 1 Standard Plan', ar: 'باقة المرحلة الأولى القياسية' },
    phase_2_default: { en: 'Phase 2 Standard Plan', ar: 'باقة المرحلة الثانية المعتمدة' },
    phase_2_full: { en: 'Phase 2 Full Enterprise Plan', ar: 'باقة المرحلة الثانية الشاملة' },
    pin_package: { en: 'Master PIN Deletion Package', ar: 'باقة أمان حذف الفواتير بالرمز السري' },
  };

  const currentPlanInfo = planTitles[plan] || { en: 'Subscription Plan', ar: 'باقة الاشتراك' };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptReference.trim()) {
      toastError('Please enter transfer reference number', 'يرجى إدخال الرقم المرجعي للحوالة البنكية');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          receiptReference: receiptReference.trim(),
          packageType: plan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Submission failed', data.error_ar || 'فشل إرسال إثبات الدفع');
        return;
      }

      toastSuccess(
        'Payment submitted! Super Admin will review shortly.',
        'تم إرسال إشعار الدفع بنجاح! سيتم التفعيل بعد مراجعة المشرف العام.'
      );
      router.push('/subscription/status');
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/subscription">
          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Checkout & Bank Transfer | الدفع والتحويل البنكي
          </h1>
          <p className="text-xs text-slate-500">
            Complete manual payment transfer via Saudi domestic banks or STC Pay
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bank Account Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Selected Item | الباقة المختارة
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{currentPlanInfo.en}</p>
                <p className="text-xs text-slate-500" dir="rtl">{currentPlanInfo.ar}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-emerald-700 font-mono">
                  {formatRiyal(amount)}
                </span>
                <span className="text-[10px] text-slate-400 block">VAT Included | شامل الضريبة</span>
              </div>
            </div>
          </div>

          {/* Official Bank Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Official Saudi Bank Accounts | الحسابات البنكية الرسمية
              </h3>
            </div>

            {/* Bank 1: Al Rajhi */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-900">Al Rajhi Bank | مصرف الراجحي</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">Saudi Arabia</span>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <div>Beneficiary | المستفيد: <span className="font-semibold text-slate-900">Saudi Invoice Tech Est</span></div>
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-mono text-xs text-slate-900">SA4480000456608010123456</span>
                  <button
                    onClick={() => handleCopy('SA4480000456608010123456', 'rajhi')}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedField === 'rajhi' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'rajhi' ? 'Copied' : 'Copy IBAN'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bank 2: SNB */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-900">Saudi National Bank (SNB) | البنك الأهلي السعودي</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">Saudi Arabia</span>
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <div>Beneficiary | المستفيد: <span className="font-semibold text-slate-900">Saudi Invoice Tech Est</span></div>
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-mono text-xs text-slate-900">SA1210000001234567890123</span>
                  <button
                    onClick={() => handleCopy('SA1210000001234567890123', 'snb')}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedField === 'snb' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'snb' ? 'Copied' : 'Copy IBAN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Submission Form */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UploadCloud className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Submit Payment Proof | تأكيد التحويل
              </h3>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transfer Amount | المبلغ المحول
                </label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-700">
                  {formatRiyal(amount)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Receipt Reference # | الرقم المرجعي للإيصال *
                </label>
                <input
                  type="text"
                  value={receiptReference}
                  onChange={(e) => setReceiptReference(e.target.value)}
                  placeholder="e.g. TXN-984210984"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter the transaction ID or receipt reference from your bank app.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Super Admin verifies domestic receipts usually within 15–30 minutes.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                variant="emerald"
                isLoading={isSubmitting}
                className="w-full shadow-md"
              >
                Submit for Approval | إرسال للمراجعة
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
