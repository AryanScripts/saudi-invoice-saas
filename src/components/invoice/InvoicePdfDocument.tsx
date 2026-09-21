import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Invoice, Profile, Client } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    paddingBottom: 15,
    marginBottom: 15,
  },
  titleBlock: {
    flexDirection: 'column',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2,
    fontWeight: 'bold',
  },
  invoiceMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  metaLabel: {
    color: '#64748b',
    marginRight: 6,
  },
  metaValue: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  partiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  partyBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  partyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginBottom: 6,
  },
  partyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  partyLabel: {
    color: '#64748b',
  },
  partyValue: {
    fontWeight: 'bold',
    color: '#0f172a',
    maxWidth: '65%',
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
    alignItems: 'center',
  },
  col1: { width: '40%' },
  col2: { width: '12%', textAlign: 'center' },
  col3: { width: '18%', textAlign: 'right' },
  col4: { width: '12%', textAlign: 'center' },
  col5: { width: '18%', textAlign: 'right' },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  qrContainer: {
    width: '40%',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
  },
  qrImage: {
    width: 110,
    height: 110,
  },
  qrBadge: {
    fontSize: 8,
    color: '#059669',
    marginTop: 6,
    fontWeight: 'bold',
  },
  totalsContainer: {
    width: '55%',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 2,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: '#059669',
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    color: '#475569',
    fontSize: 9,
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#059669',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 7.5,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
});

interface InvoicePdfDocumentProps {
  invoice: Invoice;
  profile: Profile;
  client?: Client | null;
  qrDataUrl: string;
}

export function InvoicePdfDocument({
  invoice,
  profile,
  client,
  qrDataUrl,
}: InvoicePdfDocumentProps) {
  const items = invoice.items || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>TAX INVOICE | فاتورة ضريبية</Text>
            <Text style={styles.subTitle}>ZATCA Compliant E-Invoice | فاتورة إلكترونية معتمدة</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Invoice No | رقم الفاتورة:</Text>
              <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Date | التاريخ:</Text>
              <Text style={styles.metaValue}>{invoice.issue_date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due Date | الاستحقاق:</Text>
              <Text style={styles.metaValue}>{invoice.due_date}</Text>
            </View>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesContainer}>
          {/* Seller */}
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Seller Details | بيانات المورد</Text>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Name | الاسم:</Text>
              <Text style={styles.partyValue}>{profile.company_name} {profile.company_name_ar ? `(${profile.company_name_ar})` : ''}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>VAT ID | الرقم الضريبي:</Text>
              <Text style={styles.partyValue}>{profile.vat_number || 'N/A'}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Phone | الهاتف:</Text>
              <Text style={styles.partyValue}>{profile.phone || 'N/A'}</Text>
            </View>
          </View>

          {/* Buyer */}
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Buyer Details | بيانات العميل</Text>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Name | الاسم:</Text>
              <Text style={styles.partyValue}>{client?.name || 'Cash Customer | عميل نقدي'}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>VAT ID | الرقم الضريبي:</Text>
              <Text style={styles.partyValue}>{client?.vat_number || 'N/A'}</Text>
            </View>
            <View style={styles.partyRow}>
              <Text style={styles.partyLabel}>Address | العنوان:</Text>
              <Text style={styles.partyValue}>{client?.address || 'Saudi Arabia | المملكة العربية السعودية'}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item / Description | الصنف والوصف</Text>
            <Text style={styles.col2}>Qty | الكمية</Text>
            <Text style={styles.col3}>Unit Price | السعر</Text>
            <Text style={styles.col4}>VAT | الضريبة</Text>
            <Text style={styles.col5}>Total | المجموع</Text>
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={{ fontWeight: 'bold' }}>{item.description}</Text>
                {item.description_ar && (
                  <Text style={{ fontSize: 8, color: '#64748b' }}>{item.description_ar}</Text>
                )}
              </View>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{Number(item.unit_price).toFixed(2)} ﷼</Text>
              <Text style={styles.col4}>{item.vat_rate}%</Text>
              <Text style={styles.col5}>{Number(item.total).toFixed(2)} ﷼</Text>
            </View>
          ))}
        </View>

        {/* Bottom Section: QR and Totals */}
        <View style={styles.bottomSection}>
          <View style={styles.qrContainer}>
            {qrDataUrl && <Image src={qrDataUrl} style={styles.qrImage} />}
            <Text style={styles.qrBadge}>ZATCA FATOORA VERIFIED</Text>
          </View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal | المجموع الفرعي:</Text>
              <Text style={styles.totalValue}>{Number(invoice.subtotal).toFixed(2)} ﷼</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT 15% | ضريبة القيمة المضافة:</Text>
              <Text style={styles.totalValue}>{Number(invoice.vat_total).toFixed(2)} ﷼</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={[styles.totalLabel, { fontWeight: 'bold', color: '#0f172a' }]}>
                Grand Total | المجموع الكلي:
              </Text>
              <Text style={styles.grandTotalValue}>{Number(invoice.grand_total).toFixed(2)} ﷼</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated via Saudi Invoice SaaS • ZATCA Compliant • Non-Negotiable ﷼ Currency Standard
          </Text>
        </View>
      </Page>
    </Document>
  );
}
