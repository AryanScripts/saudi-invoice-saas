'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuditLog, Profile, ManualPayment } from '@/types';
import { formatRiyal } from '@/lib/utils';
import {
  ShieldCheck,
  Building,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function AdminDashboardPage() {
  const [totalBusinesses, setTotalBusinesses] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<ManualPayment[]>([]);
  const [pinOverridesCount, setPinOverridesCount] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const supabase = createClient();

        // Total Businesses (exclude super admins)
        const { count: totalBusinessesCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .or('is_super_admin.is.null,is_super_admin.eq.false');
        if (totalBusinessesCount !== null && totalBusinessesCount !== undefined) {
          setTotalBusinesses(totalBusinessesCount);
        }

        // Fetch pending payments
        const { data: pays } = await supabase
          .from('manual_payments')
          .select('*')
          .eq('status', 'pending');
        if (pays) setPendingPayments(pays as ManualPayment[]);

        // Security Overrides (exclude super admins)
        const { count: pinOverrideCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('pin_deletion_access_granted', true)
          .or('is_super_admin.is.null,is_super_admin.eq.false');
        if (pinOverrideCount !== null && pinOverrideCount !== undefined) {
          setPinOverridesCount(pinOverrideCount);
        }

        // 4. Fetch audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (logs) setAuditLogs(logs as AuditLog[]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          Kingdom Super Administration | الإدارة العامة للنظام
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Super Admin Master Dashboard | لوحة التحكم الإدارية
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time oversight over registered businesses, approvals, and compliance audit logs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Businesses */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Businesses | المنشآت
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white font-mono">
              {totalBusinesses}
            </span>
            <p className="text-xs text-slate-500 mt-1">Active enterprise accounts (excl. Super Admin)</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Payments | طلبات الدفع
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {pendingPayments.length}
            </span>
            <p className="text-xs text-slate-500 mt-1">Awaiting bank verification</p>
          </div>
        </div>

        {/* Security Overrides */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Security Overrides | الاستثناءات
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {pinOverridesCount}
            </span>
            <p className="text-xs text-slate-500 mt-1">PIN delete override granted</p>
          </div>
        </div>

        {/* Quick Review Link */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-950 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase">Action Queue</span>
            <h4 className="font-bold text-white text-sm mt-1">Pending Payment Approvals</h4>
          </div>
          <Link
            href="/admin/approvals"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Review Queue | مراجعة الطلبات <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Audit Trail Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Live Audit Logs & Security Events | سجل الرقابة والأمان
              </h3>
              <p className="text-xs text-slate-400">
                Immutable security records of invoice deletions, logins, and administrative overrides
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading security audit trail...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No audit events recorded yet.
          </div>
        ) : (
          <Table className="border-slate-800 bg-slate-950">
            <TableHeader className="bg-slate-900 border-slate-800">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-300">Timestamp | الوقت</TableHead>
                <TableHead className="text-slate-300">Action Type | نوع الإجراء</TableHead>
                <TableHead className="text-slate-300">Details | التفاصيل</TableHead>
                <TableHead className="text-slate-300">Target ID | المعرف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="border-slate-800/60 hover:bg-slate-900/50">
                  <TableCell className="font-mono text-xs text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {log.action_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-200">
                    {log.details}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-400">
                    {log.target_id ? log.target_id.substring(0, 8) + '...' : '—'}
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
