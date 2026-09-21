'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Client, Product, Profile, PlanTier } from '@/types';
import { formatRiyal, generateInvoiceNumber } from '@/lib/utils';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Receipt,
  QrCode,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZatcaQrCode } from '@/components/invoice/ZatcaQrCode';
import { toastSuccess, toastError } from '@/components/ToastProvider';

interface LineItemForm {
  description: string;
  descriptionAr: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [qrMode, setQrMode] = useState<PlanTier>('phase_1');
  const [items, setItems] = useState<LineItemForm[]>([
    { description: 'Professional Services', descriptionAr: 'خدمات مهنية واستشارية', quantity: 1, unitPrice: 1000, vatRate: 15 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());

    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) {
        setProfile(prof as Profile);
        setQrMode(prof.plan_tier || 'phase_1');
      }

      const { data: cls } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      if (cls) setClients(cls as Client[]);

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      if (prods) setProducts(prods as Product[]);
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: '', descriptionAr: '', quantity: 1, unitPrice: 0, vatRate: 15 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toastError('Invoice must contain at least 1 item', 'يجب أن تحتوي الفاتورة على صنف واحد على الأقل');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItemForm, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        description: prod.name,
        descriptionAr: prod.name_ar || '',
        unitPrice: Number(prod.unit_price),
        vatRate: Number(prod.vat_rate),
      };
      setItems(updated);
    }
  };

  // Calculate live financial totals
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const vatTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.vatRate / 100)), 0);
  const grandTotal = subtotal + vatTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.description || i.quantity <= 0)) {
      toastError('Please fill in all item descriptions and valid quantities', 'يرجى ملء وصف جميع الأصناف والكميات الصحيحة');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId || null,
          invoiceNumber,
          issueDate,
          dueDate,
          qrMode,
          items,
          status: 'paid',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Failed to create invoice', data.error_ar || 'فشل إنشاء الفاتورة');
        return;
      }

      toastSuccess(
        `Invoice ${invoiceNumber} created successfully!`,
        `تم إصدار الفاتورة ${invoiceNumber} بنجاح!`
      );
      router.push('/invoices');
      router.refresh();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create ZATCA Tax Invoice | إنشاء فاتورة ضريبية
            </h1>
            <p className="text-xs text-slate-500">
              Generate compliant tax invoice with live QR TLV calculation in ﷼
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="emerald"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="shadow-md"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Issue Invoice | إصدار الفاتورة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Invoice Details | بيانات الفاتورة</span>
              <span className="text-xs font-mono text-emerald-600 font-semibold">{invoiceNumber}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Client | اختيار العميل
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Cash Customer (Walk-in) | عميل نقدي</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.name_ar ? `(${c.name_ar})` : ''} - {c.vat_number || 'No VAT'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Invoice Number | رقم الفاتورة
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Issue Date | تاريخ الإصدار
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Due Date | تاريخ الاستحقاق
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Line Items | بنود وأصناف الفاتورة
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs h-8 text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item | إضافة صنف
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Item #{idx + 1}
                    </span>
                    {products.length > 0 && (
                      <select
                        onChange={(e) => handleSelectProduct(idx, e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Load from catalog... | اختر من المنتجات</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatRiyal(p.unit_price)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Description (EN) *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        required
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 text-right" dir="rtl">
                        الوصف (بالعربي)
                      </label>
                      <input
                        type="text"
                        value={item.descriptionAr}
                        onChange={(e) => handleItemChange(idx, 'descriptionAr', e.target.value)}
                        placeholder="وصف الصنف"
                        dir="rtl"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Quantity | الكمية
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Unit Price | السعر (﷼)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        VAT Rate | الضريبة (%)
                      </label>
                      <input
                        type="number"
                        value={item.vatRate}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-mono text-slate-600"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total | المجموع</span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {formatRiyal((item.quantity * item.unitPrice) * 1.15)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Financials & ZATCA QR Preview */}
        <div className="space-y-6">
          {/* Live Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Financial Summary | ملخص المبالغ
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal | المجموع الفرعي:</span>
                <span className="font-mono font-semibold text-slate-800">{formatRiyal(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>VAT 15% | ضريبة القيمة المضافة:</span>
                <span className="font-mono font-semibold text-amber-700">{formatRiyal(vatTotal)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900">Grand Total | المجموع الكلي:</span>
                <span className="font-mono font-extrabold text-base text-emerald-700">
                  {formatRiyal(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="emerald"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="w-full mt-4"
            >
              <Save className="h-4 w-4 mr-1.5" /> Issue Invoice | تأكيد وإصدار
            </Button>
          </div>

          {/* Real-time ZATCA QR Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Live ZATCA QR Preview | معاينة الرمز
                </h3>
                <p className="text-[10px] text-slate-400">
                  Updates dynamically as line items are modified
                </p>
              </div>
            </div>

            <ZatcaQrCode
              input={{
                sellerName: profile?.company_name || 'My Company',
                vatNumber: profile?.vat_number || '300000000000003',
                timestamp: issueDate,
                invoiceTotal: grandTotal,
                vatTotal: vatTotal,
              }}
              size={150}
              showDetails={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
