'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Search, 
  Plus, 
  Calendar, 
  User, 
  Package, 
  CheckCircle2, 
  Clock, 
  X,
  TrendingUp,
  Filter,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([{ productId: '', amount: '', quantity: '1', gst: '18' }]);
  const [status, setStatus] = useState('Completed');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paidAmount, setPaidAmount] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const { data: prodData, error: prodErr } = await supabase.from('products').select('id, name, selling_price');
      const { data: custData, error: custErr } = await supabase.from('customers').select('id, name');

      if (prodErr) console.warn('Products fetch error:', prodErr.message);
      if (custErr) console.warn('Customers fetch error:', custErr.message);

      setProducts(prodData || []);
      setCustomers(custData || []);

      const { data: salesData, error: salesErr } = await supabase
        .from('sales')
        .select('*, customers(name), products(name)');

      if (salesErr) console.warn('Sales fetch error:', salesErr.message);
      
      const sortedSales = salesData ? [...salesData].sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      }) : [];

      setSales(sortedSales);
    } catch (err: any) {
      console.error('Fetch Error:', JSON.stringify(err, null, 2));
      toast.error('Failed to load sales data.');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', amount: '', quantity: '1', gst: '18' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;

    if (field === 'productId') {
      const p = products.find(prod => String(prod.id) === value);
      if (p) newItems[index].amount = String(p.selling_price || '');
    }
    setItems(newItems);
  };

  const handleOpenModal = (sale?: any) => {
    if (sale) {
      setEditingSale(sale);
      setSelectedCustomerId(sale.customer_id || '');
      setItems([{ 
        productId: String(sale.product_id || ''), 
        amount: String(sale.unit_price || sale.amount || ''), 
        quantity: String(sale.quantity || 1),
        gst: String(sale.gst_percent || '18')
      }]);
      setStatus(sale.status || 'Completed');
      setPaymentStatus(sale.payment_status || 'paid');
      setPaidAmount(String(sale.paid_amount || ''));
      setSaleDate(new Date(sale.created_at).toISOString().split('T')[0]);
    } else {
      setEditingSale(null);
      setSelectedCustomerId('');
      setItems([{ productId: '', amount: '', quantity: '1', gst: '18' }]);
      setStatus('Completed');
      setPaymentStatus('paid');
      setPaidAmount('');
      setSaleDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    
    const validItems = items.filter(item => item.productId && item.amount && item.quantity);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid product');
      return;
    }

    const grandTotalValue = items.reduce((acc, item) => acc + (Number(item.amount || 0) * Number(item.quantity || 1)), 0);
    const finalPaidValue = paymentStatus === 'paid' ? grandTotalValue : Number(paidAmount || 0);

    setIsSaving(true);
    try {
      if (editingSale) {
        const item = items[0];
        const unitPrice = Number(item.amount);
        const qty = Number(item.quantity);
        const itemTotal = unitPrice * qty;

        const oldQty = Number(editingSale.quantity || 1);
        const newQty = qty;
        
        if (editingSale.product_id !== item.productId || oldQty !== newQty) {
          const { data: oldProd } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', editingSale.product_id).single();
          if (oldProd) {
            await supabase.from('products').update({
              total_stock: (oldProd.total_stock || 0) + oldQty,
              sold_quantity: Math.max(0, (oldProd.sold_quantity || 0) - oldQty)
            }).eq('id', editingSale.product_id);
          }

          const { data: newProd } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', item.productId).single();
          if (newProd) {
            await supabase.from('products').update({
              total_stock: (newProd.total_stock || 0) - newQty,
              sold_quantity: (newProd.sold_quantity || 0) + newQty
            }).eq('id', item.productId);
          }
        }

        const { error } = await supabase
          .from('sales')
          .update({
            customer_id: selectedCustomerId,
            product_id: item.productId,
            amount: itemTotal,
            quantity: qty,
            unit_price: unitPrice,
            total_amount: itemTotal,
            gst_percent: Number(item.gst),
            status,
            payment_status: paymentStatus,
            paid_amount: finalPaidValue,
            created_at: new Date(saleDate).toISOString()
          })
          .eq('id', editingSale.id);
        
        if (error) throw error;
      } else {
        const salePromises = validItems.map(async (item) => {
          const unitPrice = Number(item.amount);
          const qty = Number(item.quantity);
          const itemTotal = unitPrice * qty;

          const { data: prod } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', item.productId).single();
          if (prod) {
            await supabase.from('products').update({
              total_stock: (prod.total_stock || 0) - qty,
              sold_quantity: (prod.sold_quantity || 0) + qty
            }).eq('id', item.productId);
          }

          return {
            customer_id: selectedCustomerId,
            product_id: item.productId,
            amount: itemTotal,
            quantity: qty,
            unit_price: unitPrice,
            total_amount: itemTotal,
            gst_percent: Number(item.gst),
            status,
            payment_status: paymentStatus,
            paid_amount: paymentStatus === 'paid' ? itemTotal : (finalPaidValue * (itemTotal / grandTotalValue)),
            created_at: new Date(saleDate).toISOString()
          };
        });

        const salesToInsert = await Promise.all(salePromises);
        const { error } = await supabase.from('sales').insert(salesToInsert);
        if (error) throw error;
      }

      toast.success(editingSale ? 'Sale Updated' : 'All Sales Recorded');
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      console.error('FULL DATABASE ERROR:', JSON.stringify(err, null, 2));
      toast.error(err.message || 'Failed to record sale');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;
    
    if (!confirm('Are you sure you want to delete this sale?')) return;
    try {
      const { data: prod } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', saleToDelete.product_id).single();
      if (prod) {
        await supabase.from('products').update({
          total_stock: (prod.total_stock || 0) + Number(saleToDelete.quantity || 1),
          sold_quantity: Math.max(0, (prod.sold_quantity || 0) - Number(saleToDelete.quantity || 1))
        }).eq('id', saleToDelete.product_id);
      }
      
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;

      toast.success('Sale deleted');
      fetchInitialData();
    } catch (err: any) {
      toast.error('Failed to delete record');
    }
  };

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    // Date filter
    if (start && saleDate < start) return false;
    if (end) {
      const endPlusDay = new Date(end);
      endPlusDay.setDate(endPlusDay.getDate() + 1);
      if (saleDate >= endPlusDay) return false;
    }

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesCustomer = sale.customers?.name?.toLowerCase().includes(searchLower);
    const matchesProduct = sale.products?.name?.toLowerCase().includes(searchLower);
    if (searchQuery && !matchesCustomer && !matchesProduct) return false;

    // Amount filter
    const amount = sale.amount || 0;
    if (minAmount && amount < Number(minAmount)) return false;
    if (maxAmount && amount > Number(maxAmount)) return false;

    // Status filter
    if (filterStatus !== 'all' && sale.payment_status !== filterStatus) return false;

    return true;
  });

  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.amount || 0), 0);
  const filteredRevenue = filteredSales.reduce((acc, sale) => acc + (sale.amount || 0), 0);
  const grandTotal = items.reduce((acc, item) => acc + (Number(item.amount || 0) * Number(item.quantity || 1)), 0);
  const balanceAmount = Math.max(0, grandTotal - Number(paidAmount || 0));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Records</h1>
          <p className="text-slate-500 font-medium">Track your revenue and order history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-4 rounded-2xl border transition-all flex items-center gap-2 font-bold",
              showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
            )}
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Record New Sale
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
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Customer or Product</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Type name, piece, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Status</label>
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-transparent focus-within:border-brand-green transition-all">
                    {['all', 'paid', 'pending'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          filterStatus === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {s === 'paid' ? 'Confirmed' : s === 'pending' ? 'Pending' : 'All'}
                      </button>
                    ))}
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min Price (₹)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Price (₹)</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
          <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 relative z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] mb-1 relative z-10">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 relative z-10">₹{totalRevenue.toLocaleString()}</h3>
          {filteredSales.length !== sales.length && (
            <p className="text-[10px] font-bold text-brand-green mt-2 animate-pulse">Filtered: ₹{filteredRevenue.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Orders</p>
          <h3 className="text-3xl font-black text-slate-900">{sales.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">Loading records...</td></tr>
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-600">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-900">{sale.customers?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600">{sale.products?.name || 'Masterpiece'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <span className="text-base font-black text-slate-900">₹{sale.amount.toLocaleString()}</span>
                        {sale.payment_status === 'pending' && (
                          <p className="text-[9px] font-black text-rose-500 uppercase mt-0.5">
                            Bal: ₹{(sale.amount - (sale.paid_amount || 0)).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit",
                          sale.status === 'Completed' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {sale.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {sale.status}
                        </div>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter w-fit",
                          sale.payment_status === 'paid' ? "bg-brand-green/10 text-brand-green" : "bg-rose-50 text-rose-500"
                        )}>
                          {sale.payment_status === 'paid' ? 'Confirmed' : 'Partial'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(sale)}
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-8 py-24 text-center text-slate-400 font-bold">No sales records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveSale} className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">
                      {editingSale ? 'Edit Sale' : 'Record Sale'}
                    </h2>
                    <p className="text-slate-500 font-medium">Log items and track payments.</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer</label>
                      <select 
                        required
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 appearance-none"
                      >
                        <option value="">Select Client</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sale Date</label>
                      <input 
                        type="date" 
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Masterpieces</label>
                      {!editingSale && (
                        <button 
                          type="button"
                          onClick={addItem}
                          className="text-xs font-black text-brand-green hover:text-green-600 flex items-center gap-1 uppercase tracking-tighter"
                        >
                          <Plus className="w-3 h-3" /> Add Another Item
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={index} className="relative bg-slate-50 p-6 rounded-3xl space-y-4 border border-transparent hover:border-slate-200 transition-all">
                          {items.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeItem(index)}
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Product</label>
                              <select 
                                required
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="w-full px-5 py-3 bg-white border-transparent rounded-xl focus:border-brand-green outline-none font-bold text-slate-900 appearance-none shadow-sm"
                              >
                                <option value="">Choose Piece</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Qty</label>
                                <input 
                                  type="number" 
                                  required
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                  className="w-full px-5 py-3 bg-white border-transparent rounded-xl focus:border-brand-green outline-none font-bold text-slate-900 shadow-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GST %</label>
                                <input 
                                  type="number" 
                                  required
                                  min="0"
                                  max="100"
                                  value={item.gst}
                                  onChange={(e) => updateItem(index, 'gst', e.target.value)}
                                  className="w-full px-5 py-3 bg-white border-transparent rounded-xl focus:border-brand-green outline-none font-bold text-slate-900 shadow-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Price (₹)</label>
                                <input 
                                  type="number" 
                                  required
                                  value={item.amount}
                                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                  placeholder="0.00"
                                  className="w-full px-5 py-3 bg-white border-transparent rounded-xl focus:border-brand-green outline-none font-bold text-slate-900 shadow-sm"
                                />
                                <div className="px-2 pt-1 flex justify-between items-center">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Line Total</span>
                                  <span className="text-xs font-black text-brand-green">₹{(Number(item.amount || 0) * Number(item.quantity || 1)).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Tracking Section */}
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Order Status</p>
                        <select 
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="bg-transparent border-none outline-none font-black text-xl text-white appearance-none cursor-pointer"
                        >
                          <option value="Completed" className="text-slate-900">Completed</option>
                          <option value="Pending" className="text-slate-900">Pending</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Status</p>
                        <select 
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value)}
                          className="bg-transparent border-none outline-none font-black text-xl text-white appearance-none cursor-pointer"
                        >
                          <option value="paid" className="text-slate-900">Confirmed (Full)</option>
                          <option value="pending" className="text-slate-900">Pending (Partial)</option>
                        </select>
                      </div>
                    </div>

                    {paymentStatus === 'pending' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-green">Amount Paid (₹)</label>
                          <input 
                            type="number"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/5 border-transparent rounded-xl focus:bg-white/10 outline-none font-bold text-white px-4 py-3"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-rose-400">Balance to Receive</label>
                          <div className="text-2xl font-black text-rose-400">₹{balanceAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-6 border-t border-white/10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Grand Total</p>
                        <h3 className="text-4xl font-black text-brand-green">₹{grandTotal.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-[1.5] px-8 py-4 rounded-2xl font-black uppercase tracking-tight bg-brand-green text-white hover:shadow-xl hover:shadow-brand-green/20 transition-all disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
