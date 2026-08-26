import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { STATUSES } from '@/lib/types'

interface Params {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const row = await queryOne(
      'SELECT * FROM delegations WHERE id = $1',
      [id]
    )
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (err) {
    console.error('[GET /api/admin/submissions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const body = await req.json()
    const { status } = body

    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const row = await queryOne(
      'UPDATE delegations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (err) {
    console.error('[PATCH /api/admin/submissions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    await query('DELETE FROM delegations WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/submissions/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
