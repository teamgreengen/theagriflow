import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    
    const { data } = await supabaseAdmin
      .from('product')
      .select('*, categories:cat_id(category)')
      .order('created_at', { ascending: false })
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    
    const { product_name, cat_id, price, fa, qty, short_desc } = await request.json()
    
    if (!product_name || !cat_id || !price || !fa) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('product')
      .insert({ product_name, cat_id, price, fa, qty: qty || 0, short_desc, approved: true, status: 1 })
      .select()
      .single()
    
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session || !(session as any).isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, action, ...updates } = await request.json()
    
    if (action === 'approve') {
      await supabaseAdmin.from('product').update({ approved: true, status: 1 }).eq('id', id)
      return NextResponse.json({ success: true })
    }
    
    if (action === 'reject') {
      await supabaseAdmin.from('product').delete().eq('id', id)
      return NextResponse.json({ success: true })
    }
    
    await supabaseAdmin.from('product').update(updates).eq('id', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}