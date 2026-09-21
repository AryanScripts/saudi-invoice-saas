'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ManualPayment, Profile } from '@/types';
import { formatRiyal } from '@/lib/utils';
import {
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function SubscriptionStatusPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/subscription');
        const data = await res.json();
        if (res.ok) {
          if (data.profile) setProfile(data.profile);
          if (data.payments) setPayments(data.payments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const hasPinAccess = Boolean(
    profile?.is_super_admin ||
    profile?.pin_deletion_access_granted ||
    profile?.pin_package_purchased
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Subscription & Payment Status | حالة الاشتراك والمدفوعات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor active plan compliance and manual transfer review status
          </p>
        </div>
        <Link href="/subscription">
          <Button variant="emerald">
            <Plus className="h-4 w-4 mr-1" />
            Upgrade / Renew | ترقية أو تجديد
          </Button>
        </Link>
      </div>

      {/* Current Tier Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Compliance Tier | الباقة المفعلة
            </span>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 capitalize block">
              {profile?.plan_tier?.replace('_', ' ') || 'Phase 1 Standard'}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Compliant with Saudi ZATCA e-invoicing standards
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status | الحالة:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active & Verified | نشط
            </span>
          </div>
        </div>

        {/* PIN Security Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Master PIN Deletion Protection | أمان الحذف
            </span>
            <Lock className="h-5 w-5 text-teal-600" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 block">
              {hasPinAccess ? 'Authorized | مفعل' : 'Not Activated | غير مفعل'}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              6-digit PIN required for permanent invoice deletion
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Add-on Status:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full border ${hasPinAccess ? 'text-teal-800 bg-teal-50 border-teal-200' : 'text-amber-800 bg-amber-50 border-amber-200'}`}>
              {hasPinAccess ? 'Active | مفعل' : 'Requires Upgrade'}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Payment History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Payment Proof Submissions | سجل طلبات التحويل البنكي
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading payments... | جاري تحميل السجل...
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            No manual bank transfer payments submitted yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date | التاريخ</TableHead>
                <TableHead>Receipt Reference | المرجع</TableHead>
                <TableHead>Amount | المبلغ</TableHead>
                <TableHead>Status | الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-slate-900">
                    {p.receipt_reference}
                  </TableCell>
                  <TableCell className="font-mono font-extrabold text-emerald-700">
                    {formatRiyal(p.amount)}
                  </TableCell>
                  <TableCell>
                    {p.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved | معتمد
                      </span>
                    )}
                    {p.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="h-3.5 w-3.5" /> Pending Review | قيد المراجعة
                      </span>
                    )}
                    {p.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        <XCircle className="h-3.5 w-3.5" /> Rejected | مرفوض
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
