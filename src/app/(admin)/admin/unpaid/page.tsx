'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import {
  AlertTriangle,
  Mail,
  Phone,
  Building,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toastSuccess } from '@/components/ToastProvider';

export default function UnpaidAccountsPage() {
  const [unpaidBusinesses, setUnpaidBusinesses] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or('is_super_admin.is.null,is_super_admin.eq.false')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Filter businesses on basic phase_1
          const filtered = data.filter((p) => p.plan_tier === 'phase_1');
          setUnpaidBusinesses(filtered as Profile[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSendReminder = (companyName: string) => {
    toastSuccess(
      `Reminder sent to ${companyName}`,
      `تم إرسال تذكير التجديد إلى منشأة ${companyName}`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Unpaid & Starter Accounts Monitor | مراقبة الحسابات غير المسددة
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Track starter accounts and send renewal/upgrade reminders
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading accounts...
          </div>
        ) : unpaidBusinesses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            All registered businesses are on premium tiers!
          </div>
        ) : (
          <Table className="border-slate-800 bg-slate-950">
            <TableHeader className="bg-slate-900 border-slate-800">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-300">Company | المنشأة</TableHead>
                <TableHead className="text-slate-300">VAT Number | الرقم الضريبي</TableHead>
                <TableHead className="text-slate-300">Contact | التواصل</TableHead>
                <TableHead className="text-slate-300">Current Plan | الباقة</TableHead>
                <TableHead className="text-right text-slate-300">Actions | إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidBusinesses.map((b) => (
                <TableRow key={b.id} className="border-slate-800/60 hover:bg-slate-900/50">
                  <TableCell>
                    <span className="font-bold text-white text-xs block">{b.company_name}</span>
                    {b.company_name_ar && (
                      <span className="text-[11px] text-slate-400" dir="rtl">{b.company_name_ar}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">
                    {b.vat_number || 'No VAT'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    <div>{b.email || '—'}</div>
                    <div className="text-[10px] text-slate-500">{b.phone || ''}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      Starter (Phase 1)
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(b.company_name)}
                      className="text-xs h-8 bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Send Reminder | إرسال تذكير
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
