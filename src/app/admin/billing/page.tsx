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
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: salesData } = await supabase
      .from('sales')
      .select('*, customers(name, phone, address), products(name, sku)')
      .order('created_at', { ascending: false });
    
    const { data: invoicesData } = await supabase.from('invoices').select('*');
    
    setSales(salesData || []);
    setInvoices(invoicesData || []);
    setIsLoading(false);
  };

  const getInvoiceNumber = (saleId: string) => {
    const inv = invoices.find(i => i.sale_id === saleId);
    if (inv) return inv.invoice_number;
    
    // Generate temporary if not saved
    const datePart = new Date().getFullYear().toString().slice(-2);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `BA/${datePart}/${randomPart}`;
  };

  const filteredSales = sales.filter(s => 
    s.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getInvoiceNumber(s.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing</h1>
          <p className="text-slate-500 font-medium">Generate and manage tax-compliant GST invoices.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by invoice number or customer..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-medium text-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice No.</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">Preparing financial records...</td></tr>
              ) : filteredSales.length > 0 ? (
                filteredSales.map((s) => {
                  const invNum = getInvoiceNumber(s.id);
                  return (
                    <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-brand-green" />
                          <span className="font-black text-slate-900 text-sm">{invNum}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-900">{s.customers?.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{s.customers?.phone}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-black text-slate-900">₹{s.total_amount?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Incl. 18% GST</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <PDFDownloadLink 
                            document={<InvoicePDF sale={s} invoiceNumber={invNum} />} 
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
                          <a 
                            href={`https://wa.me/${s.customers?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${s.customers?.name}, your invoice ${invNum} for ₹${s.total_amount.toLocaleString()} is ready. Please find it attached.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No billable sales found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
