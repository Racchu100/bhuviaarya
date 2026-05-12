'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  LogOut, 
  ChevronRight,
  ExternalLink,
  Loader2,
  ClipboardList,
  Users,
  IndianRupee,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: ClipboardList },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Sales', href: '/admin/sales', icon: IndianRupee },
  { name: 'Billing', href: '/admin/billing', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (!auth && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  if (isAuthenticated === null && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-screen">
        <div className="p-8">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white shadow-lg shadow-brand-green/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Admin Console</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bhuvi Aarya</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                  isActive 
                    ? "bg-brand-green text-white shadow-xl shadow-brand-green/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-sm"
          >
            <ExternalLink className="w-5 h-5" />
            View Website
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
