'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductModal from '@/components/ProductModal';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Clock, Palette, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([prodData, catData]) => {
      setProducts(prodData);
      setCategories(catData);
    }).finally(() => setIsLoading(false));
  }, []);

  const openModal = (product: any) => {
    setSelectedProduct({
      ...product,
      cat: (Array.isArray(categories) ? categories : []).find(c => c.id === product.category)?.name || 'Furniture'
    });
    setIsModalOpen(true);
  };

  const displayProducts = Array.isArray(products) ? products.slice(0, 6) : [];

  return (
    <>
      <Header />
      <main>
        <Hero />


        {/* Latest Products */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h6 className="text-brand-green font-bold uppercase tracking-[0.2em] text-sm">Our Collections</h6>
              <h2 className="text-4xl md:text-5xl font-bold">Featured Masterpieces</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {displayProducts.map((product, i) => (
                <div 
                  key={product.id || i} 
                  onClick={() => openModal(product)}
                  className="group bg-background rounded-2xl md:rounded-3xl overflow-hidden border border-border transition-all hover:shadow-2xl hover:-translate-y-2 active:scale-95 cursor-pointer"
                >
                  <div className="relative h-44 md:h-72 overflow-hidden">
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
                  <div className="p-3 md:p-8 space-y-2 md:space-y-4">
                    <p className="text-brand-green font-bold text-[7px] md:text-xs uppercase tracking-widest">
                      {(Array.isArray(categories) ? categories : []).find(c => c.id === product.category)?.name || 'Furniture'}
                    </p>
                    <h3 className="text-[10px] md:text-xl font-bold line-clamp-2 leading-tight h-6 md:h-auto">{product.name}</h3>
                    <div onClick={(e) => e.stopPropagation()}>
                      <WhatsAppButton productName={product.name} variant="button" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Link
                href="/products"
                className="inline-block bg-brand-dark text-white px-10 py-4 rounded-full font-bold hover:bg-brand-green transition-all hover:scale-105 shadow-xl"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6 text-center mb-16 space-y-4">
            <h6 className="text-brand-green font-bold uppercase tracking-[0.2em] text-sm">Excellence Guaranteed</h6>
            <h2 className="text-4xl md:text-5xl font-bold">Why Bhuvi Aarya?</h2>
          </div>
          <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: ShieldCheck, title: 'Durable Materials', desc: 'High-grade wood & premium fabrics.' },
              { icon: Palette, title: 'Modern Designs', desc: 'Curated to match current interior trends.' },
              { icon: Truck, title: 'Safe Delivery', desc: 'Specialized handling for perfect condition.' },
              { icon: Clock, title: 'On-time Support', desc: 'Dedicated team for all your furniture queries.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-card border border-border text-center space-y-4 md:space-y-6 hover:border-brand-green transition-colors group">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-xl md:rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-500">
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-sm md:text-xl font-bold leading-tight">{feature.title}</h3>
                <p className="text-foreground/60 text-[10px] md:text-base leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/showroom.png"
                    alt="Bhuvi Aarya Showroom"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 bg-brand-yellow p-8 rounded-3xl hidden md:block shadow-xl">
                  <p className="text-brand-dark font-bold text-4xl mb-1">10+</p>
                  <p className="text-brand-dark/70 font-semibold uppercase tracking-wider text-xs">Years of Excellence</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h6 className="text-brand-green font-bold uppercase tracking-[0.2em] text-sm">Welcome to Bhuvi Aarya</h6>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    Crafting Elegance for Your <span className="text-brand-green">Living Space</span>
                  </h2>
                </div>
                <p className="text-foreground/70 text-lg leading-relaxed">
                  At Bhuvi Aarya Entreprises, we believe that furniture is more than just utility; it's a statement of style. Based in the heart of Mangaluru, we bring you a curated collection of premium sofas and dining sets that blend modern aesthetics with timeless craftsmanship.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Quality Materials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                      <Palette className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Modern Designs</span>
                  </div>
                </div>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 font-bold text-brand-green hover:gap-4 transition-all text-sm"
                >
                  Learn More About Our Journey <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-[500px] w-full relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15559.580334385924!2d74.83914756028949!3d12.850052449266446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sGujjarakere%20Road%2C%20Jeppu%20Market%20Rd%2C%20Bolar%2C%20Mangaluru!5e0!3m2!1sen!2sin!4v1777571956712!5m2!1sen!2sin"
            className="w-full h-full grayscale invert opacity-80 contrast-125"
            loading="lazy"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-brand-dark/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-center shadow-2xl pointer-events-none whitespace-nowrap">
            <h3 className="text-white font-bold text-sm md:text-lg uppercase tracking-widest">Visit Our Store</h3>
          </div>
        </section>
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
