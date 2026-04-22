import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret')

export async function createToken(payload: { userId: string; email: string; isAdmin?: boolean }) {
  return new SignJWT(payload as Record<string, unknown>).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret)
}

export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret); return payload } catch { return null }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  return token ? verifyToken(token) : null
}

export async function setSession(userId: string, email: string, isAdmin = false) {
  const token = await createToken({ userId, email, isAdmin })
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
}

export async function removeSession() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}