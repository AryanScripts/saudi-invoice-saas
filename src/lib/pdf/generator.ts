import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { InvoicePdfDocument } from '@/components/invoice/InvoicePdfDocument';
import { Invoice, Profile, Client } from '@/types';
import { generateZatcaQrDataUrl } from '@/lib/qr/zatca';

export async function generateInvoicePdfBlob({
  invoice,
  profile,
  client,
}: {
  invoice: Invoice;
  profile: Profile;
  client?: Client | null;
}): Promise<Blob> {
  // Generate ZATCA QR
  const qrDataUrl = await generateZatcaQrDataUrl({
    sellerName: profile.company_name || 'Seller',
    vatNumber: profile.vat_number || '300000000000003',
    timestamp: invoice.issue_date ? new Date(invoice.issue_date).toISOString() : new Date().toISOString(),
    invoiceTotal: invoice.grand_total,
    vatTotal: invoice.vat_total,
    invoiceHash: invoice.zatca_hash || undefined,
    ecdsaSignature: invoice.ecdsa_signature || undefined,
  });

  const doc = React.createElement(InvoicePdfDocument, {
    invoice,
    profile,
    client,
    qrDataUrl,
  }) as any;

  const pdfInstance = pdf(doc);
  const blob = await pdfInstance.toBlob();
  return blob;
}
