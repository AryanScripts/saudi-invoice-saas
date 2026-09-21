import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';
import { generateInvoiceNumber } from '@/lib/utils';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', error_ar: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');

    if (invoiceId) {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*)
        `)
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single();

      if (error || !invoice) {
        return NextResponse.json({ error: 'Invoice not found', error_ar: 'الفاتورة غير موجودة' }, { status: 404 });
      }

      return NextResponse.json({ invoice });
    }

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name, name_ar, vat_number),
        items:invoice_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message, error_ar: 'فشل جلب الفواتير' }, { status: 400 });
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error', error_ar: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', error_ar: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientId,
      invoiceNumber: customInvoiceNumber,
      issueDate,
      dueDate,
      items,
      status = 'paid',
      qrMode = 'phase_1',
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required.', error_ar: 'يجب إضافة صنف واحد على الأقل.' },
        { status: 400 }
      );
    }

    // 1. Calculate Subtotal, 15% VAT, and Grand Total
    let subtotal = 0;
    let vatTotal = 0;

    const formattedItems = items.map((item: any) => {
      const quantity = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const vatRate = parseFloat(item.vatRate ?? 15);
      const lineSubtotal = quantity * unitPrice;
      const lineVat = (lineSubtotal * vatRate) / 100;
      const lineTotal = lineSubtotal + lineVat;

      subtotal += lineSubtotal;
      vatTotal += lineVat;

      return {
        description: item.description || 'Product / Service',
        description_ar: item.descriptionAr || null,
        quantity,
        unit_price: unitPrice,
        vat_rate: vatRate,
        total: lineTotal,
      };
    });

    const grandTotal = subtotal + vatTotal;
    const invoiceNumber = customInvoiceNumber || generateInvoiceNumber();

    // 2. Generate ZATCA Phase 2 Hash simulation if applicable
    const rawInvoiceString = `${user.id}|${invoiceNumber}|${issueDate}|${grandTotal.toFixed(2)}|${vatTotal.toFixed(2)}`;
    const zatcaHash = crypto.createHash('sha256').update(rawInvoiceString).digest('base64');
    const ecdsaSignature = qrMode !== 'phase_1' ? crypto.createHash('sha256').update(`SIGN_${zatcaHash}`).digest('hex') : null;

    // 3. Insert Invoice Header
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: clientId || null,
        invoice_number: invoiceNumber,
        issue_date: issueDate || new Date().toISOString().split('T')[0],
        due_date: dueDate || issueDate || new Date().toISOString().split('T')[0],
        subtotal,
        vat_total: vatTotal,
        grand_total: grandTotal,
        status,
        qr_mode: qrMode,
        zatca_hash: zatcaHash,
        ecdsa_signature: ecdsaSignature,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: invoiceError?.message || 'Failed to create invoice', error_ar: 'فشل إنشاء الفاتورة' },
        { status: 400 }
      );
    }

    // 4. Insert Line Items
    const itemsToInsert = formattedItems.map((item) => ({
      invoice_id: invoice.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Failed to insert items:', itemsError);
    }

    // 5. Audit Log
    await logAuditEvent({
      userId: user.id,
      actionType: 'INVOICE_CREATED',
      details: `Created invoice ${invoiceNumber} total ${grandTotal.toFixed(2)} ﷼`,
      targetId: invoice.id,
    });

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice created successfully.',
      message_ar: 'تم إنشاء الفاتورة بنجاح.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error', error_ar: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
