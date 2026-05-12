'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  History,
  ArrowRight,
  ChevronRight,
  Box
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SupabaseSetupAlert from '@/components/SupabaseSetupAlert';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function InventoryManagement() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for stock update
  const [totalStock, setTotalStock] = useState(0);
  const [soldQuantity, setSoldQuantity] = useState(0);
  const [damagedStock, setDamagedStock] = useState(0);
  const [lowStockLevel, setLowStockLevel] = useState(5);
  const [warehouseNotes, setWarehouseNotes] = useState('');

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!isConfigured) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.warn('Inventory fetch paused:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (p: any) => {
    setSelectedProduct(p);
    setTotalStock(p.total_stock || 0);
    setSoldQuantity(p.sold_quantity || 0);
    setDamagedStock(p.damaged_stock || 0);
    setLowStockLevel(p.low_stock_level || 5);
    setWarehouseNotes(p.warehouse_notes || '');
    setIsModalOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || isSaving) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          total_stock: totalStock,
          sold_quantity: soldQuantity,
          damaged_stock: damagedStock,
          low_stock_level: lowStockLevel,
          warehouse_notes: warehouseNotes
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;
      
      const { toast } = await import('sonner');
      toast.success('Inventory Updated Successfully');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Update Error:', err);
      const { toast } = await import('sonner');
      toast.error('Failed to update inventory');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // We now deduct sales directly from total_stock, so we only subtract damages for the remaining count
    const remaining = (p.total_stock || 0) - (p.damaged_stock || 0);
    
    if (filter === 'low') return matchesSearch && remaining > 0 && remaining <= (p.low_stock_level || 5);
    if (filter === 'out') return matchesSearch && remaining <= 0;
    return matchesSearch;
  });

  const stats = [
    { 
      name: 'Total Products', 
      value: (Array.isArray(products) ? products : []).length, 
      icon: Package, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Low Stock', 
      value: (Array.isArray(products) ? products : []).filter(p => {
        const remaining = (p.total_stock || 0) - (p.damaged_stock || 0);
        return remaining > 0 && remaining <= (p.low_stock_level || 5);
      }).length, 
      icon: AlertTriangle, 
      color: 'bg-amber-500' 
    },
    { 
      name: 'Out of Stock', 
      value: (Array.isArray(products) ? products : []).filter(p => {
        const remaining = (p.total_stock || 0) - (p.damaged_stock || 0);
        return remaining <= 0;
      }).length, 
      icon: Box, 
      color: 'bg-rose-500' 
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <SupabaseSetupAlert />
      
      {isConfigured && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory</h1>
              <p className="text-slate-500 font-medium">Monitor stock levels and warehouse logistics.</p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                <History className="w-5 h-5" />
                Stock Logs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={stat.name}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all group"
              >
                <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.name}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by SKU or Name..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
          {[
            { id: 'all', name: 'All' },
            { id: 'low', name: 'Low Stock' },
            { id: 'out', name: 'Out' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all",
                filter === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Remaining</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Selling Price</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Warehouse Note</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">Checking warehouse...</td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const remaining = (p.total_stock || 0) - (p.damaged_stock || 0);
                  const isLow = remaining > 0 && remaining <= (p.low_stock_level || 5);
                  const isOut = remaining <= 0;

                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => handleOpenModal(p)}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                            <Image src={p.img} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 leading-tight">{p.name}</h4>
                            <p className="text-slate-400 text-xs mt-1 font-medium">{p.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "text-xl font-black",
                          isOut ? "text-rose-500" : isLow ? "text-amber-500" : "text-slate-900"
                        )}>
                          {remaining}
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Available</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-slate-900">
                          ₹{(p.selling_price || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-slate-500">{p.warehouse_notes || '—'}</p>
                      </td>
                      <td className="px-8 py-6">
                        {isOut ? (
                          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-wider">Out of Stock</span>
                        ) : isLow ? (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-500 text-[10px] font-black uppercase tracking-wider">Low Stock</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider">In Stock</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-green-500 group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">No inventory found.</td></tr>
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Manage Stock</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{selectedProduct?.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Stock</label>
                    <input 
                      type="number" 
                      value={totalStock}
                      onChange={(e) => setTotalStock(Number(e.target.value))}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sold Quantity</label>
                    <input 
                      type="number" 
                      value={soldQuantity}
                      onChange={(e) => setSoldQuantity(Number(e.target.value))}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Damaged Stock</label>
                    <input 
                      type="number" 
                      value={damagedStock}
                      onChange={(e) => setDamagedStock(Number(e.target.value))}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Low Stock Alert</label>
                    <input 
                      type="number" 
                      value={lowStockLevel}
                      onChange={(e) => setLowStockLevel(Number(e.target.value))}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Warehouse Notes</label>
                  <textarea 
                    value={warehouseNotes}
                    onChange={(e) => setWarehouseNotes(e.target.value)}
                    rows={3}
                    placeholder="E.g., Shelf B-12, Handle with care..."
                    className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none font-bold text-slate-900 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateStock}
                    disabled={isSaving}
                    className="flex-[1.5] px-8 py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Updating...' : 'Update Inventory'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
