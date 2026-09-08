import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

declare global {
  // Prevent multiple pool instances in development hot-reload
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
  // eslint-disable-next-line no-var
  var _dbInitialized: boolean | undefined
}

const DATA_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join('/tmp', '.data')
    : path.join(process.cwd(), '.data')
const JSON_FILE = path.join(DATA_DIR, 'delegations.json')


export interface DelegationRecord {
  id: number
  name: string
  department: string
  phone: string
  whatsapp: string
  dob: string
  emergency_contact: string
  email: string
  mun_experience: string
  committee_1st: string
  committee_2nd: string
  preferred_role: string
  campus_envoy: string
  status: string
  created_at: string
  updated_at: string
}

const DEFAULT_NEON_URL =
  'postgresql://neondb_owner:npg_2WOSwBL5oFAP@ep-curly-butterfly-aoekufnp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

function ensureLocalStore(): DelegationRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(JSON_FILE)) {
      fs.writeFileSync(JSON_FILE, JSON.stringify([], null, 2), 'utf8')
      return []
    }
    const data = fs.readFileSync(JSON_FILE, 'utf8')
    return JSON.parse(data || '[]')
  } catch {
    return []
  }
}

function saveLocalStore(records: DelegationRecord[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(JSON_FILE, JSON.stringify(records, null, 2), 'utf8')
  } catch (err) {
    console.error('Failed to write local store:', err)
  }
}

function getConnectionString(): string {
  if (process.env.DATABASE_URL) {
    if (
      (process.env.VERCEL || process.env.NODE_ENV === 'production') &&
      process.env.DATABASE_URL.includes('localhost')
    ) {
      return DEFAULT_NEON_URL
    }
    return process.env.DATABASE_URL
  }
  return DEFAULT_NEON_URL
}

function createPool(): Pool {
  const connectionString = getConnectionString()

  const isRemoteDb =
    connectionString.includes('neon.tech') ||
    connectionString.includes('supabase.co') ||
    connectionString.includes('railway.app') ||
    connectionString.includes('pooler.supabase') ||
    connectionString.includes('sslmode=require') ||
    process.env.DATABASE_SSL === 'true'

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  })
}

const pool = globalThis._pgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool
}

export default pool

async function initSchema(client: any) {
  if (globalThis._dbInitialized) return
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS delegations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        dob DATE NOT NULL,
        emergency_contact VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mun_experience TEXT NOT NULL,
        committee_1st VARCHAR(100) NOT NULL,
        committee_2nd VARCHAR(100) NOT NULL,
        preferred_role VARCHAR(50) NOT NULL DEFAULT 'Delegate',
        campus_envoy VARCHAR(255) NOT NULL DEFAULT 'Syed Saimum Hasan',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    globalThis._dbInitialized = true
  } catch (e) {
    console.warn('[DB] Schema init warning:', e)
  }
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    const client = await pool.connect()
    try {
      await initSchema(client)
      const result = await client.query(text, params)
      return result.rows as T[]
    } finally {
      client.release()
    }
  } catch (pgError) {
    return executeLocalQuery<T>(text, params)
  }
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

function executeLocalQuery<T>(text: string, params: unknown[] = []): T[] {
  const records = ensureLocalStore()
  const sql = text.trim().replace(/\s+/g, ' ')

  // 1. INSERT query
  if (sql.toUpperCase().startsWith('INSERT INTO DELEGATIONS')) {
    const nextId = records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1
    const newRecord: DelegationRecord = {
      id: nextId,
      name: String(params[0] || ''),
      department: String(params[1] || ''),
      phone: String(params[2] || ''),
      whatsapp: String(params[3] || ''),
      dob: String(params[4] || ''),
      emergency_contact: String(params[5] || ''),
      email: String(params[6] || ''),
      mun_experience: String(params[7] || ''),
      committee_1st: String(params[8] || ''),
      committee_2nd: String(params[9] || ''),
      preferred_role: String(params[10] || 'Delegate'),
      campus_envoy: String(params[11] || 'Syed Saimum Hasan'),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    records.unshift(newRecord)
    saveLocalStore(records)
    return [{ id: newRecord.id }] as unknown as T[]
  }

  // 2. Email check query
  if (sql.includes('WHERE email = $1')) {
    const email = String(params[0] || '').toLowerCase()
    const match = records.filter((r) => r.email?.toLowerCase() === email)
    return match as unknown as T[]
  }

  // 3. SELECT * FROM delegations WHERE id = $1
  if (sql.includes('WHERE id = $1') && sql.toUpperCase().startsWith('SELECT')) {
    const id = Number(params[0])
    const match = records.filter((r) => r.id === id)
    return match as unknown as T[]
  }

  // 4. UPDATE delegations SET status = $1 WHERE id = $2
  if (sql.toUpperCase().startsWith('UPDATE DELEGATIONS')) {
    const status = String(params[0] || 'pending')
    const id = Number(params[1])
    const index = records.findIndex((r) => r.id === id)
    if (index !== -1) {
      records[index].status = status
      records[index].updated_at = new Date().toISOString()
      saveLocalStore(records)
      return [records[index]] as unknown as T[]
    }
    return []
  }

  // 5. DELETE FROM delegations WHERE id = $1
  if (sql.toUpperCase().startsWith('DELETE FROM DELEGATIONS')) {
    const id = Number(params[0])
    const filtered = records.filter((r) => r.id !== id)
    saveLocalStore(filtered)
    return [{ success: true }] as unknown as T[]
  }

  // 6. TOTAL COUNT
  if (sql.includes('COUNT(*)') && !sql.includes('WHERE') && !sql.includes('GROUP BY')) {
    return [{ count: String(records.length) }] as unknown as T[]
  }

  // 7. TODAY COUNT
  if (sql.includes('COUNT(*)') && sql.includes('CURRENT_DATE')) {
    const today = new Date().toISOString().split('T')[0]
    const count = records.filter((r) => r.created_at?.startsWith(today)).length
    return [{ count: String(count) }] as unknown as T[]
  }

  // 8. THIS WEEK COUNT
  if (sql.includes('COUNT(*)') && (sql.includes("DATE_TRUNC('week'") || sql.includes('week'))) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const count = records.filter((r) => (r.created_at || '') >= sevenDaysAgo).length
    return [{ count: String(count) }] as unknown as T[]
  }

  // 9. Committee distribution
  if (sql.includes('GROUP BY committee_1st')) {
    const map = new Map<string, number>()
    for (const r of records) {
      const comm = r.committee_1st || 'Unknown'
      map.set(comm, (map.get(comm) || 0) + 1)
    }
    const res = Array.from(map.entries()).map(([committee, count]) => ({
      committee,
      count: String(count),
    }))
    res.sort((a, b) => parseInt(b.count) - parseInt(a.count))
    return res as unknown as T[]
  }

  // 10. Department distribution
  if (sql.includes('GROUP BY department')) {
    const map = new Map<string, number>()
    for (const r of records) {
      const dept = r.department || 'Unknown'
      map.set(dept, (map.get(dept) || 0) + 1)
    }
    const res = Array.from(map.entries()).map(([department, count]) => ({
      department,
      count: String(count),
    }))
    res.sort((a, b) => parseInt(b.count) - parseInt(a.count))
    return res.slice(0, 10) as unknown as T[]
  }

  // 11. Status distribution
  if (sql.includes('GROUP BY status')) {
    const map = new Map<string, number>()
    for (const r of records) {
      const st = r.status || 'pending'
      map.set(st, (map.get(st) || 0) + 1)
    }
    const res = Array.from(map.entries()).map(([status, count]) => ({
      status,
      count: String(count),
    }))
    res.sort((a, b) => parseInt(b.count) - parseInt(a.count))
    return res as unknown as T[]
  }

  // 12. Daily Trend
  if (sql.includes('DATE(created_at) as date')) {
    const map = new Map<string, number>()
    for (const r of records) {
      const d = (r.created_at || '').split('T')[0]
      if (d) map.set(d, (map.get(d) || 0) + 1)
    }
    const res = Array.from(map.entries()).map(([date, count]) => ({
      date,
      count: String(count),
    }))
    res.sort((a, b) => a.date.localeCompare(b.date))
    return res as unknown as T[]
  }

  // 13. Role distribution
  if (sql.includes('GROUP BY preferred_role')) {
    const map = new Map<string, number>()
    for (const r of records) {
      const role = r.preferred_role || 'Delegate'
      map.set(role, (map.get(role) || 0) + 1)
    }
    const res = Array.from(map.entries()).map(([role, count]) => ({
      role,
      count: String(count),
    }))
    res.sort((a, b) => parseInt(b.count) - parseInt(a.count))
    return res as unknown as T[]
  }

  // 14. Submissions listing with filter & pagination
  let filtered = [...records]
  for (const param of params) {
    if (typeof param === 'string') {
      const p = param.replace(/%/g, '').toLowerCase()
      if (p) {
        filtered = filtered.filter(
          (r) =>
            r.name?.toLowerCase().includes(p) ||
            r.email?.toLowerCase().includes(p) ||
            r.department?.toLowerCase().includes(p) ||
            r.phone?.toLowerCase().includes(p) ||
            r.status?.toLowerCase() === p ||
            r.committee_1st?.toLowerCase() === p
        )
      }
    }
  }

  if (sql.includes('SELECT COUNT(*) as count FROM delegations')) {
    return [{ count: String(filtered.length) }] as unknown as T[]
  }

  const limitParam = typeof params[params.length - 2] === 'number' ? (params[params.length - 2] as number) : 25
  const offsetParam = typeof params[params.length - 1] === 'number' ? (params[params.length - 1] as number) : 0

  const paged = filtered.slice(offsetParam, offsetParam + limitParam)
  return paged as unknown as T[]
}
