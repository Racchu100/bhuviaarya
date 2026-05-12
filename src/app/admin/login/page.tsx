'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store simple auth state
        localStorage.setItem('admin_auth', 'true');
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 border border-slate-100"
        >
          <div className="text-center mb-10 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-brand-green/10 flex items-center justify-center text-brand-green mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
            <p className="text-slate-500 font-medium">Please enter your secure password to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  placeholder="Enter Password"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-rose-500 text-xs font-bold px-2 uppercase tracking-wider"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-green text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-brand-green/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Console
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Bhuvi Aarya Enterprises
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
