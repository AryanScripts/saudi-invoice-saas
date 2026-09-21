'use client';

import React, { useState } from 'react';
import { Profile, PlanTier } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Building2, Trash2, CheckCircle, Mail, Phone } from 'lucide-react';
import { toastSuccess, toastError } from '@/components/ToastProvider';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';

interface AccessOverrideCardProps {
  business: Profile;
  onRefresh: () => void;
}

export function AccessOverrideCard({ business, onRefresh }: AccessOverrideCardProps) {
  const [pinAccess, setPinAccess] = useState(Boolean(business.pin_deletion_access_granted || business.pin_package_purchased));
  const [tier, setTier] = useState<PlanTier>(business.plan_tier || 'phase_1');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePinAccess = async (checked: boolean) => {
    setPinAccess(checked);
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/override-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: business.id,
          pinDeletionAccess: checked,
          planTier: tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Failed to update access', data.error_ar || 'فشل تحديث الصلاحية');
        setPinAccess(!checked);
        return;
      }

      toastSuccess(
        `PIN Deletion override ${checked ? 'granted' : 'revoked'}`,
        `تم ${checked ? 'منح' : 'إلغاء'} صلاحية حذف الفواتير`
      );
      onRefresh();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الشبكة');
      setPinAccess(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeTier = async (newTier: PlanTier) => {
    setTier(newTier);
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/override-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: business.id,
          pinDeletionAccess: pinAccess,
          planTier: newTier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Failed to update plan', data.error_ar || 'فشل تحديث الباقة');
        return;
      }

      toastSuccess(`Plan tier updated to ${newTier}`, `تم ترقية الباقة بنجاح`);
      onRefresh();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الشبكة');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBusiness = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/delete-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: business.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Failed to delete business', data.error_ar || 'فشل حذف المنشأة');
        return;
      }

      toastSuccess(
        `Business ${business.company_name} deleted permanently`,
        `تم حذف منشأة ${business.company_name} نهائياً`
      );
      setIsDeleteModalOpen(false);
      onRefresh();
    } catch (err) {
      toastError('Network error', 'حدث خطأ في الشبكة');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {business.company_name} {business.company_name_ar ? `| ${business.company_name_ar}` : ''}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              VAT | الرقم الضريبي: {business.vat_number || 'Not Registered | غير مسجل'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {business.is_super_admin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Super Admin | مشرف عام
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete | حذف
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>{business.email || 'No email provided'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-400" />
          <span>{business.phone || 'No phone provided'}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Joined | انضم: {new Date(business.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Admin Override Controls */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-800 text-sm block">
              PIN Deletion Access Override | استثناء صلاحية الحذف بالرمز
            </span>
            <span className="text-xs text-slate-500">
              Grant immediate permission to delete invoices without requiring a direct package purchase.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={pinAccess}
              onCheckedChange={handleTogglePinAccess}
              disabled={isUpdating}
            />
            <span className="text-xs font-medium text-slate-700">
              {pinAccess ? 'Granted | مفعل' : 'Disabled | معطل'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div>
            <span className="font-semibold text-slate-800 text-sm block">
              ZATCA Plan Tier | باقة الامتثال
            </span>
            <span className="text-xs text-slate-500">
              Current active compliance level and QR feature set.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={tier}
              onChange={(e) => handleChangeTier(e.target.value as PlanTier)}
              disabled={isUpdating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="phase_1">Phase 1 (Basic QR) | المرحلة 1</option>
              <option value="phase_2_default">Phase 2 Standard | المرحلة 2 القياسية</option>
              <option value="phase_2_full">Phase 2 Full (Cryptographic Stamp) | المرحلة 2 الشاملة</option>
            </select>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBusiness}
        titleEn="Delete Business Profile"
        titleAr="حذف ملف المنشأة"
        descriptionEn={`Are you sure you want to permanently delete "${business.company_name}" and all associated invoices?`}
        descriptionAr={`هل أنت متأكد من رغبتك في حذف منشأة "${business.company_name}" وجميع فواتيرها نهائياً؟`}
        isLoading={isDeleting}
      />
    </div>
  );
}
