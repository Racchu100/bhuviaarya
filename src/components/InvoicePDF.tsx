'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669'
  },
  businessInfo: {
    textAlign: 'right'
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  label: {
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  },
  table: {
    marginTop: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  col1: { flex: 4 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 2, textAlign: 'right' },
  col4: { flex: 2, textAlign: 'right' },
  totals: {
    marginTop: 30,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 20,
    color: '#64748b'
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#059669',
    color: '#059669',
    fontSize: 14,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20
  }
});

export const InvoicePDF = ({ sale, invoiceNumber }: { sale: any, invoiceNumber: string }) => {
  const items = sale.items || [sale];
  
  // Calculate totals
  let totalBasePrice = 0;
  let totalGstAmount = 0;
  let totalGrandAmount = sale.combined_total || sale.total_amount || 0;
  const totalPaidAmount = sale.combined_paid || sale.paid_amount || 0;
  const balanceDue = Math.max(0, totalGrandAmount - totalPaidAmount);

  items.forEach((item: any) => {
    const itemTotal = item.total_amount || 0;
    const itemGstRate = (item.gst_percent || 18) / 100;
    const gstAmt = itemTotal * (itemGstRate / (1 + itemGstRate));
    const basePrice = itemTotal - gstAmt;

    totalBasePrice += basePrice;
    totalGstAmount += gstAmt;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>BHUVI AARYA</Text>
            <Text style={{ marginTop: 4, fontWeight: 'bold' }}>ENTERPRISES</Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={{ fontWeight: 'bold' }}>TAX INVOICE</Text>
            <Text style={{ color: '#64748b', marginTop: 4 }}># {invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View>
            <Text style={styles.label}>Bill To</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{sale.customers?.name}</Text>
            <Text style={{ marginTop: 4 }}>{sale.customers?.phone}</Text>
            <Text style={{ marginTop: 4, width: 200 }}>{sale.customers?.address || 'N/A'}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.label}>Date of Issue</Text>
            <Text style={{ fontWeight: 'bold' }}>{new Date(sale.created_at).toLocaleDateString('en-IN')}</Text>
            <Text style={[styles.label, { marginTop: 15 }]}>Payment Status</Text>
            <Text style={{ fontWeight: 'bold', color: (sale.payment_status || '').toLowerCase() === 'paid' ? '#059669' : '#e11d48' }}>
              {(sale.payment_status || 'PENDING').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Unit Price</Text>
            <Text style={styles.col4}>Total</Text>
          </View>
          {items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>
                {item.products?.name} ({item.products?.sku || 'N/A'})
                {item.gst_percent && ` - GST ${item.gst_percent}%`}
              </Text>
              <Text style={styles.col2}>{item.quantity || 1}</Text>
              <Text style={styles.col3}>₹{(item.unit_price || 0).toLocaleString()}</Text>
              <Text style={styles.col4}>₹{(item.total_amount || 0).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (Excl. GST)</Text>
            <Text style={styles.totalValue}>₹{totalBasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total GST</Text>
            <Text style={styles.totalValue}>₹{totalGstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, { color: '#059669' }]}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{totalGrandAmount.toLocaleString()}</Text>
          </View>

          {sale.payment_status === 'pending' && (
            <>
              <View style={[styles.totalRow, { marginTop: 10 }]}>
                <Text style={styles.totalLabel}>Amount Paid</Text>
                <Text style={styles.totalValue}>₹{totalPaidAmount.toLocaleString()}</Text>
              </View>
              <View style={[styles.totalRow, { color: '#e11d48', fontWeight: 'bold' }]}>
                <Text style={styles.totalLabel}>Balance Due</Text>
                <Text style={styles.totalValue}>₹{balanceDue.toLocaleString()}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Thank you for choosing Bhuvi Aarya Enterprises!</Text>
          <Text>Mangaluru, Karnataka • Contact: +91 99000 00000</Text>
          <Text style={{ marginTop: 10, fontSize: 8 }}>This is a computer generated invoice and does not require a physical signature.</Text>
        </View>
      </Page>
    </Document>
  );
};
