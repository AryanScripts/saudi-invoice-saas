'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionPlansPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data as Profile);
      }
    }
    loadProfile();
  }, []);

  const currentTier = profile?.plan_tier || 'phase_1';
  const hasPinPackage = Boolean(profile?.pin_deletion_access_granted || profile?.pin_package_purchased);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Official ZATCA Compliance Tiers | باقات الامتثال المعتمدة
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Subscription Plans & Add-ons | باقات الاشتراك والإضافات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose the compliant tier suited for your business. All prices strictly in <span className="font-bold text-slate-800">﷼</span>.
          </p>
        </div>

        <Link href="/subscription/status">
          <Button variant="outline">
            Payment History | سجل المدفوعات
          </Button>
        </Link>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Phase 1 Standard */}
        <div className={`rounded-3xl border ${currentTier === 'phase_1' ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white shadow-xs'} p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Tier 1 | المرحلة الأولى
              </span>
              {currentTier === 'phase_1' && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Current Active Plan
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Phase 1 Standard | القياسية</h3>
            <p className="text-xs text-slate-500 mt-1">
              Generation phase standard QR code with essential ZATCA TLV tags.
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">480</span>
              <span className="text-lg font-bold text-emerald-600">﷼</span>
              <span className="text-xs text-slate-400">/ month | شهرياً</span>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Basic ZATCA Phase 1 QR Code Generation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Unlimited Invoices</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bilingual PDF Generation (English / Arabic)</li>
            </ul>
          </div>

          <div className="mt-8">
            <Link href="/subscription/checkout?plan=phase_1&amount=480">
              <Button
                variant={currentTier === 'phase_1' ? 'outline' : 'emerald'}
                className="w-full"
              >
                {currentTier === 'phase_1' ? 'Renew Plan | تجديد' : 'Upgrade | ترقية'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Tier 2: Phase 2 Default */}
        <div className={`rounded-3xl border-2 border-emerald-500 bg-white p-6 shadow-xl relative flex flex-col justify-between ring-4 ring-emerald-500/10`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">
            Most Popular | الأكثر طلباً
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Tier 2 | المرحلة الثانية
              </span>
              {currentTier === 'phase_2_default' && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Current Active Plan
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Phase 2 Default (last 3 tags) | مرحلة الربط</h3>
            <p className="text-xs text-slate-500 mt-1">
              Phase 2 Compliance with Default Last 3 Tags.
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">560</span>
              <span className="text-lg font-bold text-emerald-600">﷼</span>
              <span className="text-xs text-slate-400">/ month | شهرياً</span>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2 font-semibold text-slate-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Phase 2 Compliance with Default Last 3 Tags</li>
              <li className="flex items-center gap-2 font-semibold text-slate-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Integration Phase with Cryptographic Hashing & ECDSA Signatures</li>
              <li className="flex items-center gap-2 font-semibold text-slate-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> SHA-256 Hashing & Digital Signatures</li>
              <li className="flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Real-time Audit Logs</li>
            </ul>
          </div>

          <div className="mt-8">
            <Link href="/subscription/checkout?plan=phase_2_default&amount=560">
              <Button
                variant="emerald"
                className="w-full shadow-lg shadow-emerald-500/20"
              >
                {currentTier === 'phase_2_default' ? 'Renew Plan | تجديد' : 'Select Plan | اختيار الباقة'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Tier 3: Phase 2 Full */}
        <div className={`rounded-3xl border ${currentTier === 'phase_2_full' ? 'border-cyan-500 bg-white shadow-md ring-2 ring-cyan-500/20' : 'border-slate-200 bg-white shadow-xs'} p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                Tier 3 | المرحلة الشاملة
              </span>
              {currentTier === 'phase_2_full' && (
                <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Current Active Plan
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Phase 2 Full ZATCA | الشاملة</h3>
            <p className="text-xs text-slate-500 mt-1">
              Full ZATCA Phase 2 Integration with cryptographic stamp.
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">640</span>
              <span className="text-lg font-bold text-cyan-600">﷼</span>
              <span className="text-xs text-slate-400">/ month | شهرياً</span>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" /> Full ZATCA Phase 2 Integration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" /> Complete Phase 2 Cryptographic Stamp & Public Keys</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" /> Multi-Branch Support & Unlimited Users</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" /> 24/7 Priority Support</li>
            </ul>
          </div>

          <div className="mt-8">
            <Link href="/subscription/checkout?plan=phase_2_full&amount=640">
              <Button
                variant="outline"
                className="w-full hover:border-cyan-500 hover:text-cyan-700"
              >
                {currentTier === 'phase_2_full' ? 'Renew Plan | تجديد' : 'Select Enterprise | ترقية'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Security Addon Box */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-400 border border-teal-500/30">
            <Lock className="h-3.5 w-3.5" /> Standalone Add-on | إضافة مستقلة
          </div>
          <h3 className="text-xl font-bold">
            Master Deletion PIN Add-on | باقة أمان حذف الفواتير بالرمز السري
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gain permission to permanently delete invoices with a 6-digit customizable PIN. Eliminates accidental deletes while adhering strictly to ZATCA compliance and internal audit records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="text-center sm:text-right">
            <span className="text-3xl font-extrabold font-mono">150</span>
            <span className="text-xl font-bold text-teal-400 ml-1">﷼</span>
            <span className="block text-[11px] text-slate-400">One-time / Lifetime | تدفع لمرة واحدة</span>
          </div>

          {hasPinPackage ? (
            <div className="px-4 py-2.5 rounded-xl bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/40 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Already Activated | مفعل لديك
            </div>
          ) : (
            <Link href="/subscription/checkout?plan=pin_package&amount=150">
              <Button variant="emerald" className="shadow-lg shadow-teal-500/20">
                Purchase Add-on | شراء الإضافة <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
