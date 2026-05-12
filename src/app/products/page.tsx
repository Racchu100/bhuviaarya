'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductModal from '@/components/ProductModal';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([
    { id: 'all', name: 'All Collection' }
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;
  const menuRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).finally(() => setIsLoading(false));
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories([
        { id: 'all', name: 'All Collection' },
        ...data
      ]);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const openModal = (product: any) => {
    setSelectedProduct({
      ...product,
      cat: (Array.isArray(categories) ? categories : []).find(c => c.id === product.category)?.name || 'Furniture'
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products
    .filter(p => (activeTab === 'all' || p.category === activeTab))
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => {
      if (!filterLabel) return true;
      return filterLabel === 'isNewArrival' ? p.isNewArrival : p.isBestSeller;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen">
        {/* Header Section */}
        <section className="bg-card py-2 md:py-4 mb-4 text-center">
          <div className="container mx-auto px-6 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Our Furniture <span className="text-brand-green">Collection</span></h1>
            <p className="text-foreground/60 text-base max-w-2xl mx-auto leading-relaxed">
              Discover a wide range of premium sofas and dining tables designed to elevate your living experience.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6" ref={collectionRef}>
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-5">
            <button
              onClick={() => {
                setFilterLabel(filterLabel === 'isNewArrival' ? null : 'isNewArrival');
                setCurrentPage(1);
              }}
              className={cn(
                "px-5 md:px-7 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-md border-2",
                filterLabel === 'isNewArrival'
                  ? "bg-brand-green text-white border-brand-green scale-105 opacity-100 ring-4 ring-brand-green/30"
                  : "bg-brand-green/80 text-white border-brand-green/10 hover:bg-brand-green/100"
              )}
            >
              New Arrivals
            </button>
            <button
              onClick={() => {
                setFilterLabel(filterLabel === 'isBestSeller' ? null : 'isBestSeller');
                setCurrentPage(1);
              }}
              className={cn(
                "px-5 md:px-7 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-md border-2",
                filterLabel === 'isBestSeller'
                  ? "bg-brand-yellow text-black border-brand-yellow scale-105 opacity-100 ring-4 ring-brand-yellow/30 font-black"
                  : "bg-brand-yellow/80 text-black border-brand-yellow/10 hover:bg-brand-yellow/100"
              )}
            >
              Best Sellers
            </button>
          </div>

          {/* Controls: Search & Categories */}
          <div className="flex flex-row items-center justify-center gap-2 md:gap-4 mb-12">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-brand-green transition-colors" />
                <input
                  type="text"
                  placeholder="Search masterpieces..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 md:py-3 pl-9 md:pl-12 pr-4 md:pr-6 text-sm font-bold tracking-tight text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 transition-all shadow-sm"
                />
              </div>

            {/* Category Toggle */}
            <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-1.5 md:gap-2 bg-brand-green text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-brand-green/90 transition-all shadow-lg active:scale-95"
                >
                  <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden md:inline">{(Array.isArray(categories) ? categories : []).find(c => c.id === activeTab)?.name}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 md:w-4 md:h-4 transition-transform", isMenuOpen && "rotate-180")} />
                </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-4 w-64 bg-white border border-border rounded-3xl shadow-2xl z-[70] p-2 overflow-hidden shadow-brand-dark/10"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveTab(cat.id);
                          setCurrentPage(1);
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-6 py-2.5 rounded-2xl font-bold transition-all flex items-center justify-between group text-sm",
                          activeTab === cat.id 
                            ? "bg-brand-green text-white shadow-lg" 
                            : "hover:bg-brand-green/10 text-brand-dark"
                        )}
                      >
                        {cat.name}
                        {activeTab === cat.id && <div className="w-2 h-2 rounded-full bg-white shadow-glow" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Grid */}
          <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {currentProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => openModal(product)}
                  className="group bg-card rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-border flex flex-col transition-all hover:shadow-2xl hover:-translate-y-2 active:scale-95 cursor-pointer"
                >
                  <div className="relative h-44 md:h-80 overflow-hidden">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {(product.isNewArrival || product.isBestSeller) && (
                      <div className={cn(
                        "absolute top-2 right-2 md:top-6 md:right-6 px-2 py-0.5 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-xs font-bold uppercase tracking-widest shadow-lg transition-all",
                        product.isNewArrival 
                          ? "bg-brand-green text-white" 
                          : "bg-brand-yellow text-brand-dark"
                      )}>
                        {product.isNewArrival ? 'New Arrival' : 'Best Seller'}
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-10 space-y-3 md:space-y-6 flex-1 flex flex-col">
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-brand-green font-bold text-[7px] md:text-xs uppercase tracking-[0.2em]">
                        {(Array.isArray(categories) ? categories : []).find(c => c.id === product.category)?.name}
                      </p>
                      <h3 className="text-[10px] md:text-2xl font-bold line-clamp-2 leading-tight h-6 md:h-auto">{product.name}</h3>
                    </div>
                    <p className="text-foreground/60 text-[10px] md:text-sm leading-relaxed flex-1 hidden md:block">
                      Exquisite craftsmanship meets modern design in this premium {product.category} piece. Perfect for any contemporary home.
                    </p>
                    <div onClick={(e) => e.stopPropagation()}>
                      <WhatsAppButton productName={product.name} variant="button" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-card border border-border text-foreground hover:border-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full font-bold transition-all border text-sm md:text-base",
                  currentPage === i + 1
                    ? "bg-brand-green border-brand-green text-white shadow-lg scale-110"
                    : "bg-card border-border text-foreground hover:border-brand-green/50"
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-card border border-border text-foreground hover:border-brand-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </>
  );
}
