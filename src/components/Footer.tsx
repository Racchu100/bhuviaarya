'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function Footer() {
  const [settings, setSettings] = useState({
    instagram_id: 'bhuviaarya_enterprises',
    whatsapp_number: '919000000000',
    email: 'info@bhuviaarya.com',
    phone_number: '+91 90000 00000',
    address: 'Gujjarakere Road, Jeppu Market Rd, Bolar, Mangaluru, Karnataka 575001'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('business_settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (data && !error) {
          setSettings({
            instagram_id: data.instagram_id || 'bhuviaarya_enterprises',
            whatsapp_number: data.whatsapp_number || '919000000000',
            email: data.email || 'info@bhuviaarya.com',
            phone_number: data.phone_number || '+91 90000 00000',
            address: data.address || 'Gujjarakere Road, Jeppu Market Rd, Bolar, Mangaluru, Karnataka 575001'
          });
        }
      } catch (err) {
        console.warn('Footer settings fetch error:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-brand-dark text-white pt-10 pb-4 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tighter block">
              Bhu<span className="text-brand-green">v</span>i Aar<span className="text-brand-green">y</span>a<span className="text-brand-yellow ml-1 text-sm font-semibold uppercase">Enterprises</span>
            </Link>
            <p className="text-white/60 leading-relaxed max-w-xs text-xs md:text-sm">
              Your one-stop destination for premium furniture in Mangaluru. We specialize in sofas, dining sets, and custom interiors.
            </p>
            <div className="flex gap-4">
              <a 
                href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-[#25D366] transition-colors" 
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-4.5 h-4.5" />
              </a>
              <a 
                href={`https://instagram.com/${settings.instagram_id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-brand-green transition-colors" 
                title="Follow on Instagram"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-brand-yellow uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li><Link href="/" className="hover:text-brand-green transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-brand-green transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-green transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-brand-yellow uppercase tracking-widest">Categories</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li><Link href="/products?cat=sofas" className="hover:text-brand-green transition-colors">Premium Sofas</Link></li>
              <li><Link href="/products?cat=dining" className="hover:text-brand-green transition-colors">Wooden Dining Sets</Link></li>
              <li><Link href="/products?cat=glass" className="hover:text-brand-green transition-colors">Glass Dining Tables</Link></li>
              <li><Link href="/products?cat=custom" className="hover:text-brand-green transition-colors">Custom Furniture</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-brand-yellow uppercase tracking-widest">Contact Info</h4>
            <ul className="space-y-2 text-white/60">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-xs md:text-sm">{settings.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-xs md:text-sm">{settings.phone_number}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-xs md:text-sm">{settings.email}</span>
              </li>
              <li className="flex gap-3">
                <Instagram className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-xs md:text-sm">@{settings.instagram_id}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 text-center text-white/40 text-[10px]">
          <p>&copy; {new Date().getFullYear()} Bhuvi Aarya Enterprises. All Rights Reserved. Designed by Graphitex Digitals.</p>
        </div>
      </div>
    </footer>
  );
}
