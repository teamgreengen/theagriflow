'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })

  const handleChange = (e: any) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: isLogin ? 'login' : 'register', ...formData }) })
      const data = await res.json()
      if (data.success) { router.push(data.user?.isAdmin ? '/admin' : '/'); router.refresh() }
      else { setError(data.message || 'Something went wrong') }
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-2xl">S</span></div>
          </Link>
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}
          {!isLogin && <div className="mb-4"><label className="block text-sm font-medium mb-2">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" /></div>}
          <div className="mb-4"><label className="block text-sm font-medium mb-2">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" /></div>
          <div className="mb-4"><label className="block text-sm font-medium mb-2">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" /></div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">{loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}</button>
          <div className="mt-6 text-center"><p className="text-gray-500">{isLogin ? 'Don\'t have an account?' : 'Already have an account?'}<button type="button" onClick={() => setIsLogin(!isLogin)} className="text-green-600 font-medium ml-1 hover:underline">{isLogin ? 'Sign Up' : 'Login'}</button></p></div>
        </form>
      </div>
    </div>
  )
}