import { NextResponse } from 'next/server'
import { delegationSchema } from '@/lib/types'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = delegationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const {
      name, department, phone, whatsapp, dob,
      emergency_contact, email, mun_experience,
      committee_1st, committee_2nd, preferred_role, campus_envoy,
    } = parsed.data

    // Check for duplicate email
    const existing = await query(
      'SELECT id FROM delegations WHERE email = $1',
      [email]
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An application with this email already exists.' },
        { status: 409 }
      )
    }

    const rows = await query<{ id: number }>(
      `INSERT INTO delegations
        (name, department, phone, whatsapp, dob, emergency_contact, email,
         mun_experience, committee_1st, committee_2nd, preferred_role, campus_envoy)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        name, department, phone, whatsapp, dob,
        emergency_contact, email, mun_experience,
        committee_1st, committee_2nd, preferred_role, campus_envoy,
      ]
    )

    return NextResponse.json({ success: true, id: rows[0].id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/submit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
