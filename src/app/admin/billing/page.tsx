'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  IndianRupee, 
  Calendar,
  ExternalLink,
  Loader2,
  MessageCircle,
  Filter,
  X,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  RefreshCcw,
  ChevronRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BillingInvoices() {
  const [sales, setSales] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // e-Invoice Editor States
  const [activeEditInvoice, setActiveEditInvoice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('header');
  const [editForm, setEditForm] = useState<any>(null);

  const handleOpenEdit = (inv: any, invNum: string) => {
    setActiveEditInvoice(inv);
    
    // map items
    const mappedItems = inv.items.map((item: any) => ({
      name: item.products?.name || 'Standard Item',
      sku: item.products?.sku || 'N/A',
      hsn: '9403', // default HSN for furniture
      gstPercent: item.gst_percent || 18,
      qty: item.quantity || 1,
      qtyUnit: 'PCS',
      unitPriceInclTax: item.unit_price || 0,
      unitPriceExclTax: (item.unit_price || 0) / (1 + (item.gst_percent || 18) / 100),
      amount: (item.quantity || 1) * ((item.unit_price || 0) / (1 + (item.gst_percent || 18) / 100))
    }));

    setEditForm({
      irn: '07af9190ff32719067dde629b0e23f6ee7653c12ba1-' + Math.random().toString(36).substring(2, 10),
      ackNo: '11' + Math.floor(100000000000 + Math.random() * 900000000000),
      ackDate: new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
      companyName: 'BHUVI AARYA ENTERPRISES',
      companyAddress: 'DOOR NO 22-3- 407, GUJJARAKERE ROAD,\nNEAR JEPPU MARKET, MANGALORE-575001',
      companyGstin: '29AZYPN5189L1Z0',
      companyPhone: '9591554745',
      companyEmail: 'bhuviaarya@gmail.com',
      companyState: 'Karnataka',
      companyStateCode: '29',
      buyerName: inv.customers?.name || 'Unregistered Customer',
      buyerAddress: inv.customers?.address || 'N/A',
      buyerPhone: inv.customers?.phone || 'N/A',
      buyerGstin: 'URD (Unregistered)',
      buyerState: 'Karnataka',
      buyerStateCode: '29',
      invoiceNo: `INV-${invNum}`,
      invoiceDate: new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
      deliveryNote: 'N/A',
      paymentMode: inv.payment_method || 'Cash/UPI',
      buyerOrderNo: 'N/A',
      buyerOrderDate: 'N/A',
      dispatchDocNo: 'N/A',
      deliveryNoteDate: 'N/A',
      dispatchedThrough: 'MANJUNATH',
      destination: 'Local',
      termsOfDelivery: 'Immediate delivery upon complete clearance.',
      bankHolderName: 'BHUVI AARYA ENTERPRISES',
      bankName: 'HDFC BANK',
      bankAccountNo: '50200109458213',
      bankIfsc: 'HDFC0001749',
      bankBranch: 'MANGALORE',
      shippingCharges: 0,
      roundOff: 0,
      declaration: '*Terms & Condition: Subject to MANGALURU Jurisdiction.\n*We hereby declare that this tax invoice shows the actual price of the goods described and that all particulars are true and correct.\n*Goods once sold shall not be accepted for exchange or refund.',
      signatureText: 'Authorised Signatory',
      items: mappedItems
    });
    
    setActiveTab('header');
  };

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    const { data: salesData } = await supabase
      .from('sales')
      .select('*, customers(name, phone, address), products(name, sku)')
      .order('created_at', { ascending: false });
    
    const { data: invoicesData } = await supabase.from('invoices').select('*');
    
    const salesList = salesData || [];
    const invList = invoicesData || [];

    // Group sales to identify missing invoices
    const groups = groupSalesIntoInvoices(salesList);
    const missingInvoices = groups.filter(g => !invList.find(i => i.sale_id === g.id));

    if (missingInvoices.length > 0) {
      // Find max serial number from current invoices
      let maxSerial = 0;
      invList.forEach(inv => {
        const parts = inv.invoice_number.split('/');
        const serial = parseInt(parts[parts.length - 1]);
        if (!isNaN(serial) && serial > maxSerial) maxSerial = serial;
      });

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const newInvoices = missingInvoices.reverse().map((group, index) => {
        const nextSerial = maxSerial + index + 1;
        const paddedSerial = String(nextSerial).padStart(4, '0');
        return {
          sale_id: group.id,
          invoice_number: `BA/${currentYear}/${paddedSerial}`,
          created_at: new Date().toISOString()
        };
      });

      const { error: insertError } = await supabase.from('invoices').insert(newInvoices);
      if (!insertError) {
        // Re-fetch invoices after minting
        const { data: updatedInvoices } = await supabase.from('invoices').select('*');
        setInvoices(updatedInvoices || []);
      }
    } else {
      setInvoices(invList);
    }
    
    setSales(salesList);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const getInvoiceNumber = (saleId: string) => {
    const inv = invoices.find(i => i.sale_id === saleId);
    if (inv) return inv.invoice_number;
    return 'BA/PENDING';
  };

  const groupSalesIntoInvoices = (salesData: any[]) => {
    const groups: { [key: string]: any } = {};
    
    salesData.forEach(sale => {
      // Grouping key: customer_id + exact timestamp
      const key = `${sale.customer_id}_${sale.created_at}`;
      
      if (!groups[key]) {
        groups[key] = {
          ...sale,
          items: [sale],
          combined_total: sale.total_amount || 0,
          combined_paid: sale.paid_amount || 0
        };
      } else {
        groups[key].items.push(sale);
        groups[key].combined_total += (sale.total_amount || 0);
        groups[key].combined_paid += (sale.paid_amount || 0);
      }
    });
    
    return Object.values(groups);
  };

  const groupedSales = groupSalesIntoInvoices(sales);

  const filteredInvoices = groupedSales.filter(inv => {
    const invDate = new Date(inv.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    // Date filter
    if (start && invDate < start) return false;
    if (end) {
      const endPlusDay = new Date(end);
      endPlusDay.setDate(endPlusDay.getDate() + 1);
      if (invDate >= endPlusDay) return false;
    }

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesCustomer = inv.customers?.name?.toLowerCase().includes(searchLower);
    const matchesInvoice = getInvoiceNumber(inv.id).toLowerCase().includes(searchLower);
    if (searchQuery && !matchesCustomer && !matchesInvoice) return false;

    // Amount filter
    const amount = inv.combined_total || 0;
    if (minAmount && amount < Number(minAmount)) return false;
    if (maxAmount && amount > Number(maxAmount)) return false;

    return true;
  });

  const handleDeleteInvoice = async (inv: any) => {
    if (!inv || !inv.id) {
      alert('Error: Invalid invoice data');
      return;
    }

    if (!confirm('Are you sure you want to delete this entire invoice and its items? This action cannot be undone.')) return;

    try {
      setIsRefreshing(true);
      
      // 1. Extract all sale IDs in this group
      const saleIds = inv.items.map((item: any) => item.id);

      // 2. Delete ALL associated invoice records FIRST to avoid FK constraints
      const { error: invError } = await supabase.from('invoices').delete().in('sale_id', saleIds);
      if (invError) {
        console.error('Invoice records delete error:', invError);
        throw new Error('Failed to delete invoice records: ' + invError.message);
      }

      // 3. Delete all sales items in this group
      const { error: salesError } = await supabase.from('sales').delete().in('id', saleIds);
      if (salesError) {
        console.error('Sales items delete error:', salesError);
        throw new Error('Failed to delete sales items: ' + salesError.message);
      }

      // 3. Update stock for deleted items
      for (const item of inv.items) {
        const { data: prod } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', item.product_id).single();
        if (prod) {
          await supabase.from('products').update({
            total_stock: (prod.total_stock || 0) + (item.quantity || 1),
            sold_quantity: Math.max(0, (prod.sold_quantity || 0) - (item.quantity || 1))
          }).eq('id', item.product_id);
        }
      }

      toast.success('Invoice and associated items deleted successfully');
      fetchData();
    } catch (err: any) {
      console.error('FULL DELETE ERROR:', err);
      alert(err.message || 'An unexpected error occurred during deletion');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-slate-500 font-medium">Generate and manage tax-compliant GST invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-4 rounded-2xl border transition-all flex items-center gap-2 font-bold",
              showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 shadow-sm"
            )}
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Customer or Invoice #</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Type name or invoice number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setStartDate(''); setEndDate(''); setSearchQuery(''); setMinAmount(''); setMaxAmount(''); setFilterStatus('all');
                    }}
                    className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date From</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date To</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min Total (₹)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Total (₹)</label>
                  <input 
                    type="number"
                    placeholder="Unlimited"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
          <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 relative z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] mb-1 relative z-10">Total Invoiced</p>
          <h3 className="text-3xl font-black text-slate-900 relative z-10">
            ₹{groupedSales.reduce((acc, inv) => acc + (inv.combined_total || 0), 0).toLocaleString()}
          </h3>
          {filteredInvoices.length !== groupedSales.length && (
            <p className="text-[10px] font-bold text-brand-green mt-2 animate-pulse">
              Filtered: ₹{filteredInvoices.reduce((acc, inv) => acc + (inv.combined_total || 0), 0).toLocaleString()}
            </p>
          )}
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
            <IndianRupee className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Outstanding</p>
          <h3 className="text-3xl font-black text-slate-900">
            ₹{groupedSales.reduce((acc, inv) => acc + (inv.combined_total - inv.combined_paid), 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Invoices</p>
          <h3 className="text-3xl font-black text-slate-900">{groupedSales.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice #</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Items</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading invoices...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const invNum = getInvoiceNumber(inv.id);
                  return (
                    <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-900">
                        INV-{invNum}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-600">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900">{inv.customers?.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{inv.customers?.phone}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-[200px]">
                          {inv.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-slate-600 truncate font-medium">
                              • {item.products?.name} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-black text-slate-900">₹{inv.combined_total?.toLocaleString()}</div>
                        {inv.payment_status === 'pending' && (
                          <div className="text-[10px] font-black text-rose-500 uppercase">
                            Pending: ₹{(inv.combined_total - (inv.combined_paid || 0)).toLocaleString()}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Incl. GST</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(inv, invNum)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:shadow-lg hover:shadow-brand-green/20 active:scale-95 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit & Export
                          </button>
                          <button 
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="px-8 py-24 text-center text-slate-400 font-bold">No billable sales found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Dynamic e-Invoice Editor Modal */}
      <AnimatePresence>
        {activeEditInvoice && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveEditInvoice(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <FileText className="text-brand-green w-6 h-6" /> Edit & Export Invoice
                  </h2>
                  <p className="text-slate-500 font-medium text-xs mt-1">Customize GST fields, HSN codes, and dispatch info before generating e-Invoice PDF</p>
                </div>
                <button 
                  onClick={() => setActiveEditInvoice(null)}
                  className="p-3 rounded-2xl hover:bg-white transition-colors text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Buttons */}
              <div className="flex border-b border-slate-100 bg-slate-50/30 px-6 gap-2 py-2 overflow-x-auto">
                {[
                  { id: 'header', label: '1. e-Invoice & Dispatch' },
                  { id: 'parties', label: '2. Seller & Buyer Details' },
                  { id: 'items', label: '3. Products & Tax Rates' },
                  { id: 'bank', label: '4. Bank & Terms' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold text-xs transition-all",
                      activeTab === tab.id
                        ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents - Scrollable Form */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {activeTab === 'header' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">e-Invoice Metadata</h3>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IRN (Invoice Reference Number)</label>
                        <input
                          type="text"
                          value={editForm.irn}
                          onChange={(e) => setEditForm({ ...editForm, irn: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ack No.</label>
                          <input
                            type="text"
                            value={editForm.ackNo}
                            onChange={(e) => setEditForm({ ...editForm, ackNo: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ack Date</label>
                          <input
                            type="text"
                            value={editForm.ackDate}
                            onChange={(e) => setEditForm({ ...editForm, ackDate: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Invoice Number</label>
                          <input
                            type="text"
                            value={editForm.invoiceNo}
                            onChange={(e) => setEditForm({ ...editForm, invoiceNo: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Invoice Date</label>
                          <input
                            type="text"
                            value={editForm.invoiceDate}
                            onChange={(e) => setEditForm({ ...editForm, invoiceDate: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">Dispatch & Delivery Note</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Delivery Note</label>
                          <input
                            type="text"
                            value={editForm.deliveryNote}
                            onChange={(e) => setEditForm({ ...editForm, deliveryNote: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Mode/Terms</label>
                          <input
                            type="text"
                            value={editForm.paymentMode}
                            onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buyer's Order No.</label>
                          <input
                            type="text"
                            value={editForm.buyerOrderNo}
                            onChange={(e) => setEditForm({ ...editForm, buyerOrderNo: e.target.value })}
                            className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Order Date</label>
                        <input
                          type="text"
                          value={editForm.buyerOrderDate}
                          onChange={(e) => setEditForm({ ...editForm, buyerOrderDate: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dispatch Doc No.</label>
                        <input
                          type="text"
                          value={editForm.dispatchDocNo}
                          onChange={(e) => setEditForm({ ...editForm, dispatchDocNo: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Delivery Note Date</label>
                        <input
                          type="text"
                          value={editForm.deliveryNoteDate}
                          onChange={(e) => setEditForm({ ...editForm, deliveryNoteDate: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dispatched through</label>
                        <input
                          type="text"
                          value={editForm.dispatchedThrough}
                          onChange={(e) => setEditForm({ ...editForm, dispatchedThrough: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                        <input
                          type="text"
                          value={editForm.destination}
                          onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Terms of Delivery</label>
                      <input
                        type="text"
                        value={editForm.termsOfDelivery}
                        onChange={(e) => setEditForm({ ...editForm, termsOfDelivery: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'parties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seller details */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">1. Seller Details</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                      <input
                        type="text"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Address</label>
                      <textarea
                        rows={2}
                        value={editForm.companyAddress}
                        onChange={(e) => setEditForm({ ...editForm, companyAddress: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GSTIN/UIN</label>
                        <input
                          type="text"
                          value={editForm.companyGstin}
                          onChange={(e) => setEditForm({ ...editForm, companyGstin: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                        <input
                          type="text"
                          value={editForm.companyPhone}
                          onChange={(e) => setEditForm({ ...editForm, companyPhone: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State Name</label>
                        <input
                          type="text"
                          value={editForm.companyState}
                          onChange={(e) => setEditForm({ ...editForm, companyState: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State Code</label>
                        <input
                          type="text"
                          value={editForm.companyStateCode}
                          onChange={(e) => setEditForm({ ...editForm, companyStateCode: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buyer details */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">2. Consignee / Buyer</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buyer/Consignee Name</label>
                      <input
                        type="text"
                        value={editForm.buyerName}
                        onChange={(e) => setEditForm({ ...editForm, buyerName: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buyer Address</label>
                      <textarea
                        rows={2}
                        value={editForm.buyerAddress}
                        onChange={(e) => setEditForm({ ...editForm, buyerAddress: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GSTIN/UIN (or 'URD')</label>
                        <input
                          type="text"
                          value={editForm.buyerGstin}
                          onChange={(e) => setEditForm({ ...editForm, buyerGstin: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                        <input
                          type="text"
                          value={editForm.buyerPhone}
                          onChange={(e) => setEditForm({ ...editForm, buyerPhone: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State Name</label>
                        <input
                          type="text"
                          value={editForm.buyerState}
                          onChange={(e) => setEditForm({ ...editForm, buyerState: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State Code</label>
                        <input
                          type="text"
                          value={editForm.buyerStateCode}
                          onChange={(e) => setEditForm({ ...editForm, buyerStateCode: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'items' && (
                <div className="space-y-6">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">3. Product & Tax Rate Overrides</h3>
                  
                  <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                    {editForm.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                            <p className="text-slate-400 text-[10px] font-medium mt-0.5">SKU: {item.sku}</p>
                          </div>
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Item #{idx + 1}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">HSN/SAC Code</label>
                            <input
                              type="text"
                              value={item.hsn}
                              onChange={(e) => {
                                const newItems = [...editForm.items];
                                newItems[idx].hsn = e.target.value;
                                setEditForm({ ...editForm, items: newItems });
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Qty</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.qty}
                              onChange={(e) => {
                                const newItems = [...editForm.items];
                                newItems[idx].qty = parseFloat(e.target.value) || 0;
                                newItems[idx].amount = newItems[idx].qty * newItems[idx].unitPriceExclTax;
                                setEditForm({ ...editForm, items: newItems });
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Qty Unit</label>
                            <input
                              type="text"
                              value={item.qtyUnit}
                              onChange={(e) => {
                                const newItems = [...editForm.items];
                                newItems[idx].qtyUnit = e.target.value;
                                setEditForm({ ...editForm, items: newItems });
                              }}
                              placeholder="PCS or MTR"
                              className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">GST Rate (%)</label>
                            <select
                              value={item.gstPercent}
                              onChange={(e) => {
                                const newItems = [...editForm.items];
                                newItems[idx].gstPercent = parseInt(e.target.value);
                                newItems[idx].unitPriceExclTax = newItems[idx].unitPriceInclTax / (1 + newItems[idx].gstPercent / 100);
                                newItems[idx].amount = newItems[idx].qty * newItems[idx].unitPriceExclTax;
                                setEditForm({ ...editForm, items: newItems });
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                            >
                              <option value={0}>0% (Exempt)</option>
                              <option value={5}>5% (CGST 2.5% / SGST 2.5%)</option>
                              <option value={12}>12% (CGST 6% / SGST 6%)</option>
                              <option value={18}>18% (CGST 9% / SGST 9%)</option>
                              <option value={28}>28% (CGST 14% / SGST 14%)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rate Incl. GST (₹)</label>
                            <input
                              type="number"
                              value={item.unitPriceInclTax}
                              onChange={(e) => {
                                const newItems = [...editForm.items];
                                newItems[idx].unitPriceInclTax = parseFloat(e.target.value) || 0;
                                newItems[idx].unitPriceExclTax = newItems[idx].unitPriceInclTax / (1 + newItems[idx].gstPercent / 100);
                                newItems[idx].amount = newItems[idx].qty * newItems[idx].unitPriceExclTax;
                                setEditForm({ ...editForm, items: newItems });
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Extra Packing/Forwarding & Round Off Charges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Packing & Forwarding Charges (₹)</label>
                      <input
                        type="number"
                        value={editForm.shippingCharges}
                        onChange={(e) => setEditForm({ ...editForm, shippingCharges: parseFloat(e.target.value) || 0 })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Manual Round Off Override (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Auto computed if 0"
                        value={editForm.roundOff || ''}
                        onChange={(e) => setEditForm({ ...editForm, roundOff: parseFloat(e.target.value) || 0 })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Leave 0 to auto-compute matching standard rounded decimals.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">Seller Bank Account Details</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={editForm.bankHolderName}
                        onChange={(e) => setEditForm({ ...editForm, bankHolderName: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Name</label>
                      <input
                        type="text"
                        value={editForm.bankName}
                        onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</label>
                      <input
                        type="text"
                        value={editForm.bankAccountNo}
                        onChange={(e) => setEditForm({ ...editForm, bankAccountNo: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IFSC Code</label>
                        <input
                          type="text"
                          value={editForm.bankIfsc}
                          onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch</label>
                        <input
                          type="text"
                          value={editForm.bankBranch}
                          onChange={(e) => setEditForm({ ...editForm, bankBranch: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal Declaration */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest text-brand-green">Declaration & Terms</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Declaration Details</label>
                      <textarea
                        rows={4}
                        value={editForm.declaration}
                        onChange={(e) => setEditForm({ ...editForm, declaration: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner resize-none font-medium leading-relaxed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Signature Graphic Label</label>
                      <input
                        type="text"
                        value={editForm.signatureText}
                        onChange={(e) => setEditForm({ ...editForm, signatureText: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 text-xs shadow-inner"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Text printed directly beneath the Seller's signature line.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Dynamic PDF Generator */}
            <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveEditInvoice(null)}
                className="flex-1 bg-slate-200/80 text-slate-700 py-4.5 rounded-2xl font-black text-xs hover:bg-slate-300 transition-all uppercase tracking-widest"
              >
                Close / Discard
              </button>
              
              <PDFDownloadLink 
                document={<InvoicePDF sale={activeEditInvoice} invoiceNumber={getInvoiceNumber(activeEditInvoice.id)} customDetails={editForm} />} 
                fileName={`Invoice_${getInvoiceNumber(activeEditInvoice.id).replace(/\//g, '_')}.pdf`}
                style={{ flex: 2, display: 'flex' }}
              >
                {({ loading }) => (
                  <button 
                    disabled={loading}
                    className={cn(
                      "w-full bg-brand-green text-white py-4.5 rounded-2xl font-black text-xs shadow-xl shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest",
                      loading ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : ""
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {loading ? 'Re-compiling Invoice PDF...' : 'Convert to PDF & Download'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
);
}
