import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export async function registerDeliveryBoy(name: string, email: string, password: string, phone?: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const { data, error } = await supabaseAdmin.from('delivery_boys').insert({
    name, email, phone, password: hashedPassword
  }).select().single()
  if (error) {
    if (error.code === '23505') return { success: false, message: 'Email already registered' }
    return { success: false, message: error.message }
  }
  return { success: true, deliveryBoyId: data.id }
}

export async function loginDeliveryBoy(email: string, password: string) {
  const { data, error } = await supabaseAdmin.from('delivery_boys').select('*').eq('email', email).single()
  if (error || !data) return { success: false, message: 'Invalid credentials' }
  const isValid = await bcrypt.compare(password, data.password)
  if (!isValid) return { success: false, message: 'Invalid credentials' }
  return { success: true, deliveryBoy: { id: data.id, name: data.name, email: data.email, phone: data.phone, status: data.status } }
}

export async function getDeliveryBoyOrders(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('orders')
    .select('*, address:ad_id(*, city_id:city_id(city_name), user:u_id(name, phone), order_detail(*, product:p_id(product_name, img1))')
    .eq('dv_boy_id', deliveryBoyId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getDeliveryBoyAssignedOrders(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('orders')
    .select('*, address:ad_id(*, city_id:city_id(city_name), user:u_id(name, phone), order_detail(*, product:p_id(product_name, img1))')
    .eq('dv_boy_id', deliveryBoyId)
    .eq('order_status', 3)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getDeliveryBoyOFDOrders(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('orders')
    .select('*, address:ad_id(*, city_id:city_id(city_name), user:u_id(name, phone), order_detail(*, product:p_id(product_name, img1))')
    .eq('dv_boy_id', deliveryBoyId)
    .eq('order_status', 4)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getDeliveryBoyDeliveredOrders(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('orders')
    .select('*, address:ad_id(*, city_id:city_id(city_name), user:u_id(name, phone), order_detail(*, product:p_id(product_name, img1))')
    .eq('dv_boy_id', deliveryBoyId)
    .eq('order_status', 5)
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateOrderStatus(orderId: string, status: number) {
  const { error } = await supabaseAdmin.from('orders').update({ order_status: status }).eq('id', orderId)
  if (error) return { success: false, message: error.message }
  
  await supabaseAdmin.from('order_time').insert({ oid: orderId, o_status: status })
  
  return { success: true }
}

export async function confirmDelivery(orderId: string, deliveryBoyId: string) {
  const { error } = await supabaseAdmin.from('orders')
    .update({ order_status: 5, u_cnfrm: 1 })
    .eq('id', orderId)
    .eq('dv_boy_id', deliveryBoyId)
  
  if (error) return { success: false, message: error.message }
  
  await supabaseAdmin.from('order_time').insert({ oid: orderId, o_status: 5 })
  
  return { success: true }
}

export async function markUndelivered(orderId: string, deliveryBoyId: string, reason?: string) {
  const { error } = await supabaseAdmin.from('orders')
    .update({ order_status: 6, payu_status: reason })
    .eq('id', orderId)
    .eq('dv_boy_id', deliveryBoyId)
  
  if (error) return { success: false, message: error.message }
  
  await supabaseAdmin.from('order_time').insert({ oid: orderId, o_status: 6 })
  
  return { success: true }
}