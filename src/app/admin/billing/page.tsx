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
  Trash2
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
                          <PDFDownloadLink 
                            document={<InvoicePDF sale={inv} invoiceNumber={invNum} />} 
                            fileName={`Invoice_${invNum.replace(/\//g, '_')}.pdf`}
                          >
                            {({ loading }) => (
                              <button 
                                disabled={loading}
                                className={cn(
                                  "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                                  loading 
                                    ? "bg-slate-50 text-slate-400 cursor-not-allowed" 
                                    : "bg-brand-green text-white hover:shadow-lg hover:shadow-brand-green/20 active:scale-95"
                                )}
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                {loading ? 'Generating...' : 'Download'}
                              </button>
                            )}
                          </PDFDownloadLink>
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
    </div>
  );
}
