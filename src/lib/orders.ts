import { NextRequest, NextResponse } from ''next/server''
import { getSession } from ''@/lib/auth''
import { supabaseAdmin } from ''@/lib/supabase''
import { v4 as uuidv4 } from ''uuid''
export async function createOrder(userId: string, addressId: string, paymentType: number, cityId: string) {
  const { data: cart } = await supabaseAdmin.from(''cart'').select(''*'').eq(''u_id'', userId).eq(''belonging_city'', cityId).single()
  if (!cart || (cart.total || 0) === 0) return { success: false, message: ''Cart is empty'' }
  const orderId = ''ORD-'' + uuidv4().substring(0, 8).toUpperCase()
  const txnId = ''TXN-'' + uuidv4().substring(0, 12).toUpperCase()
  const { data: order, error: orderError } = await supabaseAdmin.from(''orders'').insert({
    u_id: userId, o_id: orderId, ad_id: addressId, txnid: txnId,
    total_amt: cart.total, ship_fee_order: cart.ship_fee, final_val: cart.final_amt,
    payment_type: paymentType, dv_date: cityId,
  }).select().single()
  if (orderError) return { success: false, message: orderError.message }
  const { data: cartItems } = await supabaseAdmin.from(''cart_detail'').select(''*, product:cart_detail.p_id(price)'').eq(''cart_id'', cart.id)
  for (const item of cartItems || []) {
    await supabaseAdmin.from(''order_detail'').insert({ oid: order.id, p_id: item.p_id, qty: item.qty, price: (item as any).product?.price || 0 })
  }
  await supabaseAdmin.from(''order_time'').insert({ oid: order.id, o_status: 1 })
  await supabaseAdmin.from(''cart'').delete().eq(''id'', cart.id)
  await supabaseAdmin.from(''cart_detail'').delete().eq(''cart_id'', cart.id)
  return { success: true, orderId: order.id, orderOId: orderId, txnId, finalVal: cart.final_amt }
}
export async function getOrders(userId: string) {
  const { data } = await supabaseAdmin.from(''orders'').select(''*, order_detail(*, product:order_detail.p_id(product_name, img1))'').eq(''u_id'', userId).neq(''order_status'', 1).order(''created_at'', { ascending: false })
  return data || []
}
export async function getOrderById(orderId: string, userId: string) {
  const { data } = await supabaseAdmin.from(''orders'').select(''*, user_address:ad_id(*), order_detail(*, product:order_detail.p_id(*))'').eq(''id'', orderId).eq(''u_id'', userId).single()
  return data
}
export async function confirmOrderDelivery(orderId: string, userId: string) {
  const { error } = await supabaseAdmin.from(''orders'').update({ u_cnfrm: true }).eq(''id'', orderId).eq(''u_id'', userId)
  if (error) return { success: false }
  return { success: true }
}
