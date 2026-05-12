import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const db = await getDb();
    
    // 1. Migrate Categories
    let categoriesMigrated = 0;
    if (db.categories && Array.isArray(db.categories)) {
      const { data, error: catError } = await supabase
        .from('categories')
        .upsert(db.categories.map((c: any) => ({
          id: String(c.id),
          name: c.name
        })))
        .select();
      if (catError) {
        if (catError.message?.includes('relation')) {
          throw new Error('Database tables not found. Please run the SQL script in Supabase first.');
        }
        throw catError;
      }
      categoriesMigrated = data?.length || 0;
    }

    // 2. Migrate Products
    let productsMigrated = 0;
    if (db.products && Array.isArray(db.products)) {
      const { data, error: prodError } = await supabase
        .from('products')
        .upsert(db.products.map((p: any) => ({
          name: p.name,
          category: String(p.category),
          desc: p.desc || '',
          img: p.img || '',
          price: String(p.price || ''),
          is_new_arrival: !!p.isNewArrival,
          is_best_seller: !!p.isBestSeller,
          sku: p.sku || `MIG-${String(p.id).slice(-4)}`,
          total_stock: 10,
          selling_price: 0
        })))
        .select();
      if (prodError) throw prodError;
      productsMigrated = data?.length || 0;
    }

    return NextResponse.json({ 
      message: 'Migration successful',
      categoriesCount: categoriesMigrated,
      productsCount: productsMigrated
    });
  } catch (error: any) {
    console.error('Migration Error:', error);
    const message = error.message?.includes('relation') 
      ? 'Database tables not found. Please run the SQL script in Supabase SQL Editor first.' 
      : error.message || 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
