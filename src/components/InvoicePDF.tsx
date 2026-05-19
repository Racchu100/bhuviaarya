'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Indian Numbering System Currency to Words Helper
export function numberToWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function convertLessThanThousand(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    const hundredDigit = Math.floor(n / 100);
    const rest = n % 100;
    return a[hundredDigit] + ' Hundred' + (rest ? ' ' + convertLessThanThousand(rest) : '');
  }

  const parts = num.toFixed(2).split('.');
  const rupees = parseInt(parts[0]);
  const paise = parseInt(parts[1]);

  let rupeesStr = '';
  if (rupees === 0) {
    rupeesStr = 'Zero Rupees';
  } else {
    let remaining = rupees;
    const crore = Math.floor(remaining / 10000000);
    remaining %= 10000000;
    const lakh = Math.floor(remaining / 100000);
    remaining %= 100000;
    const thousand = Math.floor(remaining / 1000);
    remaining %= 1000;

    const chunks = [];
    if (crore) chunks.push(convertLessThanThousand(crore) + ' Crore');
    if (lakh) chunks.push(convertLessThanThousand(lakh) + ' Lakh');
    if (thousand) chunks.push(convertLessThanThousand(thousand) + ' Thousand');
    if (remaining) chunks.push(convertLessThanThousand(remaining));
    
    rupeesStr = chunks.join(' ') + ' Rupees';
  }

  let paiseStr = '';
  if (paise > 0) {
    paiseStr = ' and ' + convertLessThanThousand(paise) + ' Paise';
  }

  return 'INR ' + rupeesStr + paiseStr + ' Only';
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: '#000000',
    backgroundColor: '#ffffff'
  },
  einvoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 4
  },
  einvoiceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  einvoiceMeta: {
    width: '70%',
    gap: 2
  },
  einvoiceQrPlaceholder: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: '#f8fafc'
  },
  qrBlockRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2
  },
  qrBlock: {
    width: 6,
    height: 6,
    backgroundColor: '#000000'
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  rowLast: {
    flexDirection: 'row'
  },
  col50: {
    width: '50%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000'
  },
  col50Last: {
    width: '50%',
    padding: 6
  },
  col25: {
    width: '25%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000000'
  },
  col25Last: {
    width: '25%',
    padding: 4
  },
  bold: {
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#334155',
    marginBottom: 2
  },
  textLg: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3
  },
  // Table styles
  tableContainer: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 18
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 20,
    alignItems: 'center'
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    minHeight: 18,
    alignItems: 'center',
    fontWeight: 'bold'
  },
  cellSl: { width: '5%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 2 },
  cellDesc: { width: '38%', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 3 },
  cellHsn: { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 2 },
  cellGst: { width: '8%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 2 },
  cellQty: { width: '10%', textAlign: 'right', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 2 },
  cellRate: { width: '12%', textAlign: 'right', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 2 },
  cellAmt: { width: '15%', textAlign: 'right', padding: 2 },

  cellSlHeader: { width: '5%', borderRightWidth: 1, borderRightColor: '#000000', padding: 2 },
  cellDescHeader: { width: '38%', borderRightWidth: 1, borderRightColor: '#000000', padding: 2 },
  cellHsnHeader: { width: '12%', borderRightWidth: 1, borderRightColor: '#000000', padding: 2 },
  cellGstHeader: { width: '8%', borderRightWidth: 1, borderRightColor: '#000000', padding: 2 },
  cellQtyHeader: { width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 2 },
  cellRateHeader: { width: '12%', borderRightWidth: 1, borderRightColor: '#000000', padding: 2 },
  cellAmtHeader: { width: '15%', padding: 2 },

  // HSN Table styles
  hsnTableContainer: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8
  },
  hsnHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 18
  },
  hsnRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    minHeight: 16
  },
  hsnColCode: { width: '20%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3, textAlign: 'center' },
  hsnColVal: { width: '20%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3, textAlign: 'right' },
  hsnColCgstRate: { width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3, textAlign: 'center' },
  hsnColCgstAmt: { width: '15%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3, textAlign: 'right' },
  hsnColSgstRate: { width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3, textAlign: 'center' },
  hsnColSgstAmt: { width: '15%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3, textAlign: 'right' },
  hsnColTotal: { width: '10%', padding: 3, textAlign: 'right' },

  hsnColCodeHeader: { width: '20%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3 },
  hsnColValHeader: { width: '20%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3 },
  hsnColTaxHeader: { width: '50%', borderRightWidth: 1, borderRightColor: '#000000', padding: 3 },
  hsnColTotalHeader: { width: '10%', padding: 3 },

  hsnSubHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 12,
    alignItems: 'center'
  },
  
  // Footer Box
  footerContainer: {
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    minHeight: 80
  },
  footerLeft: {
    width: '60%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    justifyContent: 'space-between'
  },
  footerRight: {
    width: '40%',
    padding: 6,
    justifyContent: 'space-between',
    textAlign: 'right'
  }
});

// Main Invoice PDF Component
export const InvoicePDF = ({ sale, invoiceNumber, customDetails }: { sale: any; invoiceNumber: string; customDetails?: any }) => {
  const items = sale.items || [sale];

  // Default parameters (Seller, Buyer, Bank details etc) prefilled/derived
  const details = {
    // e-Invoice Info
    irn: customDetails?.irn || '07af9190ff32719067dde629b0e23f6ee7653c12ba1-' + Math.random().toString(36).substring(2, 10),
    ackNo: customDetails?.ackNo || '11' + Math.floor(100000000000 + Math.random() * 900000000000),
    ackDate: customDetails?.ackDate || new Date(sale.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),

    // Company/Seller
    companyName: customDetails?.companyName || 'BHUVI AARYA ENTERPRISES',
    companyAddress: customDetails?.companyAddress || 'DOOR NO 22-3- 407, GUJJARAKERE ROAD,\nNEAR JEPPU MARKET, MANGALORE-575001',
    companyGstin: customDetails?.companyGstin || '29AZYPN5189L1Z0',
    companyPhone: customDetails?.companyPhone || '9591554745',
    companyEmail: customDetails?.companyEmail || 'bhuviaarya@gmail.com',
    companyState: customDetails?.companyState || 'Karnataka',
    companyStateCode: customDetails?.companyStateCode || '29',

    // Buyer
    buyerName: customDetails?.buyerName || sale.customers?.name || 'Unregistered Customer',
    buyerAddress: customDetails?.buyerAddress || sale.customers?.address || 'N/A',
    buyerPhone: customDetails?.buyerPhone || sale.customers?.phone || 'N/A',
    buyerGstin: customDetails?.buyerGstin || 'URD (Unregistered)',
    buyerState: customDetails?.buyerState || 'Karnataka',
    buyerStateCode: customDetails?.buyerStateCode || '29',

    // Invoice Details
    invoiceNo: customDetails?.invoiceNo || `INV-${invoiceNumber}`,
    invoiceDate: customDetails?.invoiceDate || new Date(sale.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
    deliveryNote: customDetails?.deliveryNote || 'N/A',
    paymentMode: customDetails?.paymentMode || sale.payment_method || 'Cash/UPI',
    buyerOrderNo: customDetails?.buyerOrderNo || 'N/A',
    buyerOrderDate: customDetails?.buyerOrderDate || 'N/A',
    dispatchDocNo: customDetails?.dispatchDocNo || 'N/A',
    deliveryNoteDate: customDetails?.deliveryNoteDate || 'N/A',
    dispatchedThrough: customDetails?.dispatchedThrough || 'MANJUNATH',
    destination: customDetails?.destination || 'Local',
    termsOfDelivery: customDetails?.termsOfDelivery || 'Immediate delivery upon complete clearance.',

    // Bank
    bankHolderName: customDetails?.bankHolderName || 'BHUVI AARYA ENTERPRISES',
    bankName: customDetails?.bankName || 'HDFC BANK',
    bankAccountNo: customDetails?.bankAccountNo || '50200109458213',
    bankIfsc: customDetails?.bankIfsc || 'HDFC0001749',
    bankBranch: customDetails?.bankBranch || 'MANGALORE',

    // Charges
    shippingCharges: parseFloat(customDetails?.shippingCharges || 0),
    roundOff: parseFloat(customDetails?.roundOff || 0),
    declaration: customDetails?.declaration || '*Terms & Condition: Subject to MANGALURU Jurisdiction.\n*We hereby declare that this tax invoice shows the actual price of the goods described and that all particulars are true and correct.\n*Goods once sold shall not be accepted for exchange or refund.',
    signatureText: customDetails?.signatureText || 'Authorised Signatory'
  };

  // Helper calculations for items
  let totalTaxableValue = 0;
  let totalTaxAmount = 0;
  const processedItems = items.map((item: any, index: number) => {
    const qty = parseFloat(customDetails?.items?.[index]?.qty ?? item.quantity ?? 1);
    const unit = customDetails?.items?.[index]?.qtyUnit ?? 'PCS';
    const gstPercent = parseFloat(customDetails?.items?.[index]?.gstPercent ?? item.gst_percent ?? 18);
    const hsn = customDetails?.items?.[index]?.hsn ?? '9403'; // default HSN for furniture

    // Compute back the taxable value from the unit price (which is database standard inclusive)
    const unitPriceInclTax = parseFloat(customDetails?.items?.[index]?.unitPriceInclTax ?? item.unit_price ?? 0);
    const unitPriceExclTax = unitPriceInclTax / (1 + gstPercent / 100);
    const taxableAmount = qty * unitPriceExclTax;
    const taxAmt = taxableAmount * (gstPercent / 100);
    const totalInclTax = taxableAmount + taxAmt;

    totalTaxableValue += taxableAmount;
    totalTaxAmount += taxAmt;

    return {
      sl: index + 1,
      name: item.products?.name || 'Standard Item',
      sku: item.products?.sku || 'N/A',
      hsn,
      gstPercent,
      qty,
      unit,
      unitPriceInclTax,
      unitPriceExclTax,
      taxableAmount,
      taxAmt,
      totalInclTax
    };
  });

  const grandBeforeRound = totalTaxableValue + totalTaxAmount + details.shippingCharges;
  const computedRoundOff = details.roundOff !== 0 ? details.roundOff : parseFloat((Math.round(grandBeforeRound) - grandBeforeRound).toFixed(2));
  const finalGrandTotal = Math.round(grandBeforeRound + computedRoundOff);

  // Group by HSN for HSN tax breakdown table
  const hsnGroups: { [key: string]: { taxable: number; rate: number; tax: number } } = {};
  processedItems.forEach(item => {
    const key = `${item.hsn}_${item.gstPercent}`;
    if (!hsnGroups[key]) {
      hsnGroups[key] = { taxable: 0, rate: item.gstPercent, tax: 0 };
    }
    hsnGroups[key].taxable += item.taxableAmount;
    hsnGroups[key].tax += item.taxAmt;
  });

  // e-Invoice mock QR graphics
  const qrGrid = [
    [1, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 0, 1],
    [0, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1]
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* e-Invoice Title & IRN Block */}
        <View style={styles.einvoiceHeader}>
          <View style={styles.einvoiceMeta}>
            <Text style={styles.einvoiceTitle}>TAX INVOICE</Text>
            <Text style={{ fontSize: 6.5 }}><Text style={styles.bold}>IRN: </Text>{details.irn}</Text>
            <Text style={{ fontSize: 6.5 }}><Text style={styles.bold}>Ack No: </Text>{details.ackNo}</Text>
            <Text style={{ fontSize: 6.5 }}><Text style={styles.bold}>Ack Date: </Text>{details.ackDate}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.bold, { fontSize: 8, marginBottom: 2 }]}>e-Invoice</Text>
            <View style={styles.einvoiceQrPlaceholder}>
              {qrGrid.map((rowArr, rIdx) => (
                <View key={rIdx} style={styles.qrBlockRow}>
                  {rowArr.map((cell, cIdx) => (
                    <View key={cIdx} style={[styles.qrBlock, { backgroundColor: cell === 1 ? '#000000' : 'transparent' }]} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 2-Column Info Grid */}
        <View style={styles.gridContainer}>
          {/* Row 1: Seller Info & Primary Invoice Info */}
          <View style={styles.row}>
            <View style={styles.col50}>
              <Text style={styles.sectionTitle}>Company Details (Seller)</Text>
              <Text style={styles.textLg}>{details.companyName}</Text>
              <Text style={{ lineHeight: 1.3 }}>{details.companyAddress}</Text>
              <Text style={{ marginTop: 4 }}><Text style={styles.bold}>GSTIN/UIN: </Text>{details.companyGstin}</Text>
              <Text><Text style={styles.bold}>State Name: </Text>{details.companyState}, Code : {details.companyStateCode}</Text>
              <Text><Text style={styles.bold}>Contact: </Text>{details.companyPhone} • <Text style={styles.bold}>Email: </Text>{details.companyEmail}</Text>
            </View>
            <View style={styles.col50Last}>
              <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#cccccc', paddingBottom: 4, marginBottom: 4 }}>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Invoice No.</Text>
                  <Text style={[styles.bold, { fontSize: 9 }]}>{details.invoiceNo}</Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Dated</Text>
                  <Text style={[styles.bold, { fontSize: 9 }]}>{details.invoiceDate}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#cccccc', paddingBottom: 4, marginBottom: 4 }}>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Delivery Note</Text>
                  <Text>{details.deliveryNote}</Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Mode/Terms of Payment</Text>
                  <Text>{details.paymentMode}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#cccccc', paddingBottom: 4, marginBottom: 4 }}>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Buyer's Order No.</Text>
                  <Text>{details.buyerOrderNo}</Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Dated</Text>
                  <Text>{details.buyerOrderDate}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Dispatch Doc No.</Text>
                  <Text>{details.dispatchDocNo}</Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={styles.bold}>Delivery Note Date</Text>
                  <Text>{details.deliveryNoteDate}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Row 2: Buyer & Shipping Details */}
          <View style={styles.rowLast}>
            <View style={styles.col50}>
              <Text style={styles.sectionTitle}>Consignee (Ship to)</Text>
              <Text style={styles.bold}>{details.buyerName}</Text>
              <Text style={{ lineHeight: 1.3 }}>{details.buyerAddress}</Text>
              <Text><Text style={styles.bold}>GSTIN/UIN: </Text>{details.buyerGstin}</Text>
              <Text style={{ marginBottom: 4 }}><Text style={styles.bold}>State Name: </Text>{details.buyerState}, Code: {details.buyerStateCode}</Text>
              
              <Text style={[styles.sectionTitle, { borderTopWidth: 0.5, borderTopColor: '#cccccc', paddingTop: 4 }]}>Buyer (Bill to)</Text>
              <Text style={styles.bold}>{details.buyerName}</Text>
              <Text style={{ lineHeight: 1.3 }}>{details.buyerAddress}</Text>
              <Text><Text style={styles.bold}>GSTIN/UIN: </Text>{details.buyerGstin}</Text>
              <Text><Text style={styles.bold}>State Name: </Text>{details.buyerState}, Code: {details.buyerStateCode}</Text>
            </View>
            <View style={styles.col50Last}>
              <Text style={styles.bold}>Dispatched through</Text>
              <Text style={{ marginBottom: 6 }}>{details.dispatchedThrough}</Text>
              
              <Text style={styles.bold}>Destination</Text>
              <Text style={{ marginBottom: 6 }}>{details.destination}</Text>

              <Text style={styles.bold}>Terms of Delivery</Text>
              <Text style={{ lineHeight: 1.2 }}>{details.termsOfDelivery}</Text>
            </View>
          </View>
        </View>

        {/* Product Details Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.bold, styles.cellSlHeader]}>Sl</Text>
            <Text style={[styles.bold, styles.cellDescHeader]}>Description of Goods</Text>
            <Text style={[styles.bold, styles.cellHsnHeader]}>HSN/SAC</Text>
            <Text style={[styles.bold, styles.cellGstHeader]}>GST</Text>
            <Text style={[styles.bold, styles.cellQtyHeader]}>Quantity</Text>
            <Text style={[styles.bold, styles.cellRateHeader]}>Rate (Excl.)</Text>
            <Text style={[styles.bold, styles.cellAmtHeader]}>Amount</Text>
          </View>

          {/* Item Rows */}
          {processedItems.map((item) => (
            <View key={item.sl} style={styles.tableRow}>
              <Text style={styles.cellSl}>{item.sl}</Text>
              <Text style={styles.cellDesc}>
                <Text style={styles.bold}>{item.name}</Text>
                {item.sku && <Text style={{ fontSize: 6.5, color: '#475569' }}> (SKU: {item.sku})</Text>}
              </Text>
              <Text style={styles.cellHsn}>{item.hsn}</Text>
              <Text style={styles.cellGst}>{item.gstPercent}%</Text>
              <Text style={styles.cellQty}>{item.qty.toFixed(2)} {item.unit}</Text>
              <Text style={styles.cellRate}>₹{item.unitPriceExclTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <Text style={styles.cellAmt}>₹{item.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          ))}

          {/* CGST, SGST tax output rows within table */}
          {processedItems.map((item, index) => {
            const halfRate = (item.gstPercent / 2).toFixed(1);
            const cgstAmt = item.taxAmt / 2;
            return (
              <View key={`tax-${index}`} style={[styles.tableRow, { minHeight: 14, backgroundColor: '#fafafa', borderBottomWidth: 0.5 }]}>
                <Text style={styles.cellSl} />
                <Text style={[styles.cellDesc, { color: '#475569', fontSize: 7 }]}>
                  CGST OUTPUT @ {halfRate}%
                </Text>
                <Text style={styles.cellHsn} />
                <Text style={styles.cellGst} />
                <Text style={styles.cellQty} />
                <Text style={styles.cellRate} />
                <Text style={styles.cellAmt}>₹{cgstAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            );
          })}
          {processedItems.map((item, index) => {
            const halfRate = (item.gstPercent / 2).toFixed(1);
            const sgstAmt = item.taxAmt / 2;
            return (
              <View key={`tax-sgst-${index}`} style={[styles.tableRow, { minHeight: 14, backgroundColor: '#fafafa', borderBottomWidth: 0.5 }]}>
                <Text style={styles.cellSl} />
                <Text style={[styles.cellDesc, { color: '#475569', fontSize: 7 }]}>
                  SGST OUTPUT @ {halfRate}%
                </Text>
                <Text style={styles.cellHsn} />
                <Text style={styles.cellGst} />
                <Text style={styles.cellQty} />
                <Text style={styles.cellRate} />
                <Text style={styles.cellAmt}>₹{sgstAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            );
          })}

          {/* Shipping Charges Row */}
          {details.shippingCharges > 0 && (
            <View style={[styles.tableRow, { minHeight: 14 }]}>
              <Text style={styles.cellSl} />
              <Text style={[styles.cellDesc, { fontSize: 7 }]}><Text style={styles.bold}>PACKING & FORWARDING CHARGES</Text></Text>
              <Text style={styles.cellHsn} />
              <Text style={styles.cellGst} />
              <Text style={styles.cellQty} />
              <Text style={styles.cellRate} />
              <Text style={styles.cellAmt}>₹{details.shippingCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          )}

          {/* Round Off Row */}
          {computedRoundOff !== 0 && (
            <View style={[styles.tableRow, { minHeight: 14 }]}>
              <Text style={styles.cellSl} />
              <Text style={[styles.cellDesc, { fontSize: 7 }]}><Text style={styles.bold}>ROUND OFF</Text></Text>
              <Text style={styles.cellHsn} />
              <Text style={styles.cellGst} />
              <Text style={styles.cellQty} />
              <Text style={styles.cellRate} />
              <Text style={styles.cellAmt}>₹{computedRoundOff.toFixed(2)}</Text>
            </View>
          )}

          {/* Total Row */}
          <View style={styles.tableTotalRow}>
            <Text style={styles.cellSl} />
            <Text style={[styles.bold, styles.cellDesc, { fontSize: 8 }]}>Total</Text>
            <Text style={styles.cellHsn} />
            <Text style={styles.cellGst} />
            <Text style={[styles.bold, styles.cellQty, { textAlign: 'right', fontSize: 8 }]}>
              {processedItems.reduce((acc, x) => acc + x.qty, 0).toFixed(2)} {processedItems[0]?.unit || 'PCS'}
            </Text>
            <Text style={styles.cellRate} />
            <Text style={[styles.bold, styles.cellAmt, { fontSize: 9 }]}>₹{finalGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Amount in words */}
        <View style={{ marginBottom: 8, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 7.5 }}><Text style={styles.bold}>Amount Chargeable (in words): </Text>{numberToWords(finalGrandTotal)}</Text>
        </View>

        {/* HSN Breakdown Table */}
        <View style={styles.hsnTableContainer}>
          <View style={styles.hsnHeader}>
            <Text style={[styles.bold, styles.hsnColCodeHeader]}>HSN/SAC</Text>
            <Text style={[styles.bold, styles.hsnColValHeader]}>Taxable Value</Text>
            <Text style={[styles.bold, styles.hsnColTaxHeader]}>Central Tax / State Tax Breakup</Text>
            <Text style={[styles.bold, styles.hsnColTotalHeader]}>Total Tax</Text>
          </View>
          
          <View style={styles.hsnSubHeader}>
            <View style={{ width: '20%' }} />
            <View style={{ width: '20%' }} />
            {/* Split for CGST and SGST */}
            <Text style={[styles.bold, { width: '10%', textAlign: 'center', fontSize: 6.5, borderRightWidth: 1, borderRightColor: '#000000', padding: 2 }]}>CGST Rate</Text>
            <Text style={[styles.bold, { width: '15%', textAlign: 'center', fontSize: 6.5, borderRightWidth: 1, borderRightColor: '#000000', padding: 2 }]}>CGST Amt</Text>
            <Text style={[styles.bold, { width: '10%', textAlign: 'center', fontSize: 6.5, borderRightWidth: 1, borderRightColor: '#000000', padding: 2 }]}>SGST Rate</Text>
            <Text style={[styles.bold, { width: '15%', textAlign: 'center', fontSize: 6.5, borderRightWidth: 1, borderRightColor: '#000000', padding: 2 }]}>SGST Amt</Text>
            <View style={{ width: '10%' }} />
          </View>

          {Object.entries(hsnGroups).map(([key, data]) => {
            const hsnCode = key.split('_')[0];
            const halfRate = (data.rate / 2).toFixed(1) + '%';
            const cgstAmt = data.tax / 2;
            const sgstAmt = data.tax / 2;
            return (
              <View key={key} style={styles.hsnRow}>
                <Text style={styles.hsnColCode}>{hsnCode}</Text>
                <Text style={styles.hsnColVal}>₹{data.taxable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.hsnColCgstRate}>{halfRate}</Text>
                <Text style={styles.hsnColCgstAmt}>₹{cgstAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.hsnColSgstRate}>{halfRate}</Text>
                <Text style={styles.hsnColSgstAmt}>₹{sgstAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.hsnColTotal}>₹{data.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            );
          })}

          {/* HSN Total Row */}
          <View style={[styles.hsnRow, { backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#000000', fontWeight: 'bold' }]}>
            <Text style={[styles.hsnColCode, styles.bold]}>Total</Text>
            <Text style={[styles.hsnColVal, styles.bold]}>₹{totalTaxableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.hsnColCgstRate} />
            <Text style={[styles.hsnColCgstAmt, styles.bold]}>₹{(totalTaxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.hsnColSgstRate} />
            <Text style={[styles.hsnColSgstAmt, styles.bold]}>₹{(totalTaxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={[styles.hsnColTotal, styles.bold]}>₹{totalTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Tax in words */}
        <View style={{ marginBottom: 8, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 7.5 }}><Text style={styles.bold}>Tax Amount (in words): </Text>{numberToWords(totalTaxAmount)}</Text>
        </View>

        {/* Bank & Signature Block */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
            <View>
              <Text style={[styles.bold, { fontSize: 7, textTransform: 'uppercase', marginBottom: 2 }]}>Declaration / Terms:</Text>
              <Text style={{ lineHeight: 1.4, fontSize: 6.5 }}>{details.declaration}</Text>
            </View>
            
            {/* Bank details nested */}
            <View style={{ borderTopWidth: 0.5, borderTopColor: '#cccccc', paddingTop: 4, marginTop: 4 }}>
              <Text style={styles.bold}>Company's Bank Details:</Text>
              <Text><Text style={styles.bold}>A/c Holder Name: </Text>{details.bankHolderName}</Text>
              <Text><Text style={styles.bold}>Bank Name: </Text>{details.bankName} • <Text style={styles.bold}>A/c No: </Text>{details.bankAccountNo}</Text>
              <Text><Text style={styles.bold}>IFSC / Branch: </Text>{details.bankIfsc} • {details.bankBranch}</Text>
            </View>
          </View>
          
          <View style={styles.footerRight}>
            <Text style={styles.bold}>for {details.companyName.toUpperCase()}</Text>
            
            {/* Signature Area */}
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              {/* Decorative signature graphic line */}
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#000000', width: 100, marginBottom: 2 }} />
              <Text style={{ fontSize: 7, color: '#334155' }}>{details.signatureText}</Text>
            </View>
          </View>
        </View>

        {/* Jurisdiction notice */}
        <Text style={{ textAlign: 'center', fontSize: 6, color: '#64748b', marginTop: 8 }}>
          SUBJECT TO MANGALURU JURISDICTION • THIS IS A COMPUTER GENERATED INVOICE
        </Text>
      </Page>
    </Document>
  );
};
