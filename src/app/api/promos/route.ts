import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promoId = searchParams.get('promoId');
    const code = searchParams.get('code');

    if (promoId) {
      const { data, error } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('id', promoId)
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (code) {
      const { data, error } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 1)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
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
    const { code, discount, minOrder } = body;

    if (!code || !discount) {
      return NextResponse.json({ error: 'Code and discount required' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('promo_codes')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert({
        code: code.toUpperCase(),
        discount,
        min_order: minOrder || 0,
        status: 1,
      })
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
    const { promoId, code, discount, minOrder, status } = body;

    if (!promoId) {
      return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
    }

    const updates: any = {};
    if (code) updates.code = code.toUpperCase();
    if (discount) updates.discount = discount;
    if (minOrder !== undefined) updates.min_order = minOrder;
    if (status) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .update(updates)
      .eq('id', promoId)
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
    const promoId = searchParams.get('promoId');

    if (!promoId) {
      return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('promo_codes')
      .delete()
      .eq('id', promoId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}