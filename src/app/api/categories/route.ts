import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json([]); // Return empty array to prevent frontend crash
    }
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json([]); // Return empty array to prevent frontend crash
  }
}

export async function POST(request: Request) {
  try {
    const { id, name, parentId } = await request.json();
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        id, 
        name, 
        parent_id: parentId || null 
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Create category error:', error);
      throw error;
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
