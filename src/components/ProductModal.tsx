'use client';

import { useState } from 'react';
import { X, Instagram } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppButton from './WhatsAppButton';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    cat: string;
    img: string;
    price: string;
    desc?: string;
  } | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, px: 0, py: 0 });
  if (!product) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isLightboxOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white text-brand-dark rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[100] w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-brand-dark hover:bg-white transition-all border border-black/10 shadow-lg active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Scrollable Content Wrapper */}
              <div className="overflow-y-auto flex flex-col md:flex-row h-full">
                {/* Image Section with Magnifying Lens */}
                <div 
                  className="relative w-full md:w-1/2 h-[250px] md:h-auto min-h-[350px] bg-slate-50 overflow-hidden cursor-zoom-in md:cursor-none group/zoom"
                  onClick={() => setIsLightboxOpen(true)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onMouseMove={(e) => {
                    if (window.innerWidth < 768) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMousePos({ x, y, px: e.clientX - rect.left, py: e.clientY - rect.top });
                  }}
                >
                  <div className="w-full h-full relative">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Magnifying Lens (Zoom Square) - Hidden on Mobile */}
                  <AnimatePresence>
                    {isHovering && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="hidden md:block absolute w-40 h-40 border-2 border-white/50 shadow-2xl rounded-2xl overflow-hidden pointer-events-none z-20 bg-slate-100"
                        style={{
                          left: mousePos.px - 80,
                          top: mousePos.py - 80,
                        }}
                      >
                        <div 
                          className="absolute w-[400%] h-[400%]"
                          style={{
                            left: `-${mousePos.x * 3}%`,
                            top: `-${mousePos.y * 3}%`,
                          }}
                        >
                          <Image
                            src={product.img}
                            alt="Zoomed"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 bg-brand-yellow text-brand-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                    {product.price}
                  </div>

                  {/* Zoom Hint - Adapted for Mobile/Desktop */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full opacity-0 group-hover/zoom:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                    <span className="md:hidden">Tap to view full screen</span>
                    <span className="hidden md:inline">Click to view full screen</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 pt-4 pb-2 px-6 md:pt-6 md:pb-4 md:px-8 flex flex-col justify-start space-y-3 bg-white">
                  <div className="space-y-1">
                    <p className="text-brand-green font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">{product.cat}</p>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight text-brand-dark">{product.name}</h2>
                  </div>
  
                  <p className="text-brand-dark/70 text-sm md:text-base leading-relaxed">
                    {product.desc || `Experience the pinnacle of comfort and style with our ${product.name}. Handcrafted with premium materials and designed to transform your living space into a sanctuary of elegance.`}
                  </p>
  
                  <div className="space-y-3 pt-4 border-t border-black/5">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-brand-dark/40">Quick Enquiry</h4>
                    <WhatsAppButton productName={product.name} variant="button" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute inset-0 bg-brand-dark/98 backdrop-blur-xl"
            />
            
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-[210] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-full h-full max-w-6xl max-h-[90vh]"
            >
              <Image
                src={product.img}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
