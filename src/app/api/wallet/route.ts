import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sellerId = searchParams.get('sellerId');
    const type = searchParams.get('type');

    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('wallet_txn')
        .select('*')
        .eq('u_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (sellerId) {
      const { data, error } = await supabaseAdmin
        .from('wallet_txn')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'User ID or Seller ID required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sellerId, amount, type, description } = body;

    if (!amount || !type) {
      return NextResponse.json({ error: 'Amount and type required' }, { status: 400 });
    }

    if (userId) {
      const { data: user } = await supabaseAdmin.from('users').select('wallet').eq('id', userId).single();
      const newBalance = (user?.wallet || 0) + amount;

      await supabaseAdmin.from('users').update({ wallet: newBalance }).eq('id', userId);

      const { data, error } = await supabaseAdmin
        .from('wallet_txn')
        .insert({ u_id: userId, amount, type, description })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (sellerId) {
      const { data: seller } = await supabaseAdmin.from('sellers').select('wallet').eq('id', sellerId).single();
      const newBalance = (seller?.wallet || 0) + amount;

      await supabaseAdmin.from('sellers').update({ wallet: newBalance }).eq('id', sellerId);

      const { data, error } = await supabaseAdmin
        .from('wallet_txn')
        .insert({ seller_id: sellerId, amount, type, description })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'User ID or Seller ID required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}