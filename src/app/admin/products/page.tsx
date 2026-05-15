'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Check,
  X,
  Barcode,
  Package,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SupabaseSetupAlert from '@/components/SupabaseSetupAlert';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminProducts() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Advanced Inventory State
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [totalStock, setTotalStock] = useState(0);
  const [soldQuantity, setSoldQuantity] = useState(0);
  const [damagedStock, setDamagedStock] = useState(0);
  const [lowStockLevel, setLowStockLevel] = useState(5);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [warehouseNotes, setWarehouseNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Auto-calculate profit
  const profitMargin = sellingPrice > 0 ? ((sellingPrice - purchasePrice) / sellingPrice) * 100 : 0;
  const remainingStock = totalStock - soldQuantity - damagedStock;

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).finally(() => setIsLoading(false));
  }, []);


  const fetchCategories = async () => {
    if (!isConfigured) return;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) { 
      console.warn('Categories fetch paused:', err.message);
      // Only show toast if it's not a missing table error
      if (err.code !== 'PGRST116' && !err.message?.includes('relation')) {
        toast.error('Failed to load categories');
      }
    }
  };

  const fetchProducts = async () => {
    if (!isConfigured) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) { 
      console.warn('Products fetch paused:', err.message);
      if (err.code !== 'PGRST116' && !err.message?.includes('relation')) {
        toast.error('Failed to load products');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateSku = () => {
    if (!name) {
      toast.error('Please enter a product name first');
      return;
    }
    const prefix = 'BA';
    const random = Math.floor(1000 + Math.random() * 9000);
    const shortName = name.trim().slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    setSku(`${prefix}-${shortName}-${random}`);
    toast.success('SKU Generated');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      toast.error('Please fill in Name and Category');
      return;
    }

    if (!sku.trim()) {
      toast.error('SKU is required for inventory tracking');
      return;
    }

    setIsSaving(true);
    let finalImageUrl = editingProduct ? editingProduct.img : '/images/sofa_hero.png';

    try {
      // 1. Proactive SKU check (if it's a new product or the SKU changed)
      if (!editingProduct || editingProduct.sku !== sku.trim()) {
        const { data: existingSku } = await supabase
          .from('products')
          .select('id')
          .eq('sku', sku.trim())
          .single();
        
        if (existingSku) {
          toast.error('This SKU already exists! Please use a unique identifier.');
          setIsSaving(false);
          return;
        }
      }

      // 2. Upload image if a new one is selected
      // 2. Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Supabase Upload Error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}. Make sure you have created an 'images' bucket in Supabase Storage with public access.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      const productData: any = {
        name: name.trim(),
        category: category || null,
        desc: description,
        img: finalImageUrl,
        price: editingProduct ? editingProduct.price : 'Premium',
        sku: sku.trim(),
        barcode,
        total_stock: Number(totalStock) || 0,
        sold_quantity: Number(soldQuantity) || 0,
        damaged_stock: Number(damagedStock) || 0,
        low_stock_level: Number(lowStockLevel) || 5,
        purchase_price: Number(purchasePrice) || 0,
        selling_price: Number(sellingPrice) || 0,
        supplier,
        warehouse_notes: warehouseNotes,
        internal_notes: internalNotes
      };

      let error;
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (!error) {
        toast.success(editingProduct ? 'Masterpiece Updated' : 'Masterpiece Created');
        setIsAdding(false);
        setEditingProduct(null);
        resetForm();
        await fetchProducts();
      } else {
        if (error.code === '23505') {
          toast.error('This SKU already exists! Please use a unique identifier.');
        } else {
          toast.error(error.message || 'Failed to save product');
        }
        console.error('Supabase error details:', error);
      }
    } catch (err: any) { 
      console.error('Full Save Error:', err); 
      toast.error(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      // 1. Proactive check for related sales (Foreign Key constraint prevention)
      const { data: sales, error: salesCheckError } = await supabase
        .from('sales')
        .select('id')
        .eq('product_id', productToDelete.id)
        .limit(1);

      if (salesCheckError) {
        console.error('Sales check error:', salesCheckError);
      }

      if (sales && sales.length > 0) {
        toast.error('Cannot delete: This masterpiece is linked to existing sales records. Archive it instead by setting stock to zero.');
        setProductToDelete(null);
        return;
      }

      // 2. Proceed with deletion
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (!error) {
        toast.success('Product Removed');
        setProductToDelete(null);
        fetchProducts();
      } else {
        throw error;
      }
    } catch (err: any) { 
      console.error('Delete Error:', err);
      if (err.code === '23503') {
        toast.error('Cannot delete: This masterpiece is being used in sales or inventory records.');
      } else {
        toast.error(err.message || 'Error deleting product');
      }
      setProductToDelete(null);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.desc || '');
    setSku(product.sku || '');
    setBarcode(product.barcode || '');
    setTotalStock(product.total_stock || 0);
    setSoldQuantity(product.sold_quantity || 0);
    setDamagedStock(product.damaged_stock || 0);
    setLowStockLevel(product.low_stock_level || 5);
    setPurchasePrice(product.purchase_price || 0);
    setSellingPrice(product.selling_price || 0);
    setSupplier(product.supplier || '');
    setWarehouseNotes(product.warehouse_notes || '');
    setInternalNotes(product.internal_notes || '');
    
    setIsAdding(true);
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    // New fields
    setSku('');
    setBarcode('');
    setTotalStock(0);
    setSoldQuantity(0);
    setDamagedStock(0);
    setLowStockLevel(5);
    setPurchasePrice(0);
    setSellingPrice(0);
    setSupplier('');
    setWarehouseNotes('');
    setInternalNotes('');
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const categoryName = (Array.isArray(categories) ? categories : []).find(c => c.id === p.category)?.name?.toLowerCase() || '';
    return (
      p.name.toLowerCase().includes(searchLower) ||
      categoryName.includes(searchLower) ||
      (p.sku && p.sku.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-8 pb-20">
      <SupabaseSetupAlert />
      
      {isConfigured && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products</h1>
              <p className="text-slate-500 font-medium">Manage your collection and inventory levels.</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search masterpieces..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">Loading masterpieces...</td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                          <Image src={p.img} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{p.name}</h4>
                          <p className="text-slate-400 text-xs mt-1 font-medium">
                            SKU: {p.sku || `BA-${String(p.id).slice(-4)}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        {categories.find(c => c.id === p.category)?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditProduct(p)}
                          className="p-3 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(p)}
                          className="p-3 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full rounded-[2.5rem] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingProduct ? 'Edit Masterpiece' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => { setIsAdding(false); setEditingProduct(null); resetForm(); }}
                  className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form 
                id="product-form"
                onSubmit={handleSaveProduct} 
                className="flex-1 overflow-y-auto p-8 space-y-8"
              >
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Image</label>
                  <div 
                    onClick={() => document.getElementById('image-upload')?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative border-2 border-dashed rounded-[2rem] overflow-hidden min-h-[200px] text-center flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer group",
                      isDragging 
                        ? "border-brand-green bg-brand-green/[0.05] scale-[1.02]" 
                        : "border-slate-200 hover:border-brand-green hover:bg-brand-green/[0.02]"
                    )}
                  >
                    {imagePreview ? (
                      <div className="absolute inset-0 w-full h-full">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold text-sm">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green group-hover:text-white transition-all">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Click to upload image</p>
                          <p className="text-sm text-slate-400 font-medium">PNG, JPG or WebP (max. 5MB)</p>
                        </div>
                      </>
                    )}
                    <input 
                      id="image-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Royal Oak Dining Table"
                      className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                    <textarea 
                      placeholder="Describe this masterpiece..."
                      className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-medium text-slate-900 min-h-[120px] resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Inventory Section */}
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-brand-green" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Inventory & Logistics</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                          SKU
                          <button 
                            type="button"
                            onClick={generateSku}
                            className="text-brand-green hover:underline lowercase font-bold tracking-normal"
                          >
                            Auto-Generate
                          </button>
                        </label>
                        <input 
                          type="text" 
                          placeholder="SOFA-001"
                          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Barcode</label>
                        <div className="relative">
                          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Stock</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                          value={totalStock}
                          onChange={(e) => setTotalStock(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Damaged</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                          value={damagedStock}
                          onChange={(e) => setDamagedStock(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Stock Alert</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                          value={lowStockLevel}
                          onChange={(e) => setLowStockLevel(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Warehouse / Storage Notes</label>
                      <input 
                        type="text" 
                        placeholder="Aisle 4, Shelf B"
                        className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-medium text-slate-900"
                        value={warehouseNotes}
                        onChange={(e) => setWarehouseNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-brand-green" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Pricing & Profit</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Purchase Price (₹)</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selling Price (₹)</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Profit Margin Indicator */}
                    <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimated Profit Margin</p>
                        <p className={cn(
                          "text-xl font-black",
                          profitMargin > 20 ? "text-green-600" : profitMargin > 0 ? "text-brand-yellow" : "text-rose-600"
                        )}>
                          {profitMargin.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Profit Per Unit</p>
                        <p className="text-xl font-black text-slate-900">₹{(sellingPrice - purchasePrice).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      Internal Admin Notes
                    </label>
                    <textarea 
                      placeholder="Only visible to admin..."
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-medium text-slate-900 min-h-[80px] resize-none text-sm"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={() => { setIsAdding(false); setEditingProduct(null); resetForm(); }}
                  className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="product-form"
                  disabled={isSaving}
                  className={cn(
                    "flex-1 px-8 py-4 rounded-2xl bg-brand-green text-white font-bold transition-all active:scale-95",
                    isSaving ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl hover:shadow-brand-green/20"
                  )}
                >
                  {isSaving ? 'Saving Masterpiece...' : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete Masterpiece?</h3>
                <p className="text-slate-500 font-medium mt-2">
                  Are you sure you want to remove <span className="font-bold text-slate-900">"{productToDelete.name}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteProduct}
                  className="flex-1 px-8 py-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/20 transition-all active:scale-95"
                >
                  Confirm Delete
                </button>
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
