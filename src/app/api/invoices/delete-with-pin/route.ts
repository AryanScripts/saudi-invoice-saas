import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDeletionPin } from '@/lib/security/pin';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', error_ar: 'غير مصرح' }, { status: 401 });
    }

    const { invoiceId, pin } = await request.json();

    if (!invoiceId || !pin) {
      return NextResponse.json(
        { error: 'Invoice ID and 6-digit PIN are required.', error_ar: 'معرف الفاتورة والرمز السري مطلوبان.' },
        { status: 400 }
      );
    }

    // 1. Verify PIN and Access
    const pinCheck = await verifyDeletionPin(user.id, pin);

    if (!pinCheck.hasAccess) {
      return NextResponse.json(
        { error: pinCheck.error, error_ar: pinCheck.error_ar },
        { status: 403 }
      );
    }

    if (!pinCheck.isValid) {
      await logAuditEvent({
        userId: user.id,
        actionType: 'INVOICE_DELETE_FAILED_PIN',
        details: `Failed delete attempt on invoice ${invoiceId} due to incorrect PIN`,
        targetId: invoiceId,
      });

      return NextResponse.json(
        { error: pinCheck.error, error_ar: pinCheck.error_ar },
        { status: 401 }
      );
    }

    // 2. Fetch invoice info for logging
    const { data: invoice } = await supabase
      .from('invoices')
      .select('invoice_number, grand_total')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    // 3. Delete invoice
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message, error_ar: 'فشل حذف الفاتورة' },
        { status: 400 }
      );
    }

    // 4. Log successful audit event
    await logAuditEvent({
      userId: user.id,
      actionType: 'INVOICE_DELETED_WITH_PIN',
      details: `Invoice ${invoice?.invoice_number || invoiceId} deleted using Master Security PIN`,
      targetId: invoiceId,
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice permanently deleted.',
      message_ar: 'تم حذف الفاتورة نهائياً بنجاح.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
