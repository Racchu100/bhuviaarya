'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Tags, 
  TrendingUp, 
  ArrowUpRight,
  Plus,
  Download,
  Users,
  Boxes,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SupabaseSetupAlert from '@/components/SupabaseSetupAlert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: productsData } = await supabase.from('products').select('*');
      const { data: categoriesData } = await supabase.from('categories').select('*');
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setIsLoading(false);
    } catch (err) {
      console.warn('Dashboard metrics paused: Data tables not yet initialized.');
      setIsLoading(false);
    }
  };

  const exportData = async (type: string) => {
    setIsExporting(type);
    setShowExportMenu(false);
    try {
      let filename = `BA_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      let dataToExport: any[] = [];

      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      };

      if (type === 'customers') {
        const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (!data) throw new Error('No data found');
        dataToExport = data.map(row => ({
          'Date': formatDate(row.created_at),
          'Name': row.name,
          'Phone': row.phone,
          'Address': row.address
        }));
      } else if (type === 'products') {
        const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
        if (!data) throw new Error('No data found');
        dataToExport = data.map(row => ({
          'Date': formatDate(row.created_at),
          'SKU': row.sku,
          'Name': row.name,
          'Category': row.categories?.name,
          'Price (₹)': row.price
        }));
      } else if (type === 'inventory') {
        const { data } = await supabase.from('products').select('*').order('total_stock', { ascending: true });
        if (!data) throw new Error('No data found');
        dataToExport = data.map(row => ({
          'SKU': row.sku,
          'Name': row.name,
          'In Stock': row.total_stock,
          'Sold': row.sold_quantity,
          'Status': row.total_stock <= 5 ? 'LOW STOCK' : 'IN STOCK'
        }));
      } else if (type === 'sales') {
        const { data } = await supabase.from('sales').select('*, customers(name), products(name, sku)').order('created_at', { ascending: false });
        if (!data) throw new Error('No data found');
        dataToExport = data.map(row => ({
          'Date': formatDate(row.created_at),
          'Customer': row.customers?.name,
          'Product': row.products?.name,
          'SKU': row.products?.sku,
          'Qty': row.quantity,
          'Unit Price (₹)': row.unit_price,
          'GST %': row.gst_percent,
          'Total Amount (₹)': row.total_amount,
          'Paid (₹)': row.paid_amount,
          'Status': row.payment_status
        }));
      } else if (type === 'billing') {
        const { data: invoices } = await supabase.from('invoices').select('*, sales(*, customers(name), products(name, sku))').order('created_at', { ascending: false });
        if (!invoices) throw new Error('No data found');
        dataToExport = invoices.map(inv => ({
          'Date': formatDate(inv.created_at),
          'Invoice #': inv.invoice_number,
          'Customer': inv.sales?.customers?.name,
          'Amount (₹)': inv.sales?.total_amount,
          'Status': inv.sales?.payment_status
        }));
      }

      if (dataToExport.length === 0) throw new Error('No data to export');

      // Create Excel Workbook
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));

      // Auto-size columns logic
      const colWidths = Object.keys(dataToExport[0]).map(key => {
        let maxLen = key.length;
        dataToExport.forEach(row => {
          const val = row[key] ? row[key].toString() : '';
          maxLen = Math.max(maxLen, val.length);
        });
        return { wch: maxLen + 5 }; // Add padding for clarity
      });
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, filename);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully`);

    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    { id: 'customers', name: 'Customer Details', icon: Users },
    { id: 'products', name: 'Product Details', icon: Package },
    { id: 'inventory', name: 'Inventory Status', icon: Boxes },
    { id: 'sales', name: 'Full Sales Report', icon: TrendingUp },
    { id: 'billing', name: 'Billing & Invoices', icon: FileSpreadsheet },
  ];

  const stats = [
    { 
      name: 'Total Products', 
      value: isLoading ? '...' : products.length.toString(), 
      icon: Package, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Active Categories', 
      value: isLoading ? '...' : categories.length.toString(), 
      icon: Tags, 
      color: 'bg-brand-green' 
    },
  ];

  return (
    <div className="space-y-10">
      <SupabaseSetupAlert />

      {isConfigured && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
              <p className="text-slate-500 font-medium">Manage your boutique's collection and categories.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Reports Export Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold border border-slate-100 shadow-sm hover:shadow-lg transition-all active:scale-95"
                >
                  <Download className="w-5 h-5 text-brand-green" />
                  Export Reports
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showExportMenu && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showExportMenu && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowExportMenu(false)}
                        className="fixed inset-0 z-40 bg-black/5"
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-50 p-3 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-50 mb-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Report Type</h4>
                        </div>
                        <div className="space-y-1">
                          {exportOptions.map((opt) => (
                            <button
                              key={opt.id}
                              disabled={isExporting !== null}
                              onClick={() => exportData(opt.id)}
                              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all text-left group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-brand-green group-hover:shadow-sm transition-all">
                                {isExporting === opt.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <opt.icon className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{opt.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">Download CSV format</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                href="/admin/products"
                className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add New Product
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.name}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-brand-green transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.name}</p>
                <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
