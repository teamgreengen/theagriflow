import { supabaseAdmin } from './supabase'

export async function getUserWallet(userId: string) {
  const { data } = await supabaseAdmin.from('users').select('wallet').eq('id', userId).single()
  return data?.wallet || 0
}

export async function getWalletTransactions(userId: string) {
  const { data } = await supabaseAdmin.from('wallet_txn')
    .select('*')
    .eq('u_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function addWalletTransaction(userId: string, amount: number, type: string, description: string) {
  const { data, error } = await supabaseAdmin.from('wallet_txn')
    .insert({ u_id: userId, amount, type, description })
    .select()
    .single()
  
  if (error) return { success: false, message: error.message }
  
  const { error: updateError } = await supabaseAdmin.from('users')
    .update({ wallet: await getUserWallet(userId) + amount })
    .eq('id', userId)
  
  if (updateError) return { success: false, message: updateError.message }
  
  return { success: true, transaction: data }
}

export async function getSellerWallet(sellerId: string) {
  const { data } = await supabaseAdmin.from('sellers').select('wallet').eq('id', sellerId).single()
  return data?.wallet || 0
}

export async function getSellerWalletTransactions(sellerId: string) {
  const { data } = await supabaseAdmin.from('wallet_txn')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function requestWithdrawal(sellerId: string, amount: number) {
  const wallet = await getSellerWallet(sellerId)
  if (wallet < amount) return { success: false, message: 'Insufficient balance' }
  
  const { data, error } = await supabaseAdmin.from('withdrawal_requests')
    .insert({ seller_id: sellerId, amount, status: 'pending' })
    .select()
    .single()
  
  if (error) return { success: false, message: error.message }
  
  await supabaseAdmin.from('sellers').update({ wallet: wallet - amount }).eq('id', sellerId)
  await supabaseAdmin.from('wallet_txn').insert({
    seller_id: sellerId,
    amount: -amount,
    type: 'withdrawal',
    description: `Withdrawal request #${data.id}`
  })
  
  return { success: true, requestId: data.id }
}

export async function getDeliveryBoyWallet(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('delivery_boys').select('wallet').eq('id', deliveryBoyId).single()
  return data?.wallet || 0
}

export async function getDeliveryBoyWalletTransactions(deliveryBoyId: string) {
  const { data } = await supabaseAdmin.from('wallet_txn')
    .select('*')
    .eq('delivery_boy_id', deliveryBoyId)
    .order('created_at', { ascending: false })
  return data || []
}