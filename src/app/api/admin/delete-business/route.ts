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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.', error_ar: 'معرف المستخدم مطلوب.' }, { status: 400 });
    }

    // Get company details for log
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('company_name, email')
      .eq('id', userId)
      .single();

    // Delete profile (cascades to invoices, clients, products)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message, error_ar: 'فشل حذف المنشأة' }, { status: 400 });
    }

    await logAuditEvent({
      userId: user.id,
      actionType: 'BUSINESS_DELETED',
      details: `Admin deleted business profile: ${targetProfile?.company_name || userId} (${targetProfile?.email || 'N/A'})`,
      targetId: userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully.',
      message_ar: 'تم حذف المنشأة بنجاح.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
