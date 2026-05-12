import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, parentId } = await request.json();
    
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        name, 
        parent_id: parentId || null 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
