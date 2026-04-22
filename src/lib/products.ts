import { supabaseAdmin } from ''./supabase''
export async function getCategories() {
  const { data } = await supabaseAdmin.from(''categories'').select(''*'').eq(''status'', 1).order(''category'')
  return data || []
}
export async function getFeaturedProducts() {
  const { data } = await supabaseAdmin.from(''product'').select(''*, categories:cat_id(category)'').eq(''status'', 1).eq(''approved'', true).order(''created_at'', { ascending: false })
  return data || []
}
export async function getCities() {
  const { data } = await supabaseAdmin.from(''city'').select(''*'').eq(''status'', 1).order(''city_name'')
  return data || []
}
export async function getProductById(id: string) {
  const { data } = await supabaseAdmin.from(''product'').select(''*, categories:cat_id(category)'').eq(''id'', id).single()
  return data
}
