'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Invoice, Profile } from '@/types';
import { formatRiyal } from '@/lib/utils';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Search,
  Receipt,
  QrCode,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { SecurityPinModal } from '@/components/modals/SecurityPinModal';
import { ZatcaQrCode } from '@/components/invoice/ZatcaQrCode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateInvoicePdfBlob } from '@/lib/pdf/generator';
import { toastSuccess, toastError } from '@/components/ToastProvider';

export default function InvoicesListPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Security PIN Modal State
  const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState<Invoice | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // View QR Modal State
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof as Profile);

      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (res.ok && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.client?.name?.toLowerCase().includes(q) ||
      inv.client?.name_ar?.toLowerCase().includes(q) ||
      inv.grand_total.toString().includes(q)
    );
  });

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
      toastSuccess('PDF downloaded', 'تم تحميل ملف الفاتورة PDF');
    } catch (err) {
      toastError('Failed to generate PDF', 'فشل إنشاء ملف PDF');
    }
  };

  const hasPinAccess = Boolean(
    profile?.is_super_admin ||
    profile?.pin_deletion_access_granted ||
    profile?.pin_package_purchased
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoices Management | إدارة الفواتير
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, download, and securely manage your ZATCA-compliant e-invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button variant="emerald" className="shadow-md">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Invoice | إنشاء فاتورة
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, client name, or amount..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredInvoices.length}</span> of {invoices.length} invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading invoices... | جاري تحميل الفواتير...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No invoices found | لم يتم العثور على فواتير</p>
            <p className="text-xs text-slate-400 mt-1">Try a different search or create a new invoice</p>
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
                <TableHead>Subtotal | المجموع</TableHead>
                <TableHead>VAT 15% | الضريبة</TableHead>
                <TableHead>Grand Total | الإجمالي</TableHead>
                <TableHead>QR Mode | المرحلة</TableHead>
                <TableHead className="text-right">Actions | إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
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
                  <TableCell className="font-mono text-slate-700">
                    {formatRiyal(inv.subtotal)}
                  </TableCell>
                  <TableCell className="font-mono text-amber-700">
                    {formatRiyal(inv.vat_total)}
                  </TableCell>
                  <TableCell className="font-mono font-extrabold text-emerald-700">
                    {formatRiyal(inv.grand_total)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {inv.qr_mode?.replace('_', ' ') || 'Phase 1'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewInvoice(inv)}
                        className="text-xs h-8 px-2"
                        title="View ZATCA QR Code | عرض رمز الاستجابة السريعة"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(inv)}
                        className="text-xs h-8 px-2"
                        title="Download PDF | تحميل الفاتورة"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoiceForDelete(inv);
                          setIsPinModalOpen(true);
                        }}
                        className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        title="Delete with PIN | حذف بالرمز السري"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Security PIN Deletion Modal */}
      {selectedInvoiceForDelete && (
        <SecurityPinModal
          isOpen={isPinModalOpen}
          onClose={() => {
            setIsPinModalOpen(false);
            setSelectedInvoiceForDelete(null);
          }}
          invoiceId={selectedInvoiceForDelete.id}
          invoiceNumber={selectedInvoiceForDelete.invoice_number}
          hasAccess={hasPinAccess}
          onSuccess={fetchInvoices}
        />
      )}

      {/* View QR Code Modal */}
      {previewInvoice && profile && (
        <Dialog open={Boolean(previewInvoice)} onOpenChange={() => setPreviewInvoice(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-bold text-slate-900">
                ZATCA QR Code | رمز هيئة الزكاة
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <ZatcaQrCode
                input={{
                  sellerName: profile.company_name,
                  vatNumber: profile.vat_number || '300000000000003',
                  timestamp: previewInvoice.issue_date,
                  invoiceTotal: previewInvoice.grand_total,
                  vatTotal: previewInvoice.vat_total,
                  invoiceHash: previewInvoice.zatca_hash || undefined,
                  ecdsaSignature: previewInvoice.ecdsa_signature || undefined,
                }}
                size={180}
                showDetails={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
