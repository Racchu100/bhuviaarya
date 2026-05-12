import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, "desc", img, price, is_new_arrival, is_best_seller')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json([]);
    }
    
    // Map underscore fields back to camelCase for frontend compatibility
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      isNewArrival: item.is_new_arrival,
      isBestSeller: item.is_best_seller
    }));

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json([]);
  }
}
