import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', error_ar: 'غير مصرح' }, { status: 401 });
    }

    // Verify Admin status
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('is_super_admin, role')
      .eq('id', user.id)
      .single();

    if (!currentProfile?.is_super_admin && currentProfile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Super Admin only.', error_ar: 'تم رفض الوصول. للمشرف العام فقط.' }, { status: 403 });
    }

    const { paymentId, status, targetUserId, newPlanTier, grantPinPackage } = await request.json();

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Payment ID and status are required.', error_ar: 'معرف الدفع والحالة مطلوبان.' }, { status: 400 });
    }

    // 1. Update Payment Record
    const { error: paymentUpdateError } = await supabase
      .from('manual_payments')
      .update({
        status,
        reviewed_by: user.id,
      })
      .eq('id', paymentId);

    if (paymentUpdateError) {
      return NextResponse.json({ error: paymentUpdateError.message, error_ar: 'فشل تحديث الدفع' }, { status: 400 });
    }

    // 2. If approved, upgrade profile
    if (status === 'approved' && targetUserId) {
      const updates: any = {};
      if (newPlanTier) updates.plan_tier = newPlanTier;
      if (grantPinPackage !== undefined) {
        updates.pin_package_purchased = grantPinPackage;
        updates.pin_deletion_access_granted = grantPinPackage;
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', targetUserId);
      }
    }

    await logAuditEvent({
      userId: user.id,
      actionType: status === 'approved' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
      details: `Admin ${user.email} marked payment ${paymentId} as ${status} (User: ${targetUserId || 'N/A'})`,
      targetId: paymentId,
    });

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}.`,
      message_ar: `تم تحديث حالة الدفع إلى ${status === 'approved' ? 'مقبول' : 'مرفوض'}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
