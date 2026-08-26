import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [totalRow] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM delegations'
    ).catch(() => [{ count: '0' }])

    const [todayRow] = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM delegations WHERE created_at >= CURRENT_DATE"
    ).catch(() => [{ count: '0' }])

    const [weekRow] = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM delegations WHERE created_at >= DATE_TRUNC('week', NOW())"
    ).catch(() => [{ count: '0' }])

    const committeeRows = await query<{ committee: string; count: string }>(
      `SELECT committee_1st as committee, COUNT(*) as count
       FROM delegations
       GROUP BY committee_1st
       ORDER BY count DESC`
    ).catch(() => [])

    const deptRows = await query<{ department: string; count: string }>(
      `SELECT department, COUNT(*) as count
       FROM delegations
       GROUP BY department
       ORDER BY count DESC
       LIMIT 10`
    ).catch(() => [])

    const statusRows = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count
       FROM delegations
       GROUP BY status
       ORDER BY count DESC`
    ).catch(() => [])

    const dailyRows = await query<{ date: string; count: string }>(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM delegations
       WHERE created_at >= NOW() - INTERVAL '14 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    ).catch(() => [])

    const roleRows = await query<{ role: string; count: string }>(
      `SELECT preferred_role as role, COUNT(*) as count
       FROM delegations
       GROUP BY preferred_role
       ORDER BY count DESC`
    ).catch(() => [])

    return NextResponse.json({
      total: parseInt(totalRow?.count ?? '0') || 0,
      today: parseInt(todayRow?.count ?? '0') || 0,
      thisWeek: parseInt(weekRow?.count ?? '0') || 0,
      committeeDistribution: (committeeRows || []).map((r) => {
        const full = r?.committee || 'General'
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
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

