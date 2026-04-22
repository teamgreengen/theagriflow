import { supabaseAdmin } from ''@/lib/supabase''
import crypto from ''crypto''
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''''
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || ''''
const PAYSTACK_BASE_URL = ''https://api.paystack.co''
export function initializePayment(amount: number, email: string, orderId: string, metadata?: any) {
  const reference = ''PSK-'' + Date.now() + ''-'' + Math.random().toString(36).substring(7)
  return {
    reference,
    amount: amount * 100, // Paystack uses kobo (smallest currency unit)
    email,
    currency: ''GHS'',
    callback_url: process.env.NEXT_PUBLIC_APP_URL + ''/payment/verify'',
    metadata: { order_id: orderId, ...metadata }
  }
}
export async function verifyPayment(reference: string) {
  try {
    const response = await fetch(PAYSTACK_BASE_URL + ''/transaction/verify/'' + reference, {
      headers: { Authorization: ''Bearer '' + PAYSTACK_SECRET_KEY }
    })
    const data = await response.json()
    return data
  } catch (error) {
    return { status: false, message: ''Verification failed'' }
  }
}
export async function completePayment(reference: string) {
  const verification = await verifyPayment(reference)
  if (verification.status && verification.data.status === ''success'') {
    const orderId = verification.data.metadata?.order_id
    if (orderId) {
      await supabaseAdmin.from(''orders'').update({
        payment_status: ''success'',
        order_status: 2,
        payu_status: ''success'',
        mihpayid: reference
      }).eq(''id'', orderId)
      await supabaseAdmin.from(''order_time'').insert({ oid: orderId, o_status: 2 })
      const { data: items } = await supabaseAdmin.from(''order_detail'').select(''p_id, qty'').eq(''oid'', orderId)
      for (const item of items || []) {
        await supabaseAdmin.from(''product'').update({ qty: supabaseAdmin.sql''`qty - ${item.qty}`'' }).eq(''id'', item.p_id)
      }
    }
    return { success: true, message: ''Payment successful'' }
  }
  return { success: false, message: ''Payment failed'' }
}
