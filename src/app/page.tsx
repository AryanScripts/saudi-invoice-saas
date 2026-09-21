import Link from 'next/link';
import { ShieldCheck, QrCode, FileText, Lock, CheckCircle2, ArrowRight, Building, Zap, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                SaudiInvoice
              </span>
              <span className="text-xs text-emerald-400 font-semibold block -mt-1 font-arabic" dir="rtl">
                الفاتورة السعودية
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Log In | تسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="h-4 w-4" />
              ZATCA Phase 1 & 2 Compliant | معتمد من هيئة الزكاة والضريبة والجمارك
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Saudi E-Invoicing Simplified.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                نظام الفوترة الإلكترونية المعتمد
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Generate compliant tax invoices with real-time TLV QR codes, 15% VAT calculations in <span className="text-emerald-400 font-bold">﷼</span>, security PIN deletion controls, and automated PDF delivery.
              <br />
              <span className="text-sm text-slate-500 font-arabic mt-2 block" dir="rtl">
                إصدار الفواتير الضريبية المتوافقة مع متطلبات هيئة الزكاة (المرحلة الأولى والثانية) مع رمز الاستجابة السريعة TLV بالريال السعودي ﷼.
              </span>
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="emerald" className="w-full sm:w-auto h-13 px-8 text-base">
                  Get Started Now | ابدأ الآن
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 text-base bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800">
                  Client Portal | بوابة العملاء
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              Built for Saudi Business Requirements | صُمم للشركات السعودية
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Strictly adherence to Kingdom standards and non-negotiable ﷼ currency rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-emerald-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                ZATCA TLV QR Engine | مشفر الاستجابة السريعة
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Full 9-tag binary TLV encoder generating authentic Base64 QR codes readable by the official ZATCA Fatoora validator app.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-emerald-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Master Security PIN | رمز الأمان وحذف الفواتير
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Zero accidental data loss. Invoices cannot be deleted without an authorized 6-digit Security PIN and full audit trail logging.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-emerald-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Instant PDF Invoices | فواتير PDF فورية
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bilingual Tax Invoices generated instantly via high-resolution vector PDF engine formatted to Saudi commercial guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              Transparent Saudi Riyal Pricing | باقات الاشتراك بالريال السعودي
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              All prices displayed strictly in ﷼ with zero hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phase 1 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Tier 1 | الباقة 1</span>
                <h3 className="text-xl font-bold text-white mt-1">Phase 1 Standard | المرحلة الأولى</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">480</span>
                  <span className="text-xl font-bold text-emerald-400">﷼</span>
                  <span className="text-xs text-slate-400">/ month | شهرياً</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Basic compliant QR code generation for small retail and services.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Basic ZATCA Phase 1 QR Code Generation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited Invoices</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Bilingual PDF Generation (English / Arabic)</li>
                </ul>
              </div>

              <Link href="/signup" className="mt-8">
                <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  Choose Plan | اختر الباقة
                </Button>
              </Link>
            </div>

            {/* Phase 2 Default */}
            <div className="rounded-3xl border-2 border-emerald-500 bg-slate-900/80 p-8 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[11px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                Most Popular | الأكثر طلباً
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Tier 2 | الباقة 2</span>
                <h3 className="text-xl font-bold text-white mt-1">Phase 2 Default (last 3 tags) | المرحلة الثانية القياسية</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">560</span>
                  <span className="text-xl font-bold text-emerald-400">﷼</span>
                  <span className="text-xs text-slate-400">/ month | شهرياً</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Phase 2 Compliance with Default Tags for automated invoicing.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Phase 2 Compliance with Default Tags</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Integration Phase with Cryptographic Hashing & ECDSA Signatures</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> SHA-256 Hashing & Digital Signatures</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Real-time Audit Logs</li>
                </ul>
              </div>

              <Link href="/signup" className="mt-8">
                <Button variant="emerald" className="w-full shadow-lg shadow-emerald-500/20">
                  Get Started | اشترك الآن
                </Button>
              </Link>
            </div>

            {/* Phase 2 Full */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Tier 3 | الباقة 3</span>
                <h3 className="text-xl font-bold text-white mt-1">Phase 2 Full ZATCA | المرحلة الشاملة</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">640</span>
                  <span className="text-xl font-bold text-cyan-400">﷼</span>
                  <span className="text-xs text-slate-400">/ month | شهرياً</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Full cryptographic stamp identifiers, multi-branch, and custom API integration.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Full ZATCA Phase 2 Integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Complete Phase 2 Cryptographic Stamp & Public Keys</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Multi-Branch Support & Unlimited Users</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> 24/7 Priority Support</li>
                </ul>
              </div>

              <Link href="/signup" className="mt-8">
                <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  Select Enterprise | اختيار الباقة
                </Button>
              </Link>
            </div>
          </div>

          {/* Master Deletion PIN Add-on */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/80 p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

              <Link href="/signup">
                <Button variant="emerald" className="shadow-lg shadow-teal-500/20">
                  Get Started | اشترك الآن <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SaudiInvoice SaaS. All rights reserved. Kingdom of Saudi Arabia.</p>
        <p className="mt-1">نظام الفوترة الإلكترونية المتوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA)</p>
      </footer>
    </div>
  );
}
