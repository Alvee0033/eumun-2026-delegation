'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { Suspense, useState } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'Delegate'
  const department = searchParams.get('dept') || 'Academic Delegation'
  const committee1 = searchParams.get('c1') || 'Assigned Committee'
  const [copied, setCopied] = useState(false)

  const refCode = 'EUMUN-' + Math.random().toString(36).substring(2, 8).toUpperCase()

  function copyPass() {
    navigator.clipboard.writeText(
      `EUMUN 2026 Delegation Registration\nRef: ${refCode}\nDelegate: ${name}\nDept: ${department}\n1st Preference: ${committee1}\nCampus Envoy: Syed Saimum Hasan`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">

      {/* ── Status Header ── */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center shadow-neon-blue">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Application Received</h1>
        <p className="text-xs text-slate-400 font-medium">Your registration has been logged in the EUMUN 2026 delegation database.</p>
      </div>

      {/* ── Digital Credential Pass Card (Dark Theme) ── */}
      <div className="card-glow-blue p-6 relative overflow-hidden">
        {/* Accent top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 shadow-neon-blue" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              EUMUN 2026
            </span>
            <p className="text-xs font-bold text-slate-200">Official Delegation Pass</p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-indigo-950/80 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-700/60 shadow-xs">
            {refCode}
          </span>
        </div>

        {/* Delegate Details */}
        <div className="py-4 flex flex-col gap-3.5 border-b border-slate-800 text-xs">
          <div className="flex items-start justify-between">
            <span className="text-slate-400 font-medium">Delegate Name</span>
            <span className="font-bold text-slate-100 text-right">{name}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-400 font-medium">Department / Batch</span>
            <span className="font-semibold text-slate-200 text-right">{department}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-400 font-medium">Committee Preference</span>
            <span className="font-bold text-indigo-300 text-right max-w-[180px] truncate" title={committee1}>
              {committee1 || 'Open Allocation'}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-400 font-medium">Registration Fee</span>
            <span className="font-mono font-bold text-cyan-400 text-right">3,550 BDT</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-400 font-medium">Campus Envoy</span>
            <span className="font-semibold text-slate-200 text-right">Syed Saimum Hasan</span>
          </div>
        </div>

        {/* Conference Info & Referral Perk */}
        <div className="pt-4 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>EUMUN 2026 Delegation</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Representative: Syed Saimum Hasan</span>
          </div>

          <div className="mt-1 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200 leading-relaxed">
            <strong className="text-slate-100">🔥 Bring More Friends:</strong> If more delegates join our campus delegation, we will secure group scholarship benefits for our members!
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={copyPass}
          className="btn-primary"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Receipt Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Copy Application Receipt</span>
            </>
          )}
        </button>

        <Link
          href="/"
          className="btn-secondary text-center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Submit Another Registration</span>
        </Link>
      </div>

      <p className="text-center text-[11px] text-slate-500 font-medium">
        You will receive allocation confirmation directly from Campus Envoy Syed Saimum Hasan via WhatsApp.
      </p>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-900/20 blur-[130px] rounded-full" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="text-center text-slate-500 text-sm">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  )
}

