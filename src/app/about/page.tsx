import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Image from 'next/image';
import { Target, Eye, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-0 pb-16">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center px-6">
          <div className="absolute inset-0">
            <Image
              src="/images/showroom.png"
              alt="Bhuvi Aarya Journey"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-brand-dark/80" />
          </div>
          <div className="relative z-10 container mx-auto pt-20">
            <h1 className="text-white text-2xl md:text-5xl font-bold mb-6 tracking-tight">Our Story</h1>
            <p className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto font-light">
              Crafting comfort and style for Mangaluru homes since 2014.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h6 className="text-brand-green font-bold uppercase tracking-[0.2em] text-[10px]">Our Legacy</h6>
                  <h2 className="text-xl md:text-3xl font-bold leading-tight">The Vision Behind <span className="text-brand-green">Bhuvi Aarya</span></h2>
                </div>
                <div className="space-y-6 text-foreground/70 text-sm md:text-base leading-relaxed">
                  <p>
                    Established with a passion for interior excellence, Bhuvi Aarya Enterprises has become a leading name in the furniture industry in Mangaluru. We specialize in providing high-quality, modern, and durable furniture that transforms houses into homes.
                  </p>
                  <p>
                    Our showroom in Bolar showcases a curated collection of sofas, dining sets, and bespoke furniture pieces designed to meet the evolving tastes of our customers. We pride ourselves on our attention to detail, use of premium materials, and commitment to customer satisfaction.
                  </p>
                </div>
                <div className="pt-6 flex flex-wrap gap-4">
                  <WhatsAppButton variant="button" />
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
                  <Image
                    src="/images/dining_hero.png"
                    alt="Furniture Design"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-yellow rounded-full flex flex-col items-center justify-center text-brand-dark shadow-xl">
                  <span className="text-4xl font-bold leading-none">15+</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Years Exp</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-6 grid grid-cols-2 gap-3 md:gap-12">
            <div className="p-4 md:p-12 rounded-[1.5rem] md:rounded-[3rem] bg-background border border-border space-y-3 md:space-y-6 hover:border-brand-green transition-all group">
              <div className="w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-[2rem] bg-brand-green/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-500">
                <Eye className="w-5 h-5 md:w-10 md:h-10" />
              </div>
              <h3 className="text-base md:text-2xl font-bold">Our Vision</h3>
              <p className="text-foreground/60 text-[10px] md:text-base leading-relaxed">
                To be the most trusted furniture brand in Coastal Karnataka, known for innovation, quality, and timeless designs that redefine living spaces for generations.
              </p>
            </div>
            <div className="p-4 md:p-12 rounded-[1.5rem] md:rounded-[3rem] bg-background border border-border space-y-3 md:space-y-6 hover:border-brand-green transition-all group">
              <div className="w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-[2rem] bg-brand-yellow/10 flex items-center justify-center text-brand-yellow group-hover:bg-brand-yellow group-hover:text-brand-dark transition-all duration-500">
                <Target className="w-5 h-5 md:w-10 md:h-10" />
              </div>
              <h3 className="text-base md:text-2xl font-bold">Our Mission</h3>
              <p className="text-foreground/60 text-[10px] md:text-base leading-relaxed">
                To provide affordable luxury furniture that enhances the quality of life for our customers through superior comfort, sophisticated aesthetics, and exceptional durability.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h6 className="text-brand-green font-bold uppercase tracking-[0.2em] text-[10px]">Core Values</h6>
              <h2 className="text-2xl md:text-3xl font-bold">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-12">
              {[
                { icon: Award, title: 'Uncompromising Quality', desc: 'Every piece is inspected for the highest standards.' },
                { icon: Users, title: 'Customer First', desc: 'Personalized service to help you find your perfect match.' },
                { icon: Target, title: 'Innovation', desc: 'Always bringing the latest global trends to your place.' },
              ].map((value, i) => (
                <div key={i} className="text-center space-y-4 md:space-y-4 px-6 md:px-1">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg md:text-base font-bold uppercase tracking-wider leading-tight">{value.title}</h4>
                  <p className="text-foreground/60 text-sm md:text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Map */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h6 className="text-brand-green font-bold uppercase tracking-[0.2em] text-sm">Find Us</h6>
              <h2 className="text-2xl md:text-3xl font-bold">Store Location</h2>
            </div>
            <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-border shadow-2xl h-[450px] relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.931780645988!2d74.8467146757796!3d12.847682687456434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35b2af01a55a9%3A0xf85f72cd87ecf38b!2sBHUVI%20AARYA%20ENTERPRISES!5e0!3m2!1sen!2sin!4v1778843078388!5m2!1sen!2sin"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
