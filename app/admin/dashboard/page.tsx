import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import {
  KPICard,
  CommitteeChart,
  DailyTrendChart,
  DepartmentChart,
  RoleChart,
} from '@/components/admin/Charts'
import AdminHeader from '@/components/admin/AdminHeader'
import {
  Globe,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Award,
  Building,
} from 'lucide-react'

export const metadata = {
  title: 'Executive Dashboard — EUMUN 2026 Admin',
}

interface StatsData {
  total: number
  today: number
  thisWeek: number
  committeeDistribution: { name: string; fullName: string; count: number }[]
  departmentDistribution: { name: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
  dailyTrend: { date: string; count: number }[]
  roleDistribution: { role: string; count: number }[]
}

async function getStatsDirect(): Promise<StatsData> {
  try {
    const [totalRow] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM delegations'
    ).catch(() => [{ count: '0' }])

    const [todayRow] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM delegations WHERE created_at >= CURRENT_DATE'
    ).catch(() => [{ count: '0' }])

    const [weekRow] = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM delegations WHERE created_at >= DATE_TRUNC('week', NOW())"
    ).catch(() => [{ count: '0' }])

    const committeeRows = await query<{ committee: string; count: string }>(
      'SELECT committee_1st as committee, COUNT(*) as count FROM delegations GROUP BY committee_1st ORDER BY count DESC'
    ).catch(() => [])

    const deptRows = await query<{ department: string; count: string }>(
      'SELECT department, COUNT(*) as count FROM delegations GROUP BY department ORDER BY count DESC LIMIT 10'
    ).catch(() => [])

    const statusRows = await query<{ status: string; count: string }>(
      'SELECT status, COUNT(*) as count FROM delegations GROUP BY status ORDER BY count DESC'
    ).catch(() => [])

    const dailyRows = await query<{ date: string; count: string }>(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM delegations
       WHERE created_at >= NOW() - INTERVAL '14 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    ).catch(() => [])

    const roleRows = await query<{ role: string; count: string }>(
      'SELECT preferred_role as role, COUNT(*) as count FROM delegations GROUP BY preferred_role ORDER BY count DESC'
    ).catch(() => [])

    return {
      total: parseInt(totalRow?.count ?? '0') || 0,
      today: parseInt(todayRow?.count ?? '0') || 0,
      thisWeek: parseInt(weekRow?.count ?? '0') || 0,
      committeeDistribution: (committeeRows || []).map((r) => {
        const full = r?.committee || 'General Committee'
        const short = full.includes('(') ? full.split('(')[0].trim() : full
        return {
          name: short || 'General',
          fullName: full,
          count: parseInt(r?.count ?? '0') || 0,
        }
      }),
      departmentDistribution: (deptRows || []).map((r) => ({
        name: r?.department || 'Unspecified',
        count: parseInt(r?.count ?? '0') || 0,
      })),
      statusDistribution: (statusRows || []).map((r) => ({
        status: r?.status || 'pending',
        count: parseInt(r?.count ?? '0') || 0,
      })),
      dailyTrend: (dailyRows || []).map((r) => ({
        date: r?.date || '',
        count: parseInt(r?.count ?? '0') || 0,
      })),
      roleDistribution: (roleRows || []).map((r) => ({
        role: r?.role || 'Delegate',
        count: parseInt(r?.count ?? '0') || 0,
      })),
    }
  } catch {
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      committeeDistribution: [],
      departmentDistribution: [],
      statusDistribution: [],
      dailyTrend: [],
      roleDistribution: [],
    }
  }
}

export default async function DashboardPage() {
  await getServerSession(authOptions)

  let stats: StatsData = {
    total: 0,
    today: 0,
    thisWeek: 0,
    committeeDistribution: [],
    departmentDistribution: [],
    statusDistribution: [],
    dailyTrend: [],
    roleDistribution: [],
  }

  try {
    stats = await getStatsDirect()
  } catch {
    // Zero state
  }

  const pendingCount =
    stats.statusDistribution.find((s) => s.status === 'pending')?.count ?? 0
  const confirmedCount =
    stats.statusDistribution.find((s) => s.status === 'confirmed')?.count ?? 0

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* ── Background Ambient Glows ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-indigo-900/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-blue-900/15 blur-[130px] rounded-full" />
      </div>

      {/* ── Client Admin Header with Working Sign Out ── */}
      <div className="relative z-10">
        <AdminHeader subtitle="Analytics & Real-time KPIs" />

        {/* ── Dashboard Content ── */}
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">

          {/* Overview Row */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Performance Indicators
              </h2>
              <span className="text-[11px] text-slate-400 font-medium font-mono">
                Envoy: Syed Saimum Hasan
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <KPICard
                label="Total Applications"
                value={stats.total}
                accent
                icon={Users}
              />
              <KPICard
                label="Today's Submissions"
                value={stats.today}
                sub="logged in last 24h"
                icon={Clock}
              />
              <KPICard
                label="This Week"
                value={stats.thisWeek}
                sub="current cycle"
                icon={Calendar}
              />
              <KPICard
                label="Pending Allocation"
                value={pendingCount}
                sub={`${confirmedCount} confirmed`}
                icon={CheckCircle2}
              />
            </div>
          </section>

          {/* Daily Registrations Line Chart */}
          <section className="card-glow-indigo flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Daily Registration Influx</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cumulative trend across preceding 14 days</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">
                14-Day Cycle
              </span>
            </div>
            <DailyTrendChart data={stats.dailyTrend} />
          </section>

          {/* Committee & Role Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="card flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>1st Committee Preference Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Top selected primary committees</p>
                </div>
              </div>
              <CommitteeChart data={stats.committeeDistribution} />
            </section>

            <section className="card flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Preferred Conference Roles</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Delegates vs Chairs vs Press</p>
                </div>
              </div>
              <RoleChart data={stats.roleDistribution} />
            </section>
          </div>

          {/* Department Distribution */}
          <section className="card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span>Department Representation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Academic breakdown of applicants</p>
              </div>
            </div>
            <DepartmentChart data={stats.departmentDistribution} />
          </section>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              href="/admin/dashboard/submissions"
              className="card p-4 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Manage Registry</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5">Browse All {stats.total} Applications</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="card p-4 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Public Portal</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5">Open Live EUMUN 2026 Form</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}

