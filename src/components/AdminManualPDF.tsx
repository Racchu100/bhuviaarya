'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.6
  },
  header: {
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    paddingBottom: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5
  },
  item: {
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0'
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 15
  },
  bulletDot: {
    width: 5,
    height: 5,
    backgroundColor: '#94a3b8',
    borderRadius: 5,
    marginTop: 6,
    marginRight: 8
  },
  bulletText: {
    flex: 1
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15
  }
});

export const AdminManualPDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>BHUVI AARYA ENTERPRISES</Text>
        <Text style={styles.subtitle}>ADMIN USER MANUAL</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Dashboard Overview</Text>
        <Text>Your command center providing a real-time snapshot of business performance, revenue, and inventory status.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Product Management</Text>
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Adding a New Product</Text>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Enter name, price, and high-quality image.</Text>
          </View>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Select category and set initial stock levels.</Text>
          </View>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Save to publish immediately to the live website.</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Billing & Invoices</Text>
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Tax Invoicing</Text>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Select customers and products to auto-calculate GST.</Text>
          </View>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Download professional branded PDF invoices with one click.</Text>
          </View>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Deletion of invoices automatically restores product stock.</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Business Settings</Text>
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Global Updates</Text>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Update WhatsApp number, email, and showroom address.</Text>
          </View>
          <View style={styles.bullet}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>Paste Google Maps embed links to update your location map.</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Bhuvi Aarya Enterprises - Excellence in Every Piece</Text>
        <Text>Designed & Developed by Graphitex Digitals • 2026</Text>
      </View>
    </Page>
  </Document>
);
