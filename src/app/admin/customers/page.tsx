'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Trash2, 
  X,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setStatus('Active');
    setEditingCustomer(null);
  };

  const handleOpenModal = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
      setStatus(customer.status || 'Active');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Customer name is required');
      return;
    }

    setIsSaving(true);
    try {
      const customerData = {
        name,
        phone,
        address,
        notes,
        status,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingCustomer) {
        const { error: updateError } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('customers')
          .insert([customerData]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingCustomer ? 'Customer Updated' : 'Customer Added');
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      console.error('Save Error:', err);
      toast.error('Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Customer removed successfully');
      fetchCustomers();
    } catch (err: any) {
      console.error('Delete Error:', err);
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 font-medium">Manage your client relationships and contact data.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customers by name or phone..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold">Loading your client list...</div>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={customer.id}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(customer)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{customer.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone || 'No phone'}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-500 text-sm font-medium">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-300" />
                  <p className="line-clamp-2">{customer.address || 'No address provided'}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {customer.notes ? 'Notes Saved' : 'No Notes'}
                    </span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    customer.status === 'Active' ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
                  )}>
                    {customer.status || 'Active'} Client
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold">No customers found. Add your first client to get started!</div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveCustomer} className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">
                      {editingCustomer ? 'Edit Client' : 'New Client'}
                    </h2>
                    <p className="text-slate-500 font-medium">Enter your customer's professional profile.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., John Doe"
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 00000 00000"
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900 appearance-none"
                      >
                        <option value="Active">Active Client</option>
                        <option value="Inactive">Inactive</option>
                        <option value="VIP">VIP Client</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street name, City, ZIP..."
                      rows={2}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Internal Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Preferences, history, etc..."
                      rows={3}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-brand-green transition-all outline-none font-bold text-slate-900 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-[1.5] px-8 py-4 rounded-2xl font-bold bg-brand-green text-white hover:shadow-xl hover:shadow-brand-green/20 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Create Profile'}
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
