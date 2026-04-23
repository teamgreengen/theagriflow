import { supabaseAdmin } from './supabase'

export async function validatePromoCode(code: string, orderTotal: number) {
  const { data, error } = await supabaseAdmin.from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 1)
    .single()
  
  if (error || !data) {
    return { success: false, message: 'Invalid promo code' }
  }
  
  if (data.min_order > orderTotal) {
    return { success: false, message: `Minimum order of GH\u8373${data.min_order} required` }
  }
  
  return { 
    success: true, 
    discount: data.discount, 
    promoId: data.id 
  }
}

export async function applyPromoCode(cartId: string, promoId: string, discount: number) {
  const { error } = await supabaseAdmin.from('cart')
    .update({ 
      promo: discount, 
      is_applied: 1,
      final_amt: supabaseAdmin.raw(`final_amt - ${discount}`)
    })
    .eq('id', cartId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function getPromoCodes() {
  const { data } = await supabaseAdmin.from('promo_codes')
    .select('*')
    .eq('status', 1)
    .order('created_at', { ascending: false })
  return data || []
}

export async function createPromoCode(code: string, discount: number, minOrder: number = 0) {
  const { data, error } = await supabaseAdmin.from('promo_codes')
    .insert({ 
      code: code.toUpperCase(), 
      discount, 
      min_order: minOrder,
      status: 1 
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'Promo code already exists' }
    }
    return { success: false, message: error.message }
  }
  
  return { success: true, promoCode: data }
}

export async function updatePromoCode(promoId: string, updates: { code?: string; discount?: number; min_order?: number; status?: number }) {
  const { error } = await supabaseAdmin.from('promo_codes')
    .update(updates)
    .eq('id', promoId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function deletePromoCode(promoId: string) {
  const { error } = await supabaseAdmin.from('promo_codes')
    .delete()
    .eq('id', promoId)
  
  if (error) return { success: false, message: error.message }
  return { success: true }
}