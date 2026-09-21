import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', error_ar: 'غير مصرح' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: payments } = await supabase
      .from('manual_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      profile,
      payments: payments || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', error_ar: 'غير مصرح' }, { status: 401 });
    }

    const { amount, receiptReference, packageType } = await request.json();

    if (!amount || !receiptReference) {
      return NextResponse.json(
        { error: 'Amount and receipt reference are required.', error_ar: 'المبلغ والرقم المرجعي للإيصال مطلوبان.' },
        { status: 400 }
      );
    }

    const { data: payment, error } = await supabase
      .from('manual_payments')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        receipt_reference: receiptReference,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, error_ar: 'فشل تقديم طلب الدفع' }, { status: 400 });
    }

    await logAuditEvent({
      userId: user.id,
      actionType: 'PAYMENT_SUBMITTED',
      details: `Submitted manual payment for ${amount} ﷼ (Ref: ${receiptReference}, Type: ${packageType || 'subscription'})`,
      targetId: payment.id,
    });

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment proof submitted. Awaiting Super Admin review.',
      message_ar: 'تم إرسال إثبات الدفع. في انتظار مراجعة المشرف العام.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
