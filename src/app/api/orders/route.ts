import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createOrder, getOrders, getOrderById, confirmOrderDelivery } from '@/lib/orders'
import { initializePayment } from '@/lib/payment'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (orderId) {
      const order = await getOrderById(orderId, (session as any).userId)
      return NextResponse.json({ success: true, data: order })
    }
    
    const orders = await getOrders((session as any).userId)
    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    
    const { addressId, paymentType, cityId } = await request.json()
    if (!addressId || !paymentType || !cityId) return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    
    const result = await createOrder((session as any).userId, addressId, paymentType, cityId)
    if (!result.success) return NextResponse.json(result, { status: 400 })
    
    if (paymentType === 2) {
      const { data: user } = await supabaseAdmin.from('users').select('email').eq('id', (session as any).userId).single()
      const paystackData = initializePayment(result.finalVal, user?.email, result.orderId)
      return NextResponse.json({ success: true, ...result, paymentRequired: true, paystack: paystackData })
    }
    
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    
    const { action, orderId } = await request.json()
    if (action === 'confirm' && orderId) {
      const result = await confirmOrderDelivery(orderId, (session as any).userId)
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}