'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Globe, Users, LayoutDashboard, LogOut } from 'lucide-react'

export default function AdminHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const pathname = usePathname()
  const isDashboard = pathname === '/admin/dashboard'
  const isSubmissions = pathname?.startsWith('/admin/dashboard/submissions')

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Left: Branding & Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-neon-blue shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-100 tracking-tight">EUMUN 2026</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 px-1.5 py-0.2 rounded shadow-xs">
                ADMIN
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block -mt-0.5">
              {subtitle || 'Delegation Command Center'}
            </span>
          </div>
        </div>

        {/* Right: Nav Tabs & Sign Out */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all
              ${isDashboard
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/40'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </Link>

          <Link
            href="/admin/dashboard/submissions"
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all
              ${isSubmissions
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/40'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submissions</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-300 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 px-3 py-2 rounded-xl transition-all ml-1 cursor-pointer"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

