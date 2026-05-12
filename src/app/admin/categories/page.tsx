'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Tags, 
  Pencil, 
  Trash2, 
  ChevronRight,
  FolderTree,
  X,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import SupabaseSetupAlert from '@/components/SupabaseSetupAlert';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminCategories() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  const [categories, setCategories] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCatName, setNewCatName] = useState('');
  const [parentCatId, setParentCatId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isConfigured) {
      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newOrder: any[]) => {
    const subCategories = categories.filter(c => c.parentId);
    const updatedCategories = [...newOrder, ...subCategories];
    setCategories(updatedCategories);

    try {
      await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories })
      });
    } catch (err) {
      console.error('Failed to save order');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newCatName || isSaving) return;

    // Check for duplicate names (case-insensitive)
    const exists = (Array.isArray(categories) ? categories : []).some(c => 
      c.name.toLowerCase().trim() === newCatName.toLowerCase().trim() && 
      (!editingCategory || c.id !== editingCategory.id)
    );

    if (exists) {
      setError('Category already exists!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        // Update existing
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCatName, parentId: parentCatId || null })
        });
        
        if (res.ok) {
          toast.success('Category updated');
          setEditingCategory(null);
          setNewCatName('');
          setParentCatId('');
          setIsAdding(false);
          fetchCategories();
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to update');
        }
      } else {
        // Add new
        const newCat = {
          id: newCatName.toLowerCase().replace(/\s+/g, '-'),
          name: newCatName,
          parentId: parentCatId || null
        };

        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCat)
        });

        if (res.ok) {
          toast.success('Category created');
          setNewCatName('');
          setParentCatId('');
          setIsAdding(false);
          fetchCategories();
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create. Check your database connection.');
        }
      }
    } catch (err: any) { 
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
    } catch (err) { console.error(err); }
  };

  const startEdit = (cat: any) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setParentCatId(cat.parentId || '');
    setIsAdding(true);
  };

  const mainCategories = categories.filter(c => !c.parentId);

  return (
    <div className="space-y-8 pb-20">
      <SupabaseSetupAlert />

      {isConfigured && (
        <>
          {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 font-medium">Organize your collection with categories and sub-categories.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setNewCatName('');
            setParentCatId('');
            setError('');
            setIsAdding(true);
          }}
          className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <FolderTree className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Current Structure</h2>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl" />)}
              </div>
            ) : mainCategories.length > 0 ? (
              <Reorder.Group axis="y" values={mainCategories} onReorder={handleReorder} className="space-y-4">
                {mainCategories.map((cat) => (
                  <Reorder.Item 
                    key={cat.id} 
                    value={cat}
                    className="space-y-3 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-green/30 transition-all">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-300" />
                        <Tags className="w-5 h-5 text-slate-400 group-hover:text-brand-green transition-colors" />
                        <span className="font-bold text-slate-900">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                          className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-900 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                          className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Sub-categories */}
                    <div className="pl-12 space-y-2">
                      {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 group hover:border-brand-green/20 transition-all">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <span className="text-sm font-semibold text-slate-600">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEdit(sub)}
                              className="p-1.5 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-900"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(sub.id)}
                              className="p-1.5 rounded-md hover:bg-slate-50 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <p className="text-center text-slate-400 py-10 font-medium">No categories found. Start by adding one!</p>
            )}
          </div>
        </div>

        <div className="bg-brand-dark p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Quick Tip</h3>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Sub-categories allow you to group specific furniture types under a main heading. For example, "Office" could have "Chairs" and "Desks" as sub-categories.
            </p>
            <div className="flex items-center gap-4 text-brand-yellow font-bold text-sm uppercase tracking-widest">
              <span className="w-8 h-px bg-brand-yellow/30" />
              Better Organization
            </div>
          </div>
          <Tags className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 -rotate-12" />
        </div>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Office Furniture"
                    className={cn(
                      "w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900",
                      error && "border-rose-500 ring-4 ring-rose-500/5 bg-white"
                    )}
                    value={newCatName}
                    onChange={(e) => { setNewCatName(e.target.value); setError(''); }}
                    autoFocus
                  />
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-rose-500 text-[10px] font-black uppercase tracking-widest px-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parent Category (Optional)</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                    value={parentCatId}
                    onChange={(e) => setParentCatId(e.target.value)}
                  >
                    <option value="">None (Top Level)</option>
                    {mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-8 py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-8 py-4 rounded-2xl bg-brand-green text-white font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
