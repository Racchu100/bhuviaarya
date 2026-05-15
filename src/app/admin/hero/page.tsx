'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Upload, 
  Loader2, 
  ArrowUp, 
  ArrowDown,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function HeroAdmin() {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [tableExists, setTableExists] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('/products');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        if (error.message.includes('relation "hero_slides" does not exist')) {
          setTableExists(false);
        } else {
          throw error;
        }
      } else {
        setSlides(data || []);
        setTableExists(true);
      }
    } catch (err: any) {
      console.error('Error fetching slides:', err);
      toast.error('Failed to load hero slides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large! Max 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCtaText('Explore Collection');
    setCtaLink('/products');
    setImageFile(null);
    setImagePreview(null);
    setEditingSlide(null);
  };

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle);
    setCtaText(slide.cta_text || 'Explore Collection');
    setCtaLink(slide.cta_link || '/products');
    setImagePreview(slide.image);
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!imagePreview && !imageFile)) {
      toast.error('Title and Image are required');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = editingSlide ? editingSlide.image : '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `hero/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Supabase Upload Error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}. Ensure an 'images' bucket exists in Supabase with public access.`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      const slideData = {
        title,
        subtitle,
        cta_text: ctaText,
        cta_link: ctaLink,
        image: finalImageUrl,
        order_index: editingSlide ? editingSlide.order_index : slides.length
      };

      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', editingSlide.id);
        if (error) throw error;
        toast.success('Slide Updated');
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([slideData]);
        if (error) throw error;
        toast.success('Slide Added');
      }

      setIsAdding(false);
      resetForm();
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save slide');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this slide?')) return;
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      toast.success('Slide Removed');
      fetchSlides();
    } catch (err: any) {
      toast.error('Failed to remove slide');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(newIndex, 0, moved);

    // Update order_index for all
    const updates = newSlides.map((s, i) => ({
      id: s.id,
      order_index: i
    }));

    try {
      for (const update of updates) {
        await supabase.from('hero_slides').update({ order_index: update.order_index }).eq('id', update.id);
      }
      setSlides(newSlides);
      toast.success('Order Updated');
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  if (!tableExists) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-brand-yellow/10 rounded-[2rem] flex items-center justify-center text-brand-yellow mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Database Setup Required</h2>
          <p className="text-slate-500">To manage the Hero section, you need to create the <b>hero_slides</b> table in your Supabase SQL Editor.</p>
          
          <div className="bg-slate-900 text-left p-6 rounded-3xl overflow-x-auto">
            <pre className="text-brand-green text-sm font-mono leading-relaxed">
{`CREATE TABLE hero_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Explore Collection',
  cta_link TEXT DEFAULT '/products',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial Data
INSERT INTO hero_slides (image, title, subtitle, cta_text, cta_link, order_index)
VALUES 
('/images/sofa_hero.png', 'Modern Living, Timeless Elegance', 'Premium sofas crafted for comfort and style.', 'Explore Sofas', '/products?category=sofas', 0),
('/images/dining_hero.png', 'Royal Dining Experiences', 'Hand-crafted wooden dining sets for your home.', 'View Collections', '/products?category=dining', 1),
('/images/glass_dining_hero.png', 'Sophisticated Glass Designs', 'Sleek and modern dining tables for contemporary spaces.', 'Discover More', '/products?category=glass', 2);`}
            </pre>
          </div>
          <button 
            onClick={fetchSlides}
            className="bg-brand-green text-white px-8 py-4 rounded-full font-black shadow-xl shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all"
          >
            I've created the table, Refresh!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Hero Management</h1>
          <p className="text-slate-500 font-medium">Control the first impression of your website</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="bg-brand-green text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-brand-green/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Slide
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-6 group"
              >
                {/* Preview Image */}
                <div className="relative w-full md:w-64 h-48 rounded-[2rem] overflow-hidden bg-slate-50 shrink-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg">
                    Slide {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{slide.title}</h3>
                    <p className="text-slate-500 font-medium line-clamp-2">{slide.subtitle}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">
                      CTA: {slide.cta_text}
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">
                      Link: {slide.cta_link}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-center gap-2">
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => moveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-brand-green disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => moveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-brand-green disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="flex-1 md:flex-none p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="flex-1 md:flex-none p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {slides.length === 0 && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto shadow-sm">
                <ImageIcon className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No slides found. Add one to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingSlide ? 'Edit Hero Slide' : 'Add New Slide'}</h2>
                  <p className="text-slate-500 font-medium text-sm">Fill in the details for your home page banner</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-3 rounded-2xl hover:bg-white transition-colors text-slate-400 hover:text-slate-900 shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Banner Image (16:9 recommended)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); }}
                    className={cn(
                      "relative h-64 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden group cursor-pointer",
                      isDragging ? "border-brand-green bg-brand-green/5" : "border-slate-200 hover:border-brand-green bg-slate-50"
                    )}
                    onClick={() => document.getElementById('hero-upload')?.click()}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center gap-2 font-black text-slate-900">
                            <Upload className="w-5 h-5" /> Change Image
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 shadow-sm">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-900 font-black">Drop your masterpiece here</p>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">or click to browse</p>
                        </div>
                      </>
                    )}
                    <input type="file" id="hero-upload" hidden accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Headline (H1)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Royal Dining Experiences"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Content (Subtitle)</label>
                    <textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g., Hand-crafted wooden dining sets for your home."
                      rows={3}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">CTA Button Text</label>
                      <input
                        type="text"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Button Link (Href)</label>
                      <input
                        type="text"
                        value={ctaLink}
                        onChange={(e) => setCtaLink(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-black hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] bg-brand-green text-white py-5 rounded-[2rem] font-black shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        {editingSlide ? 'Update Slide' : 'Save Slide'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
