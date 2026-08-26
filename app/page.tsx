import RegistrationForm from '@/components/RegistrationForm'
import {
  Globe,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'EUMUN 2026 — Delegate Registration | Campus Envoy Syed Saimum Hasan',
  description:
    'Official delegate registration for EUMUN 2026. Join aspiring diplomats from across the nation for three days of high-quality debate and intellectual exchange.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* ── Background Ambient Gradients ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-gradient-to-b from-indigo-900/30 via-blue-900/20 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/4 -right-32 w-[480px] h-[380px] bg-cyan-900/20 blur-[130px] rounded-full" />
        <div className="absolute top-2/3 -left-32 w-[450px] h-[350px] bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      {/* ── Header Top Bar ── */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-neon-blue">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-100">EUMUN 2026</span>
              <span className="text-[10px] block text-cyan-400 font-mono font-bold -mt-0.5">CAMPUS DELEGATION</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-3 py-1 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Registration Open</span>
            </div>
            <Link
              href="/admin/login"
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Admin Access"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero & Invitation Section ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col gap-6">

          {/* Conference Badges in Dark */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              EUMUN 2026
            </span>
            <span className="badge bg-slate-900/80 border border-slate-800 text-slate-300 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Official Delegation Cycle
            </span>
            <span className="badge bg-slate-900/80 border border-slate-800 text-slate-300 shadow-xs">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Committees Announcing Soon
            </span>
          </div>

          {/* Hero Titles */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 leading-tight">
              EUMUN 2026 Delegation Registration
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed font-medium">
              Join aspiring diplomats, leaders, and changemakers for engaging debate, meaningful collaboration, and intellectual exchange.
            </p>
          </div>

          {/* Envoy Card in Rich Dark Glass Tint */}
          <div className="card-glow-blue flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-neon-blue">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-extrabold text-slate-100">Syed Saimum Hasan</p>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-xs text-indigo-400 font-bold">Campus Envoy · EUMUN 2026</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-2.5 py-1 rounded-full shadow-xs">
                OFFICIAL INVITATION
              </span>
            </div>

            <div className="border-t border-slate-800/80 pt-3 text-xs text-slate-300 leading-relaxed space-y-2.5 font-medium">
              <p>
                &quot;Hello, I&#39;m <strong className="text-slate-100">Syed Saimum Hasan</strong>. I&#39;m honoured to inform you that I&#39;ll be serving as Campus Envoy for EUMUN 2026.&quot;
              </p>
              <p>
                &quot;EUMUN 2026 will bring together aspiring diplomats, leaders, and changemakers from across the country for three days of engaging debate, meaningful collaboration, and intellectual exchange. The conference is designed to foster critical thinking, diplomacy, negotiation, and public speaking while addressing pressing global issues through high-quality committee sessions.&quot;
              </p>
              <p>
                &quot;We would be honored to have you join us as a delegate and contribute your perspective. Should you require any information regarding registration or committees, please feel free to reach out to me directly.&quot;
              </p>
            </div>
          </div>

          {/* ── Form Mount ── */}
          <div className="pt-2 pb-16">
            <RegistrationForm />
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-400 font-medium">
        <p className="font-semibold text-slate-200">EUMUN 2026 Delegation Portal</p>
        <p className="mt-1 text-[11px] text-slate-500">Campus Envoy: Syed Saimum Hasan</p>
      </footer>
    </main>
  )
}

