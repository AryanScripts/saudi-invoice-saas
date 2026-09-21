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

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('is_super_admin, role')
      .eq('id', user.id)
      .single();

    if (!currentProfile?.is_super_admin && currentProfile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Super Admin only.', error_ar: 'تم رفض الوصول. للمشرف العام فقط.' }, { status: 403 });
    }

    const { userId, pinDeletionAccess, planTier } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Target User ID is required.', error_ar: 'معرف المستخدم المستهدف مطلوب.' }, { status: 400 });
    }

    const updates: any = {};
    if (pinDeletionAccess !== undefined) {
      updates.pin_deletion_access_granted = pinDeletionAccess;
    }
    if (planTier) {
      updates.plan_tier = planTier;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message, error_ar: 'فشل تحديث الصلاحيات' }, { status: 400 });
    }

    await logAuditEvent({
      userId: user.id,
      actionType: pinDeletionAccess ? 'ACCESS_OVERRIDE_GRANTED' : 'ACCESS_OVERRIDE_REVOKED',
      details: `Admin modified access for user ${userId}: PIN Access=${pinDeletionAccess}, Tier=${planTier || 'unchanged'}`,
      targetId: userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Access permissions updated successfully.',
      message_ar: 'تم تحديث صلاحيات الوصول بنجاح.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
