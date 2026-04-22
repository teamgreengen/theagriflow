import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { completePayment } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    
    const { orderId, action } = await request.json()
    if (action === 'verify' && orderId) {
      const result = await completePayment(orderId)
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}