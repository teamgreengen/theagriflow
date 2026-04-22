import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    if (type === 'categories') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 1)
      if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })
      return NextResponse.json({ success: true, data })
    }

    if (type === 'featured') {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('status', 1)
        .eq('approved', true)
        .limit(8)
      if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })
      return NextResponse.json({ success: true, data })
    }

    let query = supabase.from('product').select('*').eq('status', 1).eq('approved', true)
    if (category) query = query.eq('cat_id', category)
    
    const { data, error } = await query
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    return NextResponse.json({ success: true, data })

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
