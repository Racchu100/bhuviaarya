'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { supabase } from '@/lib/supabase';

const fallbackSlides = [
  {
    image: '/images/hero_1.png',
    title: 'Luxury Living, Redefined',
    subtitle: 'Premium sofas and elegant curtains designed for modern homes.',
    cta: 'Explore Sofas',
    href: '/products?category=sofas',
  },
  {
    image: '/images/hero_2.png',
    title: 'Majestic Dining Spaces',
    subtitle: 'Exquisite solid wood tables and bespoke upholstered chairs.',
    cta: 'View Collections',
    href: '/products?category=dining',
  },
  {
    image: '/images/hero_3.png',
    title: 'Custom Crafted for You',
    subtitle: 'Bespoke furniture solutions to transform your living space.',
    cta: 'Discover More',
    href: '/products?category=glass',
  },
];

export default function Hero() {
  const [slides, setSlides] = useState<any[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setSlides(data.map(s => ({
          image: s.image,
          title: s.title,
          subtitle: s.subtitle,
          cta: s.cta_text,
          href: s.cta_link
        })));
      }
    } catch (err) {
      console.warn('Hero slides fetch error, using fallbacks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].image})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <motion.div
          key={`content-${current}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-white text-4xl md:text-7xl font-bold mb-4 tracking-tight leading-tight">
            {slides[current].title}
          </h1>
          <p className="text-white/80 text-sm md:text-2xl mb-6 font-light">
            {slides[current].subtitle}
          </p>
          <div className="flex flex-row gap-2 md:gap-4 justify-center">
            <Link
              href={slides[current].href}
              className="bg-brand-green hover:bg-brand-green/90 text-white px-4 py-3 md:px-8 md:py-4 rounded-full font-semibold transition-all transform hover:scale-105 text-sm md:text-base flex-1 md:flex-none whitespace-nowrap"
            >
              {slides[current].cta}
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-4 py-3 md:px-8 md:py-4 rounded-full font-semibold transition-all text-sm md:text-base flex-1 md:flex-none whitespace-nowrap"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Slider Controls */}
      {slides.length > 1 && (
        <>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-12 h-1 rounded-full transition-all ${
                  i === current ? 'bg-brand-yellow' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full glass hover:bg-brand-green/20 text-white hidden md:block"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full glass hover:bg-brand-green/20 text-white hidden md:block"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
    </section>
  );
}
