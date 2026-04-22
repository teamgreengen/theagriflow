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
      if (data.success) { 
        router.push(data.user?.isAdmin ? '/admin' : '/')
        router.refresh() 
      }
      else { setError(data.message || 'Something went wrong') }
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3 mb-6 group">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-emerald-900 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-green/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-3xl">A</span>
            </div>
            <span className="font-black text-2xl text-neutral-900 tracking-tight">AgriFlow</span>
          </Link>
          <h1 className="text-3xl font-black text-neutral-900">{isLogin ? 'Welcome Back' : 'Join AgriFlow'}</h1>
          <p className="text-neutral-500 mt-2">{isLogin ? 'Sign in to access your dashboard' : 'Start your journey with premium produce'}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] shadow-2xl shadow-neutral-200/50 p-10 border border-neutral-100">
          {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-100 font-medium">{error}</div>}
          
          {!isLogin && (
            <div className="mb-5">
              <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" placeholder="John Doe" />
            </div>
          )}

          <div className="mb-5">
            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" placeholder="name@example.com" />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 ml-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-brand-green text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-green/30 hover:bg-emerald-900 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </div>
            ) : isLogin ? 'Login' : 'Create Account'}
          </button>

          <div className="mt-8 pt-8 border-t border-neutral-50 text-center">
            <p className="text-neutral-500 text-sm font-medium">
              {isLogin ? "New to AgriFlow?" : "Already have an account?"}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-brand-green font-bold ml-2 hover:text-brand-gold transition-colors">
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}