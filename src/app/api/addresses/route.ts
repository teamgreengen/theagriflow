import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_address')
      .select('*, city_id:city_id(city_name)')
      .eq('u_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...addressData } = body;

    if (!userId || !addressData.user_name || !addressData.address || !addressData.city_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_address')
      .insert({ ...addressData, u_id: userId })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressId, userId, ...updates } = body;

    if (!addressId || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_address')
      .update(updates)
      .eq('id', addressId)
      .eq('u_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');
    const userId = searchParams.get('userId');

    if (!addressId || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_address')
      .delete()
      .eq('id', addressId)
      .eq('u_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}