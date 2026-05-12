'use client';

import { motion } from 'framer-motion';
import { Database, AlertCircle, ExternalLink, Key } from 'lucide-react';

export default function SupabaseSetupAlert() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  if (isConfigured) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 text-center max-w-2xl mx-auto my-12"
    >
      <div className="w-20 h-20 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-8">
        <Key className="w-10 h-10" />
      </div>

      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Cloud Setup Required</h2>
      <p className="text-slate-500 text-lg font-medium mb-10">
        Your new advanced admin suite is ready, but it needs to connect to your Supabase project to store your data.
      </p>

      <div className="space-y-4 text-left bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-10">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          How to fix this:
        </h4>
        <ol className="space-y-4 text-sm text-slate-600 font-medium list-decimal list-inside">
          <li>Create a project on <a href="https://supabase.com" target="_blank" className="text-brand-green underline">Supabase.com</a></li>
          <li>Go to <b>Project Settings {`>`} API</b></li>
          <li>Copy your <b>Project URL</b> and <b>anon key</b></li>
          <li>Create a file named <code className="bg-slate-200 px-2 py-0.5 rounded text-slate-900">.env.local</code> in your folder</li>
          <li>Paste the keys as shown in <code className="text-slate-900">.env.local.example</code></li>
        </ol>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="w-full bg-brand-green text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        <Database className="w-5 h-5" />
        Refresh after adding keys
      </button>
    </motion.div>
  );
}
