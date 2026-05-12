import Link from 'next/link';
import { Instagram, MapPin, Phone, Mail, Facebook, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-12 pb-6 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-bold tracking-tighter block">
              Bhu<span className="text-brand-green">v</span>i Aar<span className="text-brand-green">y</span>a<span className="text-brand-yellow ml-1 text-lg font-semibold uppercase">Enterprises</span>
            </Link>
            <p className="text-white/60 leading-relaxed max-w-xs">
              Your one-stop destination for premium furniture in Mangaluru. We specialize in sofas, dining sets, and custom interiors.
            </p>
            <div className="flex gap-4">
              <a href="https://wa.me/919900000000" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-[#25D366] transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-green transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-[#1877F2] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-brand-yellow uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-white/60">
              <li><Link href="/" className="hover:text-brand-green transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-brand-green transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand-green transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-brand-yellow uppercase tracking-widest">Categories</h4>
            <ul className="space-y-4 text-white/60">
              <li><Link href="/products?cat=sofas" className="hover:text-brand-green transition-colors">Premium Sofas</Link></li>
              <li><Link href="/products?cat=dining" className="hover:text-brand-green transition-colors">Wooden Dining Sets</Link></li>
              <li><Link href="/products?cat=glass" className="hover:text-brand-green transition-colors">Glass Dining Tables</Link></li>
              <li><Link href="/products?cat=custom" className="hover:text-brand-green transition-colors">Custom Furniture</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-brand-yellow uppercase tracking-widest">Contact Info</h4>
            <ul className="space-y-4 text-white/60">
              <li className="flex gap-4">
                <MapPin className="w-6 h-6 text-brand-green shrink-0" />
                <span>Gujjarakere Road, Jeppu Market Rd, Bolar, Mangaluru, Karnataka 575001</span>
              </li>
              <li className="flex gap-4">
                <Phone className="w-6 h-6 text-brand-green shrink-0" />
                <span>+91 90000 00000</span>
              </li>
              <li className="flex gap-4">
                <Mail className="w-6 h-6 text-brand-green shrink-0" />
                <span>info@bhuviaarya.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Bhuvi Aarya Enterprises. All Rights Reserved. Designed by Graphitex Digitals.</p>
        </div>
      </div>
    </footer>
  );
}
