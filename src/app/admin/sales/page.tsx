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

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState('Completed');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch Products and Customers first
      const { data: prodData, error: prodErr } = await supabase.from('products').select('id, name, selling_price');
      const { data: custData, error: custErr } = await supabase.from('customers').select('id, name');

      if (prodErr) console.warn('Products fetch error:', prodErr.message);
      if (custErr) console.warn('Customers fetch error:', custErr.message);

      setProducts(prodData || []);
      setCustomers(custData || []);

      // Then try fetching Sales
      const { data: salesData, error: salesErr } = await supabase
        .from('sales')
        .select('*, customers(name), products(name)');

      if (salesErr) {
        console.warn('Sales fetch error:', salesErr.message);
      }
      
      const sortedSales = salesData ? [...salesData].sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      }) : [];

      setSales(sortedSales);
    } catch (err: any) {
      console.error('Fetch Error:', JSON.stringify(err, null, 2));
      toast.error('Failed to load sales data. Please check your database tables.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (sale?: any) => {
    if (sale) {
      setEditingSale(sale);
      setSelectedCustomerId(sale.customer_id || '');
      setSelectedProductId(sale.product_id || '');
      setAmount(String(sale.amount));
      setQuantity(String(sale.quantity || 1));
      setStatus(sale.status || 'Completed');
      setSaleDate(new Date(sale.created_at).toISOString().split('T')[0]);
    } else {
      setEditingSale(null);
      setSelectedCustomerId('');
      setSelectedProductId('');
      setAmount('');
      setQuantity('1');
      setStatus('Completed');
      setSaleDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId || !amount || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const saleData = {
        customer_id: selectedCustomerId,
        product_id: selectedProductId,
        amount: Number(amount),
        quantity: Number(quantity),
        unit_price: Number(amount) / Number(quantity),
        total_amount: Number(amount),
        status,
        created_at: new Date(saleDate).toISOString()
      };

      let error;
      if (editingSale) {
        // If product or quantity changed, we need to adjust
        const oldQty = Number(editingSale.quantity || 1);
        const newQty = Number(quantity);
        
        if (editingSale.product_id !== selectedProductId || oldQty !== newQty) {
          // 1. Handle old product (Return stock)
          const { data: oldProd } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', editingSale.product_id).single();
          if (oldProd) {
            await supabase.from('products').update({
              total_stock: (oldProd.total_stock || 0) + oldQty,
              sold_quantity: Math.max(0, (oldProd.sold_quantity || 0) - oldQty)
            }).eq('id', editingSale.product_id);
          }

          // 2. Handle new product (Deduct stock)
          const { data: newProd } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', selectedProductId).single();
          if (newProd) {
            await supabase.from('products').update({
              total_stock: (newProd.total_stock || 0) - newQty,
              sold_quantity: (newProd.sold_quantity || 0) + newQty
            }).eq('id', selectedProductId);
          }
        }

        const { error: updateError } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', editingSale.id);
        error = updateError;
      } else {
        // New Sale: Deduct stock from product
        const { data: prod } = await supabase.from('products').select('total_stock, sold_quantity').eq('id', selectedProductId).single();
        if (prod) {
          await supabase.from('products').update({
            total_stock: (prod.total_stock || 0) - Number(quantity),
            sold_quantity: (prod.sold_quantity || 0) + Number(quantity)
          }).eq('id', selectedProductId);
        }

        const { error: insertError } = await supabase
          .from('sales')
          .insert([saleData]);
        error = insertError;
      }

      if (error) throw error;
      toast.success(editingSale ? 'Sale Updated & Stock Adjusted' : 'Sale Recorded & Stock Deducted');
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      console.error('Full Save Error:', err);
      toast.error(err.message || 'Failed to record sale');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;
    
    if (!confirm('Are you sure you want to delete this sale? Stock will be returned to inventory.')) return;
    try {
      // 1. Fetch current product data to return stock accurately
      const { data: prod, error: fetchError } = await supabase
        .from('products')
        .select('total_stock, sold_quantity')
        .eq('id', saleToDelete.product_id)
        .single();
      
      if (fetchError) {
        console.error('Fetch Error for Stock Return:', fetchError);
        throw new Error('Could not find product to return stock.');
      }

      const returnQty = Number(saleToDelete.quantity || 1);
      
      // 2. Return stock to product
      const { error: updateError } = await supabase.from('products').update({
        total_stock: (prod.total_stock || 0) + returnQty,
        sold_quantity: Math.max(0, (prod.sold_quantity || 0) - returnQty)
      }).eq('id', saleToDelete.product_id);

      if (updateError) {
        console.error('Update Error for Stock Return:', updateError);
        throw new Error('Failed to update warehouse stock.');
      }
      
      // 3. Delete the sale record
      const { error: deleteError } = await supabase.from('sales').delete().eq('id', id);
      if (deleteError) throw deleteError;

      toast.success('Sale deleted & Stock returned to Warehouse');
      fetchInitialData();
    } catch (err: any) {
      console.error('Delete/Return Error:', err);
      toast.error(err.message || 'Failed to delete record');
    }
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.amount || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Records</h1>
          <p className="text-slate-500 font-medium">Track your revenue and order history.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Record New Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Total Orders</p>
          <h3 className="text-3xl font-black text-slate-900">{sales.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Pending Orders</p>
          <h3 className="text-3xl font-black text-slate-900">
            {sales.filter(s => s.status === 'Pending').length}
          </h3>
        </div>
      </div>

      {/* Table */}
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
              ) : sales.length > 0 ? (
                sales.map((sale) => (
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
                      <span className="text-base font-black text-slate-900">₹{sale.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        sale.status === 'Completed' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {sale.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {sale.status}
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

      {/* Modal */}
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveSale} className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">
                      {editingSale ? 'Edit Sale' : 'Record Sale'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                      {editingSale ? 'Update this transaction record.' : 'Log a new manual masterpiece sale.'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Masterpiece</label>
                    <select 
                      required
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const p = products.find(prod => String(prod.id) === e.target.value);
                        if (p) setAmount(p.selling_price || '');
                      }}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 appearance-none"
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sale Amount (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantity</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green outline-none font-bold text-slate-900 appearance-none"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
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
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-[1.5] px-8 py-4 rounded-2xl font-bold bg-brand-green text-white hover:shadow-xl hover:shadow-brand-green/20 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingSale ? 'Update Sale' : 'Record Sale'}
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
