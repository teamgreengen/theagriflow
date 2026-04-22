import { supabaseAdmin } from ''./supabase''
import bcrypt from ''bcryptjs''
export async function registerUser(name: string, email: string, password: string, phone?: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const { data, error } = await supabaseAdmin.from(''users'').insert({ name, email, password: hashedPassword, phone }).select().single()
  if (error) {
    if (error.code === ''23505'') return { success: false, message: ''Email already registered'' }
    return { success: false, message: error.message }
  }
  return { success: true, userId: data.id }
}
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.from(''users'').select(''*'').eq(''email'', email).single()
  if (error || !data) return { success: false, message: ''Invalid credentials'' }
  const isValid = await bcrypt.compare(password, data.password)
  if (!isValid) return { success: false, message: ''Invalid credentials'' }
  return { success: true, user: { id: data.id, name: data.name, email: data.email, phone: data.phone, wallet: data.wallet, isAdmin: data.is_admin } }
}
