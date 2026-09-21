'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Invoice, Profile } from '@/types';
import { formatRiyal } from '@/lib/utils';
import {
  FileText,
  TrendingUp,
  Receipt,
  ShieldCheck,
  Plus,
  Users,
  Package,
  ArrowUpRight,
  Download,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { generateInvoicePdfBlob } from '@/lib/pdf/generator';
import { toastSuccess, toastError } from '@/components/ToastProvider';

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientCount, setClientCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 1. Profile
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (prof) setProfile(prof as Profile);

          // 2. Invoices with client & items
          const { data: invs } = await supabase
            .from('invoices')
            .select('*, client:clients(name, name_ar, vat_number), items:invoice_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (invs) setInvoices(invs as Invoice[]);

          // 3. Client & Product count
          const { count: cCount } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (cCount !== null) setClientCount(cCount);

          const { count: pCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (pCount !== null) setProductCount(pCount);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.grand_total || 0), 0);
  const totalVat = invoices.reduce((acc, inv) => acc + Number(inv.vat_total || 0), 0);

  const handleDownloadPdf = async (invoice: Invoice) => {
    if (!profile) return;
    try {
      const blob = await generateInvoicePdfBlob({
        invoice,
        profile,
        client: invoice.client,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('PDF generated successfully', 'تم إنشاء الفاتورة بصيغة PDF بنجاح');
    } catch (err) {
      toastError('Failed to generate PDF', 'فشل إنشاء ملف PDF');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            ZATCA Phase Compliant • المملكة العربية السعودية
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {profile?.company_name || 'Business Dashboard'}
            {profile?.company_name_ar ? ` | ${profile.company_name_ar}` : ''}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            VAT Number | الرقم الضريبي: <span className="font-mono text-emerald-300 font-semibold">{profile?.vat_number || '300000000000003'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/invoices/new">
            <Button variant="emerald" size="md" className="shadow-lg shadow-emerald-500/20">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Invoice | إنشاء فاتورة
            </Button>
          </Link>
          <Link href="/subscription">
            <Button variant="outline" size="md" className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700">
              Active Plan: <span className="font-bold ml-1 text-emerald-400 uppercase">{profile?.plan_tier?.replace('_', ' ') || 'Phase 1'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue | إجمالي المبيعات
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {formatRiyal(totalRevenue)}
            </span>
            <p className="text-xs text-slate-400 mt-1">All invoices issued to date</p>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Invoices | عدد الفواتير
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {invoices.length}
            </span>
            <p className="text-xs text-slate-400 mt-1">Compliant tax invoices</p>
          </div>
        </div>

        {/* VAT Collected */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              15% VAT Total | ضريبة القيمة المضافة
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {formatRiyal(totalVat)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Standard 15% tax collected</p>
          </div>
        </div>

        {/* Security & Access */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Security PIN Access | حذف الفواتير
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {Boolean(profile?.pin_deletion_access_granted || profile?.pin_package_purchased) ? 'Active | مفعل' : 'Add-on Required'}
            </span>
            <p className="text-xs text-slate-400 mt-2">6-digit PIN deletion policy</p>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/clients" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-500/50 hover:shadow-sm transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Manage Clients | إدارة العملاء</h4>
              <p className="text-xs text-slate-500">{clientCount} registered clients</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link href="/products" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-500/50 hover:shadow-sm transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Products Catalog | قائمة المنتجات</h4>
              <p className="text-xs text-slate-500">{productCount} items with 15% VAT</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </Link>

        <Link href="/subscription" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-500/50 hover:shadow-sm transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Subscription Status | حالة الباقة</h4>
              <p className="text-xs text-slate-500">Tier upgrades & bank receipts</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
        </Link>
      </div>

      {/* Recent Invoices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Invoices | أحدث الفواتير
            </h3>
            <p className="text-xs text-slate-500">
              Latest generated tax invoices with ZATCA QR codes
            </p>
          </div>
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              View All Invoices | عرض كافة الفواتير
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading invoices data... | جاري تحميل البيانات...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No invoices created yet | لا توجد فواتير بعد</p>
            <p className="text-xs text-slate-400 mt-1">Create your first ZATCA-compliant invoice now</p>
            <Link href="/invoices/new" className="inline-block mt-4">
              <Button variant="emerald" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Create Invoice | إنشاء فاتورة
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice # | رقم الفاتورة</TableHead>
                <TableHead>Client | العميل</TableHead>
                <TableHead>Date | التاريخ</TableHead>
                <TableHead>Total (with VAT) | الإجمالي</TableHead>
                <TableHead>Status | الحالة</TableHead>
                <TableHead className="text-right">Actions | إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.slice(0, 5).map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-bold text-slate-900">
                    {inv.invoice_number}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-800">
                      {inv.client?.name || 'Cash Customer | عميل نقدي'}
                    </span>
                    {inv.client?.name_ar && (
                      <span className="block text-[11px] text-slate-500">{inv.client.name_ar}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-600">
                    {inv.issue_date}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-emerald-700">
                    {formatRiyal(inv.grand_total)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(inv)}
                      className="text-xs h-8"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      PDF
                    </Button>
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
