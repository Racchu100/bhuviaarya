import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  category: string;
  desc: string;
  img: string;
  price: string; // Public price label
  isNewArrival: boolean;
  isBestSeller: boolean;
  // Private Admin Fields
  sku: string;
  barcode: string;
  total_stock: number;
  sold_quantity: number;
  purchase_price: number;
  selling_price: number;
  supplier: string;
  warehouse_notes: string;
  damaged_stock: number;
  low_stock_level: number;
  internal_notes: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
};

export type InventoryLog = {
  id: string;
  product_id: string;
  change_type: 'add' | 'remove' | 'sale' | 'damage';
  quantity: number;
  notes: string;
  timestamp: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
};

export type Sale = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  payment_method: string;
  timestamp: string;
};

export type Invoice = {
  id: string;
  sale_id: string;
  invoice_number: string;
  created_at: string;
};
