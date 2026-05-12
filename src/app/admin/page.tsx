'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Tags, 
  TrendingUp, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SupabaseSetupAlert from '@/components/SupabaseSetupAlert';

export default function AdminDashboard() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setIsLoading(false);
    }).catch(err => {
      console.warn('Dashboard metrics paused: Data tables not yet initialized.');
      setIsLoading(false);
    });
  }, []);

  const stats = [
    { 
      name: 'Total Products', 
      value: isLoading ? '...' : (Array.isArray(products) ? products.length : 0).toString(), 
      icon: Package, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Active Categories', 
      value: isLoading ? '...' : (Array.isArray(categories) ? categories.length : 0).toString(), 
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
            <Link 
              href="/admin/products"
              className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </Link>
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
