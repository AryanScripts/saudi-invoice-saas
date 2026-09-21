'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import {
  Settings,
  Building,
  ShieldCheck,
  KeyRound,
  Lock,
  Save,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toastSuccess, toastError } from '@/components/ToastProvider';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    companyNameAr: '',
    vatNumber: '',
    email: '',
    phone: '',
  });
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setFormData({
          companyName: data.company_name || '',
          companyNameAr: data.company_name_ar || '',
          vatNumber: data.vat_number || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: formData.companyName,
          company_name_ar: formData.companyNameAr || null,
          vat_number: formData.vatNumber || null,
          phone: formData.phone || null,
        })
        .eq('id', profile.id);

      if (error) {
        toastError(error.message, 'فشل تحديث البيانات');
        return;
      }

      toastSuccess('Business profile updated', 'تم تحديث بيانات المنشأة بنجاح');
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!/^\d{6}$/.test(pinData.newPin)) {
      toastError('PIN must be exactly 6 digits', 'يجب أن يتكون الرمز السري من 6 أرقام بالضبط');
      return;
    }

    if (pinData.newPin !== pinData.confirmPin) {
      toastError('PIN confirmation does not match', 'تأكيد الرمز السري غير متطابق');
      return;
    }

    setIsSavingPin(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('business_security_settings')
        .upsert({
          user_id: profile.id,
          master_delete_pin: pinData.newPin,
        }, { onConflict: 'user_id' });

      if (error) {
        toastError(error.message, 'فشل تحديث الرمز السري');
        return;
      }

      toastSuccess('Master Security PIN updated', 'تم تحديث الرمز السري لحذف الفواتير بنجاح');
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الاتصال');
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Business Settings & Security | إعدادات المنشأة والأمان
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure official company details for ZATCA invoices and manage your master PIN
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Profile Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
            <Building className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Company Credentials | بيانات المنشأة الرسمية
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Name (EN) *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-right" dir="rtl">
                  اسم المنشأة (بالعربي)
                </label>
                <input
                  type="text"
                  value={formData.companyNameAr}
                  onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                  dir="rtl"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 text-right focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ZATCA VAT Registration (15 digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number | رقم الهاتف
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address | البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="emerald" isLoading={isSavingProfile}>
                <Save className="h-4 w-4 mr-1.5" /> Save Changes | حفظ التعديلات
              </Button>
            </div>
          </form>
        </div>

        {/* Master PIN Security Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
            <Lock className="h-5 w-5 text-teal-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Master PIN Security | الرمز السري لحذف الفواتير
              </h2>
              <p className="text-xs text-slate-500">
                Manage your 6-digit master PIN required for permanent invoice deletion
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New 6-Digit PIN | الرمز السري الجديد
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinData.newPin}
                  onChange={(e) => setPinData({ ...pinData, newPin: e.target.value.replace(/\D/g, '') })}
                  placeholder="••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-center text-base font-mono tracking-widest text-slate-900 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm PIN | تأكيد الرمز
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinData.confirmPin}
                  onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, '') })}
                  placeholder="••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-center text-base font-mono tracking-widest text-slate-900 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="emerald" isLoading={isSavingPin}>
                <KeyRound className="h-4 w-4 mr-1.5" /> Update Master PIN | تحديث الرمز السري
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
