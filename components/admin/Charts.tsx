'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Layers,
} from 'lucide-react'

// ─── Modern Dark KPI Card ───────────────────────────────────────────────────

export function KPICard({
  label,
  value,
  sub,
  accent = false,
  iconType,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
  iconType?: 'users' | 'clock' | 'calendar' | 'check' | 'trending' | 'layers'
}) {
  const IconComponent =
    iconType === 'users'
      ? Users
      : iconType === 'clock'
        ? Clock
        : iconType === 'calendar'
          ? Clock
          : iconType === 'check'
            ? CheckCircle2
            : iconType === 'trending'
              ? TrendingUp
              : iconType === 'layers'
                ? Layers
                : null

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden backdrop-blur-xl
        ${accent
          ? 'bg-gradient-to-br from-indigo-600/90 via-blue-600/80 to-purple-600/90 text-white border-indigo-500/50 shadow-neon-blue'
          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 shadow-glass'
        }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${accent ? 'text-indigo-100' : 'text-slate-400'}`}>
          {label}
        </p>
        {IconComponent && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center
            ${accent ? 'bg-white/20 text-white' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40'}`}>
            <IconComponent className="w-4 h-4" />
          </div>
        )}
      </div>

      <p className={`text-3xl font-extrabold tracking-tight font-mono ${accent ? 'text-white' : 'text-slate-100'}`}>
        {value}
      </p>

      {sub && (
        <p className={`text-[11px] mt-1.5 font-medium ${accent ? 'text-indigo-200' : 'text-slate-500'}`}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
  pending: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
    icon: Clock,
  },
  confirmed: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-700/50',
    icon: CheckCircle2,
  },
  rejected: {
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-700/50',
    icon: XCircle,
  },
  waitlisted: {
    bg: 'bg-slate-800/60',
    text: 'text-slate-300',
    border: 'border-slate-700/50',
    icon: HelpCircle,
  },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    bg: 'bg-slate-800/60',
    text: 'text-slate-300',
    border: 'border-slate-700/50',
    icon: HelpCircle,
  }
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize backdrop-blur-xs ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </span>
  )
}

// ─── Chart Colors (Cyberpunk / Modern Glow) ───────────────────────────────────

const CHART_COLORS = [
  '#6366f1', '#38bdf8', '#06b6d4', '#10b981',
  '#f59e0b', '#a855f7', '#ec4899', '#3b82f6',
  '#14b8a6',
]

// ─── Custom Dark Chart Tooltip ────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl text-xs">
      <p className="font-bold text-slate-200 mb-1">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} className="text-indigo-400 font-mono">
          <span className="text-slate-400">{item.name || 'Count'}: </span>
          <span className="font-bold text-slate-100">{item.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Committee Chart ──────────────────────────────────────────────────────────

export function CommitteeChart({ data }: { data: { name: string; count: number }[] }) {
  if (!data?.length) return <EmptyChart />
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} stroke="#334155" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 500 }} width={80} stroke="#334155" />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Delegates" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Daily Trend Chart ────────────────────────────────────────────────────────

export function DailyTrendChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data?.length) return <EmptyChart />
  const formatted = data.map((d) => ({
    ...d,
    date: d.date ? new Date(d.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '',
  }))
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ left: -10, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
          <Tooltip content={<DarkTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ r: 4, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#6366f1' }}
            name="Registrations"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Department Chart ─────────────────────────────────────────────────────────

export function DepartmentChart({ data }: { data: { name: string; count: number }[] }) {
  if (!data?.length) return <EmptyChart />
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={75}
            innerRadius={42}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Role Chart ───────────────────────────────────────────────────────────────

export function RoleChart({ data }: { data: { role: string; count: number }[] }) {
  if (!data?.length) return <EmptyChart />
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -10, right: 16, top: 4, bottom: 4 }}>
          <XAxis dataKey="role" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
          <Tooltip content={<DarkTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Delegates">
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyChart() {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-1.5 text-slate-500 text-xs font-medium">
      <Layers className="w-5 h-5 text-slate-600" />
      <span>No data recorded yet</span>
    </div>
  )
}

