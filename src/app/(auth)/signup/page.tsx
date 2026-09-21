'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Receipt, Mail, Lock, Building, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toastSuccess, toastError } from '@/components/ToastProvider';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    companyNameAr: '',
    vatNumber: '',
    phone: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.password) {
      toastError('Required fields are missing', 'يرجى ملء الحقول الإلزامية');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          ...formData,
        }),
      });

      const data = await res.json();
      const error = !res.ok ? (data.error || 'Signup failed') : null;
      console.log("[Auth Debug - SignUp] Response:", { data, error });

      if (!res.ok) {
        toastError(data.error || 'Signup failed', data.error_ar || 'فشل تسجيل الحساب');
        return;
      }

      toastSuccess(
        'Account created successfully!',
        'تم إنشاء الحساب بنجاح! جاري التوجيه...'
      );
      if (data.requiresVerification) {
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/20">
              <Receipt className="h-6 w-6" />
            </div>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Register Your Saudi Business | تسجيل منشأة جديدة
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Instant ZATCA compliance setup with 15-digit VAT and TLV QR codes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name (EN) *
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Al Riyadh Trading Est"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم المنشأة (بالعربي)
                </label>
                <input
                  type="text"
                  name="companyNameAr"
                  value={formData.companyNameAr}
                  onChange={handleChange}
                  placeholder="مؤسسة الرياض للتجارة"
                  dir="rtl"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  VAT Number | الرقم الضريبي (15 digit)
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="vatNumber"
                    maxLength={15}
                    value={formData.vatNumber}
                    onChange={handleChange}
                    placeholder="300000000000003"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-3 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone | رقم الجوال
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+966 50 000 0000"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email | البريد الإلكتروني للعمل *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@company.sa"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password | كلمة المرور *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="emerald"
                isLoading={isLoading}
                className="w-full h-11 text-sm font-semibold"
              >
                Create Account | إنشاء الحساب <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
                Sign In | تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
