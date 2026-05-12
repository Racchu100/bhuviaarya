'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productName?: string;
  variant?: 'float' | 'button';
}

export default function WhatsAppButton({ productName, variant = 'float' }: WhatsAppButtonProps) {
  const phone = '919000000000';
  const message = productName 
    ? `Hi, I'm interested in the ${productName} I saw on your website.`
    : "Hi, I'd like to enquire about your furniture products.";
  
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  if (variant === 'button') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all w-full whitespace-nowrap text-sm md:text-lg overflow-hidden shadow-lg"
      >
        <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
        <span className="md:hidden">Enquire</span>
        <span className="hidden md:inline">Enquire on WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-brand-green text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-brand-dark px-3 py-1 rounded-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
