'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Globe,
  ShieldCheck,
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.ok) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      setError('Invalid username or password. Please check your credentials.')
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dark Ambient background light */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-900/20 blur-[130px] rounded-full" />
        <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-cyan-900/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-neon-blue">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">EUMUN 2026 Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Delegation Command & Control</p>
          </div>
        </div>

        {/* Form Card (Dark Glassmorphic) */}
        <form onSubmit={handleSubmit} className="card-glow-indigo p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label flex items-center gap-1.5" htmlFor="username">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Username</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="input-field"
              placeholder="admin"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label flex items-center gap-1.5" htmlFor="password">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input-field pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-3 text-xs font-semibold text-rose-300 flex items-start gap-2 animate-fade-in" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to public form */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
          <Link href="/" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Registration</span>
          </Link>
          <span className="font-mono text-slate-500">EUMUN 2026</span>
        </div>

      </div>
    </main>
  )
}

