import { z } from 'zod'

export const COMMITTEES = [
  'UNSC (United Nations Security Council)',
  'ICJ (International Court of Justice)',
  'SPECPOL (Special Political and Decolonization Committee)',
  'DISEC (Disarmament and International Security Committee)',
  'IP (International Press)',
  'BFIU (Bangladesh Financial Intelligence Unit)',
  'UNHRC (United Nations Human Rights Council)',
  'UNDP (United Nations Development Programme)',
  'OPEC (Organization of the Petroleum Exporting Countries)',
] as const

export type Committee = (typeof COMMITTEES)[number]

export const ROLES = ['Delegate', 'Chair', 'IP Reporter', 'Crisis Director'] as const
export type Role = (typeof ROLES)[number]

export const STATUSES = ['pending', 'confirmed', 'rejected', 'waitlisted'] as const
export type Status = (typeof STATUSES)[number]

export const delegationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name too long')
    .trim(),
  department: z
    .string()
    .min(2, 'Department/batch is required')
    .max(255, 'Department too long')
    .trim(),
  phone: z
    .string()
    .min(7, 'Phone number too short')
    .max(30, 'Phone number too long')
    .regex(/^[+\d\s\-()]+$/, 'Invalid phone number format')
    .trim(),
  whatsapp: z
    .string()
    .min(7, 'WhatsApp number too short')
    .max(30, 'WhatsApp number too long')
    .regex(/^[+\d\s\-()]+$/, 'Invalid WhatsApp number format')
    .trim(),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid date format' }),
  emergency_contact: z
    .string()
    .min(7, 'Emergency contact too short')
    .max(255, 'Emergency contact too long')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .trim()
    .toLowerCase(),
  mun_experience: z
    .string()
    .min(10, 'Please provide at least a brief MUN experience description')
    .max(5000, 'Too long — max 5000 characters')
    .trim(),
  committee_1st: z.enum(COMMITTEES, { errorMap: () => ({ message: 'Select your 1st committee preference' }) }),
  committee_2nd: z.enum(COMMITTEES, { errorMap: () => ({ message: 'Select your 2nd committee preference' }) }),
  preferred_role: z.enum(ROLES, { errorMap: () => ({ message: 'Select your preferred role' }) }),
  campus_envoy: z.string().default('Syed Saimum Hasan'),
}).refine(
  (data) => data.committee_1st !== data.committee_2nd,
  {
    message: '1st and 2nd committee preferences must be different',
    path: ['committee_2nd'],
  }
)

export type DelegationInput = z.infer<typeof delegationSchema>

export interface Delegation extends DelegationInput {
  id: number
  status: Status
  created_at: string
  updated_at: string
}
