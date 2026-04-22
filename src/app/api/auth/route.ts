import { NextResponse } from 'next/server'
import { loginUser, registerUser } from '@/lib/user'
import { setSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, email, password, name, phone } = body

    if (action === 'register') {
      const result = await registerUser(name, email, password, phone)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      await setSession(result.userId as string, email, false)
      return NextResponse.json({ success: true, user: result })
    }

    if (action === 'login') {
      const result = await loginUser(email, password)
      if (!result.success) return NextResponse.json(result, { status: 401 })
      await setSession(result.user.id, result.user.email, result.user.isAdmin)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
