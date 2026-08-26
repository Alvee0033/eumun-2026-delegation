import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')))
  const search = searchParams.get('search')?.trim() ?? ''
  const status = searchParams.get('status') ?? ''
  const committee = searchParams.get('committee') ?? ''
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  if (search) {
    conditions.push(
      `(name ILIKE $${i} OR email ILIKE $${i} OR department ILIKE $${i} OR phone ILIKE $${i})`
    )
    params.push(`%${search}%`)
    i++
  }
  if (status) {
    conditions.push(`status = $${i}`)
    params.push(status)
    i++
  }
  if (committee) {
    conditions.push(`committee_1st = $${i}`)
    params.push(committee)
    i++
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const [countRow] = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM delegations ${where}`,
      params
    )

    const rows = await query(
      `SELECT id, name, department, phone, whatsapp, email,
              committee_1st, committee_2nd, preferred_role, status,
              campus_envoy, created_at
       FROM delegations
       ${where}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      data: rows,
      pagination: {
        total: parseInt(countRow?.count ?? '0'),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countRow?.count ?? '0') / limit),
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/submissions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
