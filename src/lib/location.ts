import { supabaseAdmin } from './supabase'

export async function getLocations() {
  const { data } = await supabaseAdmin.from('city')
    .select('*')
    .eq('status', 1)
    .order('city_name')
  return data || []
}

export async function getLocationById(locationId: string) {
  const { data } = await supabaseAdmin.from('city')
    .select('*')
    .eq('id', locationId)
    .single()
  return data
}

export async function validatePincode(locationId: string, pincode: string) {
  const { data } = await supabaseAdmin.from('user_address')
    .select('city_id')
    .eq('pincode', pincode)
    .eq('city_id', locationId)
    .single()
  
  if (data) {
    return { valid: true }
  }
  
  const cityCheck = await getLocationById(locationId)
  if (cityCheck) {
    return { valid: true, message: 'New pincode area' }
  }
  
  return { valid: false, message: 'Delivery not available to this pincode' }
}

export async function pincodeExists(pincode: string) {
  const { data } = await supabaseAdmin.from('user_address')
    .select('city_id, city_id:city_id(city_name)')
    .eq('pincode', pincode)
    .limit(1)
  
  return data && data.length > 0 ? data[0] : null
}

export async function getDeliveryTimeSlots() {
  const { data } = await supabaseAdmin.from('dv_time')
    .select('*')
    .eq('status', 1)
    .order('from_time')
  return data || []
}

export async function getDeliveryBoyById(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('delivery_boys')
    .select('id, name, phone, status')
    .eq('id', deliveryBoyId)
    .single()
  return data
}

export async function getAvailableDeliveryBoys(locationId: string) {
  const { data } = await supabaseAdmin.from('delivery_boys')
    .select('id, name, phone')
    .eq('status', 1)
  return data || []
}

export async function assignDeliveryBoy(orderId: string, deliveryBoyId: string) {
  const { error } = await supabaseAdmin.from('orders')
    .update({ dv_boy_id: deliveryBoyId, order_status: 3 })
    .eq('id', orderId)
  
  if (error) return { success: false, message: error.message }
  
  await supabaseAdmin.from('order_time').insert({ oid: orderId, o_status: 3 })
  
  return { success: true }
}

export async function assignDeliveryBoyByOrderId(orderId: string, deliveryBoyId: string) {
  return assignDeliveryBoy(orderId, deliveryBoyId)
}