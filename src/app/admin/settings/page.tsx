'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Loader2, 
  Instagram, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  // Form State
  const [settings, setSettings] = useState({
    instagram_id: '',
    whatsapp_number: '',
    maps_url: '',
    email: '',
    phone_number: '',
    address: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.message.includes('relation "business_settings" does not exist')) {
          setTableExists(false);
        } else if (error.code === 'PGRST116') {
          // Row doesn't exist, we'll create it on save
          setTableExists(true);
        } else {
          throw error;
        }
      } else if (data) {
        setSettings({
          instagram_id: data.instagram_id || '',
          whatsapp_number: data.whatsapp_number || '',
          maps_url: data.maps_url || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || ''
        });
        setTableExists(true);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      toast.error('Failed to load business settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('business_settings')
        .upsert({
          id: 1,
          instagram_id: settings.instagram_id.trim(),
          whatsapp_number: settings.whatsapp_number.trim(),
          maps_url: settings.maps_url.trim(),
          email: settings.email.trim(),
          phone_number: settings.phone_number.trim(),
          address: settings.address.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Business settings updated successfully!');
    } catch (err: any) {
      console.error('Save Error Details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      toast.error(err.message || 'Failed to save settings. Check console for details.');
    } finally {
      setIsSaving(false);
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
          <p className="text-slate-500">To manage business details, you need to create the <b>business_settings</b> table in your Supabase SQL Editor.</p>
          
          <div className="bg-slate-900 text-left p-6 rounded-3xl overflow-x-auto">
            <pre className="text-brand-green text-sm font-mono leading-relaxed">
{`CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  instagram_id TEXT,
  whatsapp_number TEXT,
  maps_url TEXT,
  email TEXT,
  phone_number TEXT,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable public access (Disable RLS)
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;

-- Initial data
INSERT INTO business_settings (id, instagram_id, whatsapp_number, maps_url, email, phone_number, address)
VALUES (1, 'bhuviaarya_enterprises', '919000000000', '', 'info@bhuviaarya.com', '+91 90000 00000', 'Gujjarakere Road, Jeppu Market Rd, Bolar, Mangaluru, Karnataka 575001')
ON CONFLICT (id) DO NOTHING;
`}
            </pre>
          </div>
          <button 
            onClick={fetchSettings}
            className="bg-brand-green text-white px-8 py-4 rounded-full font-black shadow-xl shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all"
          >
            I've created the table, Refresh!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Business Settings</h1>
        <p className="text-slate-500 font-medium text-lg">Manage your contact information and social links</p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Social & Communication */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Globe className="w-6 h-6 text-brand-green" />
                Connectivity
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <Instagram className="w-3 h-3" /> Instagram ID
                  </label>
                  <input
                    type="text"
                    value={settings.instagram_id}
                    onChange={(e) => setSettings({...settings, instagram_id: e.target.value})}
                    placeholder="e.g. bhuviaarya_enterprises"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" /> WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                    placeholder="e.g. 919000000000 (include country code)"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Phone className="w-6 h-6 text-brand-green" />
                Contact Details
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    placeholder="e.g. info@bhuviaarya.com"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Display Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone_number}
                    onChange={(e) => setSettings({...settings, phone_number: e.target.value})}
                    placeholder="e.g. +91 90000 00000"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-brand-green" />
                Store Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Physical Address</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    placeholder="Enter full store address..."
                    rows={4}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Google Maps Embed URL</label>
                  <textarea
                    value={settings.maps_url}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Auto-extract src from iframe if pasted
                      if (val.includes('<iframe')) {
                        const match = val.match(/src="([^"]+)"/);
                        if (match && match[1]) {
                          val = match[1];
                          toast.info('Extracted map URL from iframe tag!');
                        }
                      }
                      setSettings({...settings, maps_url: val});
                    }}
                    placeholder="Paste the link or the full iframe code from Google Maps..."
                    rows={4}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-green transition-all resize-none"
                  />
                  <p className="text-[10px] text-slate-400 ml-4">
                    Go to Google Maps → Share → Embed a map → <b>Copy HTML</b> and paste it here. We'll handle the rest!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
