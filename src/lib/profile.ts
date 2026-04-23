import { supabaseAdmin } from './supabase'

export interface Address {
  id?: string
  u_id?: string
  user_name?: string
  user_mobile?: string
  address?: string
  city_id?: string
  pincode?: string
  landmark?: string
  address_type?: string
}

export async function getUserAddresses(userId: string) {
  const { data } = await supabaseAdmin.from('user_address')
    .select('*, city_id:city_id(city_name)')
    .eq('u_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getUserAddressById(addressId: string, userId: string) {
  const { data } = await supabaseAdmin.from('user_address')
    .select('*, city_id:city_id(city_name)')
    .eq('id', addressId)
    .eq('u_id', userId)
    .single()
  return data
}

export async function addUserAddress(userId: string, address: Omit<Address, 'id' | 'u_id'>) {
  const { data, error } = await supabaseAdmin.from('user_address')
    .insert({ ...address, u_id: userId })
    .select()
    .single()
  
  if (error) return { success: false, message: error.message }
  return { success: true, address: data }
}

export async function updateUserAddress(addressId: string, userId: string, address: Partial<Address>) {
  const { error } = await supabaseAdmin.from('user_address')
    .update(address)
    .eq('id', addressId)
    .eq('u_id', userId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function deleteUserAddress(addressId: string, userId: string) {
  const { error } = await supabaseAdmin.from('user_address')
    .delete()
    .eq('id', addressId)
    .eq('u_id', userId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function updateUserProfile(userId: string, updates: { name?: string; phone?: string }) {
  const { error } = await supabaseAdmin.from('users')
    .update(updates)
    .eq('id', userId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function getUserProfile(userId: string) {
  const { data } = await supabaseAdmin.from('users')
    .select('id, name, email, phone, wallet, is_admin, created_at')
    .eq('id', userId)
    .single()
  return data
}

export async function getSellerProfile(sellerId: string) {
  const { data } = await supabaseAdmin.from('sellers')
    .select('*')
    .eq('id', sellerId)
    .single()
  return data
}

export async function updateSellerProfile(sellerId: string, updates: {
  f_name?: string
  b_name?: string
  phone?: string
  address?: string
  city?: string
}) {
  const { error } = await supabaseAdmin.from('sellers')
    .update(updates)
    .eq('id', sellerId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}