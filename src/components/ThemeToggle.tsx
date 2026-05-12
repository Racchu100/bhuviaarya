'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ scrolled }: { scrolled?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-1 md:gap-2 p-0.5 md:p-1 rounded-full transition-all duration-300 group border-2 ${
        scrolled 
          ? 'bg-white border-black/20 hover:border-black/40' 
          : 'bg-black/20 border-white/30 hover:border-white/50'
      }`}
      aria-label="Toggle Theme"
    >
      <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-500 ${
        theme === 'light' ? 'bg-brand-green text-white scale-110 shadow-lg' : scrolled ? 'text-black/60' : 'text-white/60'
      }`}>
        <Sun className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-500 ${
        theme === 'dark' ? 'bg-brand-yellow text-brand-dark scale-110 shadow-lg' : scrolled ? 'text-black/60' : 'text-white/60'
      }`}>
        <Moon className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      
      {/* Tooltip */}
      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-brand-dark text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 font-bold uppercase tracking-widest">
        {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
      </span>
    </button>
  );
}
