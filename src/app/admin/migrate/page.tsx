'use client';

import { useState } from 'react';
import { 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  CloudUpload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MigrationPage() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startMigration = async () => {
    setIsMigrating(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/migrate', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success('Migration Completed!');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Migration failed');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 text-center"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-brand-green/10 flex items-center justify-center text-brand-green mx-auto mb-8">
          <CloudUpload className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Data Migration</h1>
        <p className="text-slate-500 text-lg font-medium mb-12 max-w-md mx-auto">
          Move your existing collection from the local database to the new premium Supabase cloud system.
        </p>

        {!result ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-8 py-8 border-y border-slate-50 mb-12">
              <div className="text-center">
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">From</div>
                <div className="bg-slate-50 px-6 py-3 rounded-2xl font-black text-slate-900 border border-slate-100 flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-400" />
                  Local DB
                </div>
              </div>
              <ArrowRight className="w-8 h-8 text-slate-200 mt-6" />
              <div className="text-center">
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">To</div>
                <div className="bg-brand-green px-6 py-3 rounded-2xl font-black text-white shadow-xl shadow-brand-green/20 flex items-center gap-3">
                  <Database className="w-5 h-5" />
                  Supabase
                </div>
              </div>
            </div>

            <button
              onClick={startMigration}
              disabled={isMigrating}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Migrating Masterpieces...
                </>
              ) : (
                'Start One-Click Migration'
              )}
            </button>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Warning: This will merge your local data into the cloud.
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-100">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-green-900 mb-2">Migration Successful!</h2>
              <p className="text-green-700 font-medium">Your data is now live on the Supabase cloud.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Categories</div>
                <div className="text-3xl font-black text-slate-900">{result.categoriesCount}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Products</div>
                <div className="text-3xl font-black text-slate-900">{result.productsCount}</div>
              </div>
            </div>

            <a 
              href="/admin/products"
              className="block w-full bg-brand-green text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              View New Inventory
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
