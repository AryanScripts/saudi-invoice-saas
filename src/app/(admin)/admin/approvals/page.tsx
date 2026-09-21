'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ManualPayment, Profile, PlanTier } from '@/types';
import { formatRiyal } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building,
  CreditCard,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toastSuccess, toastError } from '@/components/ToastProvider';

interface PaymentWithUser extends ManualPayment {
  user_email?: string;
  user_company?: string;
}

export default function PaymentApprovalsPage() {
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Approval Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithUser | null>(null);
  const [targetTier, setTargetTier] = useState<PlanTier>('phase_2_default');
  const [grantPinPackage, setGrantPinPackage] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPayments = async () => {
    try {
      const supabase = createClient();
      const { data: pays, error } = await supabase
        .from('manual_payments')
        .select(`
          *,
          profile:profiles(email, company_name)
        `)
        .order('created_at', { ascending: false });

      if (!error && pays) {
        const formatted = pays.map((p: any) => ({
          ...p,
          user_email: p.profile?.email,
          user_company: p.profile?.company_name,
        }));
        setPayments(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleOpenApproveModal = (payment: PaymentWithUser) => {
    setSelectedPayment(payment);
    // Determine default tier suggestion based on amount
    if (payment.amount >= 640) {
      setTargetTier('phase_2_full');
    } else if (payment.amount >= 560) {
      setTargetTier('phase_2_default');
    } else {
      setTargetTier('phase_1');
    }
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status: 'approved',
          targetUserId: selectedPayment.user_id,
          newPlanTier: targetTier,
          grantPinPackage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Failed to approve', data.error_ar || 'فشل قبول الطلب');
        return;
      }

      toastSuccess(
        `Payment ${selectedPayment.receipt_reference} approved!`,
        `تم قبول الحوالة ${selectedPayment.receipt_reference} وتفعيل الباقة!`
      );
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          status: 'rejected',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Failed to reject', data.error_ar || 'فشل رفض الطلب');
        return;
      }

      toastSuccess('Payment marked as rejected', 'تم رفض طلب الدفع');
      fetchPayments();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Payment Approvals Queue | قائمة مراجعة الحوالات البنكية
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Verify domestic bank transfer receipts and activate ZATCA compliance tiers
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading payment submissions...
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No payment submissions recorded yet.
          </div>
        ) : (
          <Table className="border-slate-800 bg-slate-950">
            <TableHeader className="bg-slate-900 border-slate-800">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-300">Date | التاريخ</TableHead>
                <TableHead className="text-slate-300">Business | المنشأة</TableHead>
                <TableHead className="text-slate-300">Receipt Ref # | المرجع</TableHead>
                <TableHead className="text-slate-300">Amount | المبلغ</TableHead>
                <TableHead className="text-slate-300">Status | الحالة</TableHead>
                <TableHead className="text-right text-slate-300">Actions | إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} className="border-slate-800/60 hover:bg-slate-900/50">
                  <TableCell className="font-mono text-xs text-slate-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-white text-xs block">
                      {p.user_company || 'Business'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {p.user_email || p.user_id}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-indigo-400">
                    {p.receipt_reference}
                  </TableCell>
                  <TableCell className="font-mono font-extrabold text-emerald-400">
                    {formatRiyal(p.amount)}
                  </TableCell>
                  <TableCell>
                    {p.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle className="h-3 w-3" /> Approved
                      </span>
                    )}
                    {p.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    )}
                    {p.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        <XCircle className="h-3 w-3" /> Rejected
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleOpenApproveModal(p)}
                          className="h-8 text-xs"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve | قبول
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(p.id)}
                          className="h-8 text-xs"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject | رفض
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Reviewed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Approval Details Modal */}
      {selectedPayment && (
        <Dialog open={Boolean(selectedPayment)} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Approve Payment & Assign Tier | اعتماد الدفع وترقية الباقة
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                <div>Company: <span className="font-bold text-white">{selectedPayment.user_company}</span></div>
                <div>Receipt Ref: <span className="font-mono text-indigo-400 font-bold">{selectedPayment.receipt_reference}</span></div>
                <div>Amount: <span className="font-mono text-emerald-400 font-extrabold">{formatRiyal(selectedPayment.amount)}</span></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Assign Plan Tier | تحديد باقة الامتثال
                </label>
                <select
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value as PlanTier)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white text-xs"
                >
                  <option value="phase_1">Phase 1 Standard (480 ﷼)</option>
                  <option value="phase_2_default">Phase 2 Default (560 ﷼)</option>
                  <option value="phase_2_full">Phase 2 Full (640 ﷼)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-300">Grant PIN Deletion Access</span>
                <input
                  type="checkbox"
                  checked={grantPinPackage}
                  onChange={(e) => setGrantPinPackage(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button variant="emerald" onClick={handleApprove} isLoading={isProcessing}>
                Confirm Approval | تأكيد الاعتماد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
