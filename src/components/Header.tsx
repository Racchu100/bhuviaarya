'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About Us', href: '/about' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-lg bg-[#2563EB]',
        isScrolled 
          ? 'py-1 md:py-2' 
          : 'py-2 md:py-2.5'
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center group whitespace-nowrap">
          <div className="flex flex-col leading-none">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
              BHU<span className="text-brand-green">VI</span> AAR<span className="text-brand-green">YA</span>
            </h1>
            <span className="text-brand-yellow text-sm md:text-lg font-serif tracking-widest leading-tight">
              Enterprises
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-bold transition-all relative group py-2",
                  isActive ? "text-brand-yellow" : "text-white/80 hover:text-white"
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-yellow rounded-full"
                  />
                )}
              </Link>
            );
          })}
          <ThemeToggle scrolled={true} />
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 bg-[#2563EB] z-[60] transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-10',
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-4 text-white"
        >
          <X className="w-10 h-10" />
        </button>
        
        <div className="flex flex-col items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-2xl font-bold transition-colors tracking-tight",
                  isActive ? "text-brand-yellow" : "text-white/80 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
