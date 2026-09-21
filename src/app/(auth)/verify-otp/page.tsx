'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Receipt, KeyRound, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toastSuccess, toastError } from '@/components/ToastProvider';
import { createClient } from '@/lib/supabase/client';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toastError('Please enter valid 6-digit OTP', 'يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    if (!email) {
      toastError('Please enter your email address', 'يرجى إدخال البريد الإلكتروني');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const token = otp;

      // OTP Verification submission
      console.log("[Auth Debug - Verify OTP] Verification Payload:", { email, token, type: 'signup' });
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      console.log("[Auth Debug - Verify OTP] Verification Response:", { data, error });

      if (error) {
        toastError(error.message || 'Verification failed', 'فشل التحقق من الرمز');
        return;
      }

      toastSuccess('Verification successful!', 'تم التحقق بنجاح!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toastError('An unexpected error occurred', 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toastError('Please enter your email address to resend OTP', 'يرجى إدخال البريد الإلكتروني لإعادة إرسال الرمز');
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        toastError(error.message, 'فشل إعادة إرسال الرمز');
      } else {
        toastSuccess('New OTP sent to your email', 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني');
      }
    } catch (err: any) {
      toastError('Failed to resend OTP', 'فشل إعادة إرسال الرمز');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/20">
              <Receipt className="h-6 w-6" />
            </div>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Two-Factor Verification | التحقق الثنائي
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter the 6-digit verification code sent to your registered phone or email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleVerify}>
            {!emailParam && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address | البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.sa"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                Enter Verification Code | رمز التحقق
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="emerald"
              isLoading={isLoading}
              className="w-full h-11 text-sm font-semibold"
            >
              Verify & Proceed | تأكيد ومتابعة <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              Resend Code | إعادة إرسال الرمز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
